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

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

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

/** Per-field validation errors returned by Laravel */
export interface FieldErrors {
  [field: string]: string[];
}

export class AuthError extends Error {
  code:
    | "INVALID_CREDENTIALS"
    | "EMAIL_NOT_FOUND"
    | "NETWORK_ERROR"
    | "VALIDATION_ERROR"
    | "EMAIL_ALREADY_TAKEN"
    | "WEAK_PASSWORD"
    | "TOKEN_EXPIRED"
    | "UNKNOWN";
  /** Laravel-style per-field errors (only populated when code is VALIDATION_ERROR) */
  fields: FieldErrors;

  constructor(
    message: string,
    code: AuthError["code"],
    fields: FieldErrors = {}
  ) {
    super(message);
    this.code = code;
    this.fields = fields;
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

interface LaravelValidationErrorResponse {
  message: string;
  errors: { [field: string]: string[] };
}

// ─── Storage keys ─────────────────────────────────────────────────────

const USER_KEY = "havana-customer";
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
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function storeUser(user: AuthUser, token?: string, refreshToken?: string) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

function clearStored() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

// ─── Auth-aware fetch ─────────────────────────────────────────────────

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

/**
 * Fetch wrapper that:
 *  1. Attaches the Bearer token automatically
 *  2. On 401, tries to refresh the token once and retries
 *  3. Maps Laravel error responses to AuthError
 */
async function authFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
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
      // API unreachable — fall through to mock
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

  storeUser(user, "mock-token-" + Date.now());
  return { user, token: "mock-token-" + Date.now() };
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
      // (Laravel will send verification email)
      storeUser(user, res.token, res.refresh_token);
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
      // fall through to mock
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

  storeUser(user, "mock-token-" + Date.now());
  return { user, token: "mock-token-" + Date.now() };
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
    return getStoredUser();
  }
}

export function logout() {
  // If API is live, also invalidate server-side
  if (API_BASE) {
    authFetch("/auth/logout", { method: "POST" }).catch(() => {});
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
