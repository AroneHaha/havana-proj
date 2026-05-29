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

import { API_BASE, checkApiAvailability, setApiAvailable, getApiUnavailableMessage, type FieldErrors, type LaravelValidationErrorResponse } from "@/lib/api-config";
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

/**
 * Shape of the INNER data object returned by Laravel's respondWithData().
 * All backend responses are wrapped in { data: { ... } } — this type
 * represents what's inside the "data" key.
 */
interface LaravelAuthData {
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: "customer" | "admin";
    email_verified_at?: string | null;
  };
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
}

/** Full Laravel response: outer { data: ... } wrapper from respondWithData() */
interface LaravelLoginResponse {
  data: LaravelAuthData;
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
    password: "password",
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
    setAuthCookie(token, user.role);
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
 * Set a session cookie so Next.js middleware can check authentication
 * AND role server-side (before the page renders).
 *
 * SECURITY: We store a minimal JSON string { r: "admin" | "customer" },
 * NOT the raw JWT. The actual JWT lives in localStorage (client-only).
 * This prevents the token from being accessible via `document.cookie` (XSS).
 *
 * The middleware checks both cookie existence and role:
 *   `if (isAdminRoute && !cookie || role !== "admin") → redirect to /login`
 *
 * Cookie format: `havana-auth-token={"r":"admin"}` (base64-free, compact)
 * This is NOT cryptographically secure — it's a UX guard to prevent
 * flash of admin content. Real authorization is enforced by:
 *   1. Client-side admin layout: `user.role === "admin"` (Zustand store)
 *   2. Backend: `auth:sanctum` + `admin` middleware on every API call
 *
 * For true HTTP-only cookies (Phase 2), Laravel will set the cookie
 * server-side on login, and we can remove this client-side fallback.
 */
function setAuthCookie(_token: string, role?: "admin" | "customer") {
  if (typeof document === "undefined") return;
  const value = encodeURIComponent(JSON.stringify({ r: role ?? "customer" }));
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `havana-auth-token=${value}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax${secure}`;
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

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });
    // Mark API as available on any successful fetch
    setApiAvailable(true);
  } catch (fetchErr) {
    // fetch() only throws on network errors (DNS failure, connection refused, CORS block)
    // — NOT on 4xx/5xx HTTP responses.
    setApiAvailable(false);
    throw new AuthError(
      getApiUnavailableMessage(),
      "NETWORK_ERROR"
    );
  }

  // Debug: log the response status for non-GET requests (dev only)
  if (process.env.NODE_ENV === 'development' && options.method && options.method !== "GET") {
    console.log(`[Auth] ${options.method} ${API_BASE}${path} → ${res.status} ${res.statusText}`);
  }

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
    // Read raw text first for debugging, then parse as JSON
    const text = await res.text();
    if (!text || text.trim() === '') {
      if (process.env.NODE_ENV === 'development') {
        console.error('[Auth] Empty response body from', res.url, 'Status:', res.status);
      }
      throw new AuthError('Server returned an empty response', 'UNKNOWN');
    }
    try {
      return JSON.parse(text) as T;
    } catch (parseErr) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[Auth] Failed to parse JSON response:', text.substring(0, 500));
      }
      throw new AuthError('Server returned invalid JSON', 'UNKNOWN');
    }
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
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${refreshToken}`,
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!res.ok) return false;

      const json = await res.json();
      // Backend wraps in { data: { access_token, refresh_token, ... } }
      const data = json.data ?? json;
      if (data.access_token) {
        localStorage.setItem(TOKEN_KEY, data.access_token);
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

function mapLaravelUser(raw: LaravelAuthData["user"]): AuthUser {
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
      if (process.env.NODE_ENV === 'development') {
        console.log("[Auth] Logging in to:", `${API_BASE}/auth/login`);
      }
      const response = await authFetch<Record<string, unknown>>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (process.env.NODE_ENV === 'development') {
        console.log("[Auth] Login raw response:", JSON.stringify(response).substring(0, 800));
      }

      // ── Flexible response unwrapping ──
      // Backend returns { data: { user, access_token, ... } } via respondWithData()
      // But we handle both wrapped and flat formats for robustness
      let inner: LaravelAuthData | null = null;

      if (response && typeof response === 'object') {
        // Check if it's wrapped in { data: { ... } }
        const maybeData = response.data;
        if (maybeData && typeof maybeData === 'object' && (maybeData as Record<string, unknown>).access_token) {
          inner = maybeData as unknown as LaravelAuthData;
        }
        // Check if it's flat (no wrapper) — access_token at top level
        else if ((response as Record<string, unknown>).access_token) {
          inner = response as unknown as LaravelAuthData;
        }
      }

      if (!inner || !inner.user || !inner.access_token) {
        if (process.env.NODE_ENV === 'development') {
          console.error("[Auth] Unexpected response structure. Full response:", JSON.stringify(response, null, 2));
        }
        throw new AuthError(
          "Unexpected server response format. Check browser console for details.",
          "UNKNOWN"
        );
      }
      const user = mapLaravelUser(inner.user);
      storeUser(user, inner.access_token, inner.refresh_token);
      return { user, token: inner.access_token, refreshToken: inner.refresh_token };
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error("[Auth] Login error:", err);
      }
      if (err instanceof AuthError) throw err;
      // Unexpected non-AuthError — wrap as network error with helpful message
      throw new AuthError(
        err instanceof Error ? err.message : "Login failed",
        "NETWORK_ERROR"
      );
    }
  }

  // ── Mock login (API not configured) ──
  if (process.env.NODE_ENV === 'production') {
    console.warn(
      "[Auth] WARNING: Running in mock auth mode in production! " +
      "Set NEXT_PUBLIC_API_URL to connect to the backend. " +
      "Mock credentials (admin@gmail.com / password) are active."
    );
  }
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
      const response = await authFetch<LaravelRegisterResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          password: data.password,
          password_confirmation: data.passwordConfirmation,
        }),
      });

      // Unwrap the { data: { ... } } wrapper from Laravel's respondWithData()
      const inner = response.data;
      const user = mapLaravelUser(inner.user);
      // Don't auto-login after register — user needs to verify email first
      // (Laravel will send verification email). Only store tokens AFTER verification.
      // The auth-store's register action will NOT set the user — caller must
      // show a "check your email" screen instead.
      return { user, token: inner.access_token, refreshToken: inner.refresh_token };
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
    // Backend's respondWithData() wraps in { data: { ... } }
    const response = await authFetch<{ data: { user: LaravelAuthData["user"] } }>("/auth/me");
    return mapLaravelUser(response.data.user);
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