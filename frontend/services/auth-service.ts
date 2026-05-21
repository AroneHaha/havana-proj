/**
 * Auth Service — backend-proof authentication.
 *
 * While no Laravel backend exists, login/signup is simulated with
 * known credentials + localStorage. When the API is live, just swap
 * the implementations — the component code stays identical.
 *
 * Expected Laravel endpoints:
 *   POST /auth/login    { email, password }
 *   POST /auth/register { first_name, last_name, email, password }
 *   POST /auth/logout
 *   POST /auth/forgot-password { email }
 *   POST /auth/refresh
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

// ─── Types ────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "customer" | "admin";
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export class AuthError extends Error {
  code: "INVALID_CREDENTIALS" | "EMAIL_NOT_FOUND" | "NETWORK_ERROR";
  constructor(message: string, code: AuthError["code"]) {
    super(message);
    this.code = code;
  }
}

// ─── Mock credential store ────────────────────────────────────────────
// While there's no DB, these are the only valid accounts.
// When Laravel is live, this entire block is bypassed.

const MOCK_ACCOUNTS: Record<string, { password: string; role: "admin" | "customer"; firstName: string; lastName: string }> = {
  "admin@gmail.com": { password: "admin", role: "admin", firstName: "Admin", lastName: "Havana" },
};

// ─── Storage keys ─────────────────────────────────────────────────────

const CUSTOMER_KEY = "havana-customer";
const TOKEN_KEY = "havana-token";

// ─── Helpers ──────────────────────────────────────────────────────────

function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CUSTOMER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function storeUser(user: AuthUser, token?: string) {
  localStorage.setItem(CUSTOMER_KEY, JSON.stringify(user));
  if (token) localStorage.setItem(TOKEN_KEY, token);
}

function clearStored() {
  localStorage.removeItem(CUSTOMER_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

// ─── Public API ───────────────────────────────────────────────────────

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  // ── Try real API first ──
  if (API_BASE) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        storeUser(data.user, data.token);
        return data;
      }

      if (res.status === 401) {
        throw new AuthError("Invalid credentials", "INVALID_CREDENTIALS");
      }
    } catch (err) {
      if (err instanceof AuthError) throw err;
      // API unreachable — fall through to mock
    }
  }

  // ── Mock login — validate against known accounts ──
  await new Promise((r) => setTimeout(r, 600)); // simulate latency

  const account = MOCK_ACCOUNTS[email.toLowerCase()];

  if (!account) {
    throw new AuthError("Invalid credentials", "INVALID_CREDENTIALS");
  }

  if (account.password !== password) {
    throw new AuthError("Invalid credentials", "INVALID_CREDENTIALS");
  }

  const user: AuthUser = {
    id: account.role === "admin" ? "admin-001" : `user-${Date.now()}`,
    email,
    firstName: account.firstName,
    lastName: account.lastName,
    role: account.role,
  };

  storeUser(user, "mock-token-" + Date.now());
  return { user, token: "mock-token-" + Date.now() };
}

export async function register(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  // ── Try real API first ──
  if (API_BASE) {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          password: data.password,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        storeUser(json.user, json.token);
        return json;
      }
    } catch {
      // fall through
    }
  }

  // ── Mock register — add to local mock store ──
  await new Promise((r) => setTimeout(r, 600));

  const user: AuthUser = {
    id: `user-${Date.now()}`,
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    role: "customer",
  };

  // Also add to MOCK_ACCOUNTS so they can log in again this session
  MOCK_ACCOUNTS[data.email.toLowerCase()] = {
    password: data.password,
    role: "customer",
    firstName: data.firstName,
    lastName: data.lastName,
  };

  storeUser(user, "mock-token-" + Date.now());
  return { user, token: "mock-token-" + Date.now() };
}

export async function forgotPassword(email: string): Promise<boolean> {
  if (API_BASE) {
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  // Mock — always succeed
  await new Promise((r) => setTimeout(r, 400));
  return true;
}

export function logout() {
  clearStored();
}

export function getCurrentUser(): AuthUser | null {
  return getStoredUser();
}

export function isAuthenticated(): boolean {
  return getStoredUser() !== null;
}
