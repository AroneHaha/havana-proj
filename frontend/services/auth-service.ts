/**
 * Auth Service — production-ready for Laravel + Supabase.
 *
 * Architecture:
 *   1. All HTTP calls go through `authFetch()` which attaches the JWT
 *      Authorization header and handles token refresh transparently.
 *   2. Laravel validation errors (422) are mapped to strongly-typed
 *      `AuthError` objects so the UI can show per-field messages.
 *   3. When `NEXT_PUBLIC_API_URL` is not set (dev without backend),
 *      everything falls back to mock — zero config needed.
 *   4. Token storage uses `havana-token` / `havana-refresh-token` keys
 *      so swapping to Supabase Auth cookies later is a one-line change.
 *
 * Expected Laravel endpoints (Sanctum / Passport):
 *   POST /auth/login           { email, password }
 *   POST /auth/register        { first_name, last_name, email, password, password_confirmation }
 *   POST /auth/logout
 *   POST /auth/forgot-password { email }
 *   POST /auth/reset-password  { token, email, password, password_confirmation }
 *   POST /auth/refresh         { refresh_token }
 *   GET  /auth/me              → current user
 *
 * When Supabase Auth is added:
 *   - Replace `authFetch` with Supabase client methods
 *   - The `AuthUser` shape stays the same (Supabase user → our AuthUser mapping)
 *   - Token refresh is handled by Supabase SDK automatically
 */

import { API_BASE, type FieldErrors, type LaravelValidationErrorResponse } from "@/lib/api-config";
import { AppError } from "@/lib/app-error";

// ─── Types ────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "customer" | "admin";
  /** Supabase auth provider — only populated when backend is live */
  provider?: "email" | "google" | "apple";
  /** Whether email has been verified — Laravel will set this */
  emailVerified?: boolean;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  refreshToken?: string;
}

// FieldErrors is now imported from lib/api-config
export type { FieldErrors };

export class AuthError extends AppError {
  declare code:
    | "INVALID_CREDENTIALS"
    | "EMAIL_NOT_FOUND"
    | "NETWORK_ERROR"
    | "VALIDATION_ERROR"
    | "EMAIL_ALREADY_TAKEN"
    | "WEAK_PASSWORD"
    | "TOKEN_EXPIRED"
    | "UNKNOWN";

  constructor(
    message: string,
    code: AuthError["code"],
    fields: FieldErrors = {}
  ) {
    super(message, code, fields);
    this.name = "AuthError";
  }
}

// ─── Laravel API response shapes ──────────────────────────────────────

interface LaravelLoginResponse {
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: "customer" | "admin";
    email_verified_at?: string | null;
  };
  token: string;
  refresh_token?: string;
}

interface LaravelRegisterResponse extends LaravelLoginResponse {}

// LaravelValidationErrorResponse is now imported from lib/api-config

// ─── Storage keys ─────────────────────────────────────────────────────

/** Zustand persist key for auth store — single source of truth for user data */
const AUTH_STORE_KEY = "havana-auth";
const TOKEN_KEY = "havana-token";
const REFRESH_TOKEN_KEY = "havana-refresh-token";

// ─── Mock credential store ────────────────────────────────────────────

const MOCK_ACCOUNTS: Record<
  string,
  {
    password: string;
    role: "admin" | "customer";
    firstName: string;
    lastName: string;
    emailVerified: boolean;
  }
> = {
  "admin@gmail.com": {
    password: "admin",
    role: "admin",
    firstName: "Admin",
    lastName: "Havana",
    emailVerified: true,
  },
};

// ─── Storage helpers ──────────────────────────────────────────────────

function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    // Read from the Zustand persist key — single source of truth.
    // The persist format is: { state: { user: ... }, version: 0 }
    const raw = localStorage.getItem(AUTH_STORE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.user ?? null;
  } catch {
    return null;
  }
}

function storeUser(user: AuthUser, token?: string, refreshToken?: string) {
  // NOTE: User data is no longer stored here — the auth-store's Zustand persist
  // (key: "havana-auth") is the single source of truth for user data.
  // This function only stores the JWT token and sets the auth cookie.
  // The auth-store's login/register actions call set({ user }) which triggers
  // the persist middleware to write to localStorage automatically.
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

  // Also set a cookie for middleware route protection (server-side accessible)
  // Cookie exists so middleware can check it; not truly HTTP-only (see setAuthCookie docs)
  if (token) {
    setAuthCookie(token);
  }
}

function clearStored() {
  // Clear tokens — the auth-store's persist will handle clearing user data
  // when the store sets user: null via the logout action.
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  removeAuthCookie();
}

// ─── Cookie helpers (for middleware route protection) ──────────────────

/**
 * Set a non-sensitive session-indicator cookie so Next.js middleware
 * can check for authentication server-side (before the page renders).
 *
 * SECURITY: We store only a truthy indicator ("1"), NOT the raw JWT.
 * The actual JWT lives in localStorage (client-only). This prevents
 * the token from being accessible via `document.cookie` (XSS).
 *
 * The middleware only checks cookie existence, not its value:
 *   `if (isAdminRoute && !token) → redirect to /login`
 *
 * For true HTTP-only cookies (Phase 2), Laravel will set the cookie
 * server-side on login, and we can remove this client-side fallback.
 */
function setAuthCookie(_token: string) {
  if (typeof document === "undefined") return;
  document.cookie = `havana-auth-token=1; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

/**
 * Remove the auth cookie on logout.
 */
function removeAuthCookie() {
  if (typeof document === "undefined") return;
  document.cookie = "havana-auth-token=; path=/; max-age=0";
}

// ─── Auth-aware fetch ─────────────────────────────────────────────────

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

/**
 * In-flight request deduplication for authFetch.
 * Prevents duplicate network calls when React 18 StrictMode double-mounts.
 * Only applies to GET requests — writes always go through.
 */
const authPendingRequests = new Map<string, Promise<unknown>>();

/**
 * Fetch wrapper that:
 *  1. Attaches the Bearer token automatically
 *  2. On 401, tries to refresh the token once and retries
 *  3. Maps Laravel error responses to AuthError
 *  4. Deduplicates in-flight GET requests
 */
export async function authFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();

  // Only dedup GET requests — writes must always execute
  if (method === "GET") {
    const cacheKey = `GET:${path}:${JSON.stringify(options.body ?? "")}`;
    const existing = authPendingRequests.get(cacheKey);
    if (existing) return existing as Promise<T>;

    const promise = authFetchInner<T>(path, options).finally(() => {
      authPendingRequests.delete(cacheKey);
    });
    authPendingRequests.set(cacheKey, promise);
    return promise;
  }

  return authFetchInner<T>(path, options);
}

async function authFetchInner<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;

  // When the body is FormData, do NOT set Content-Type — the browser must
  // set it automatically with the correct multipart/form-data boundary.
  // Forcing application/json breaks all file uploads (product images, etc.).
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  // ── Token expired → try refresh ──
  if (res.status === 401 && token) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      const newToken = localStorage.getItem(TOKEN_KEY);
      headers["Authorization"] = `Bearer ${newToken}`;
      const retry = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
      });
      return handleResponse<T>(retry);
    }
    // Refresh failed → force logout
    clearStored();
    throw new AuthError("Session expired. Please sign in again.", "TOKEN_EXPIRED");
  }

  return handleResponse<T>(res);
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) {
    return res.json() as Promise<T>;
  }

  // ── Laravel validation error (422) ──
  if (res.status === 422) {
    try {
      const body: LaravelValidationErrorResponse = await res.json();
      const fieldErrors = body.errors ?? {};
      throw new AuthError(body.message, "VALIDATION_ERROR", fieldErrors);
    } catch (err) {
      if (err instanceof AuthError) throw err;
      throw new AuthError("Validation failed", "VALIDATION_ERROR");
    }
  }

  // ── Invalid credentials (401) ──
  if (res.status === 401) {
    throw new AuthError("Invalid credentials", "INVALID_CREDENTIALS");
  }

  // ── Other errors ──
  throw new AuthError(
    `Request failed: ${res.status} ${res.statusText}`,
    "UNKNOWN"
  );
}

async function tryRefreshToken(): Promise<boolean> {
  if (isRefreshing && refreshPromise) return refreshPromise;

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) return false;

      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!res.ok) return false;

      const data = await res.json();
      if (data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
        if (data.refresh_token) {
          localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
        }
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ─── Map Laravel user → AuthUser ──────────────────────────────────────

function mapLaravelUser(raw: LaravelLoginResponse["user"]): AuthUser {
  return {
    id: String(raw.id),
    email: raw.email,
    firstName: raw.first_name,
    lastName: raw.last_name,
    role: raw.role,
    emailVerified: !!raw.email_verified_at,
  };
}

// ─── Public API ───────────────────────────────────────────────────────

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  // ── Try real API first ──
  if (API_BASE) {
    try {
      const data = await authFetch<LaravelLoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const user = mapLaravelUser(data.user);
      storeUser(user, data.token, data.refresh_token);
      return { user, token: data.token, refreshToken: data.refresh_token };
    } catch (err) {
      if (err instanceof AuthError) throw err;
      throw new AuthError(
        err instanceof Error ? err.message : "Login failed",
        "NETWORK_ERROR"
      );
    }
  }

  // ── Mock login ──
  await new Promise((r) => setTimeout(r, 600));

  const account = MOCK_ACCOUNTS[email.toLowerCase()];

  if (!account || account.password !== password) {
    throw new AuthError("Invalid credentials", "INVALID_CREDENTIALS");
  }

  const user: AuthUser = {
    id: account.role === "admin" ? "admin-001" : `user-${Date.now()}`,
    email,
    firstName: account.firstName,
    lastName: account.lastName,
    role: account.role,
    emailVerified: account.emailVerified,
  };

  const mockToken = "mock-token-" + Date.now();
  storeUser(user, mockToken);
  return { user, token: mockToken };
}

export async function register(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}): Promise<AuthResponse> {
  // ── Try real API first ──
  if (API_BASE) {
    try {
      const res = await authFetch<LaravelRegisterResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          password: data.password,
          password_confirmation: data.passwordConfirmation,
        }),
      });

      const user = mapLaravelUser(res.user);
      // Don't auto-login after register — user needs to verify email first
      // (Laravel will send verification email). Only store tokens AFTER verification.
      // The auth-store's register action will NOT set the user — caller must
      // show a "check your email" screen instead.
      return { user, token: res.token, refreshToken: res.refresh_token };
    } catch (err) {
      if (err instanceof AuthError) {
        // Map Laravel field errors to our error codes for easier UI handling
        if (err.code === "VALIDATION_ERROR") {
          if (err.fields.email) {
            throw new AuthError(err.fields.email[0], "EMAIL_ALREADY_TAKEN", err.fields);
          }
          if (err.fields.password) {
            throw new AuthError(err.fields.password[0], "WEAK_PASSWORD", err.fields);
          }
        }
        throw err;
      }
      throw new AuthError(
        err instanceof Error ? err.message : "Registration failed",
        "NETWORK_ERROR"
      );
    }
  }

  // ── Mock register ──
  await new Promise((r) => setTimeout(r, 600));

  // Check if email already exists in mock
  if (MOCK_ACCOUNTS[data.email.toLowerCase()]) {
    throw new AuthError("This email is already registered.", "EMAIL_ALREADY_TAKEN");
  }

  const user: AuthUser = {
    id: `user-${Date.now()}`,
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    role: "customer",
    emailVerified: false,
  };

  MOCK_ACCOUNTS[data.email.toLowerCase()] = {
    password: data.password,
    role: "customer",
    firstName: data.firstName,
    lastName: data.lastName,
    emailVerified: false,
  };

  const mockToken = "mock-token-" + Date.now();
  storeUser(user, mockToken);
  return { user, token: mockToken };
}

export async function forgotPassword(email: string): Promise<boolean> {
  if (API_BASE) {
    try {
      await authFetch<{ message: string }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      return true;
    } catch (err) {
      if (err instanceof AuthError && err.code === "VALIDATION_ERROR") {
        throw err;
      }
      return false;
    }
  }

  // Mock — always succeed
  await new Promise((r) => setTimeout(r, 400));
  return true;
}

export async function resetPassword(data: {
  token: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}): Promise<boolean> {
  if (API_BASE) {
    try {
      await authFetch<{ message: string }>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          token: data.token,
          email: data.email,
          password: data.password,
          password_confirmation: data.passwordConfirmation,
        }),
      });
      return true;
    } catch {
      return false;
    }
  }

  // Mock
  await new Promise((r) => setTimeout(r, 400));
  return true;
}

export async function getCurrentUserFromAPI(): Promise<AuthUser | null> {
  if (!API_BASE) return getStoredUser();

  try {
    const data = await authFetch<{ user: LaravelLoginResponse["user"] }>("/auth/me");
    return mapLaravelUser(data.user);
  } catch {
    // API is configured but call failed (token revoked, account suspended, etc.).
    // Do NOT fall back to stale localStorage — that would show a ghost-authenticated
    // state with potentially outdated role/permissions.
    return null;
  }
}

export async function logout() {
  // If API is live, invalidate server-side session BEFORE clearing local state.
  // Awaiting ensures the Sanctum token is actually revoked on the backend.
  if (API_BASE) {
    try {
      await authFetch("/auth/logout", { method: "POST" });
    } catch {
      // Server logout failed — still clear local state to avoid leaving
      // the user stuck on a "logged in" screen with a dead session.
    }
  }
  clearStored();
}

export function getCurrentUser(): AuthUser | null {
  return getStoredUser();
}

export function isAuthenticated(): boolean {
  return getStoredUser() !== null;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}
