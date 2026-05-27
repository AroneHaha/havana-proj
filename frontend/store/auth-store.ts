/**
 * Auth Store — single source of truth for auth state.
 *
 * Why this exists:
 *   - Components used to read localStorage directly → hydration mismatches, stale data
 *   - Now they subscribe to this store, which syncs from localStorage on hydration
 *   - When the backend goes live, swap the service methods — the store API stays the same
 *
 * Usage:
 *   const user = useAuthStore(s => s.user);
 *   const isAdmin = useAuthStore(s => s.isAdmin);
 *   const { login, logout } = useAuthStore();
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  login as authServiceLogin,
  register as authServiceRegister,
  logout as authServiceLogout,
  getCurrentUser,
  type AuthUser,
  type AuthResponse,
  type AuthError,
} from "@/services/auth-service";

interface AuthStore {
  /** Current authenticated user (null = not logged in) */
  user: AuthUser | null;
  /** Whether the store has hydrated from localStorage */
  hydrated: boolean;

  // ─── Derived helpers (as methods so they don't trigger re-renders) ───
  isAdmin: () => boolean;
  isAuthenticated: () => boolean;

  // ─── Actions ──────────────────────────────────────────────────────────
  /** Hydrate from localStorage (call once on app mount) */
  hydrate: () => void;
  /** Login with email + password */
  login: (email: string, password: string) => Promise<AuthResponse>;
  /** Register a new account */
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    passwordConfirmation: string;
  }) => Promise<AuthResponse>;
  /** Logout and clear state */
  logout: () => Promise<void>;
  /** Manually set user (e.g. after profile update) */
  setUser: (user: AuthUser) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      hydrated: false,

      isAdmin: () => get().user?.role === "admin",
      isAuthenticated: () => get().user !== null,

      hydrate: () => {
        const user = getCurrentUser();
        set({ user, hydrated: true });
      },

      login: async (email, password) => {
        const res = await authServiceLogin(email, password);
        set({ user: res.user });
        return res;
      },

      register: async (data) => {
        const res = await authServiceRegister(data);
        // Only set the user if a token was returned (auto-login).
        // If the backend requires email verification, no token is returned,
        // and we must NOT set the user — they'd be in a ghost-authenticated state.
        if (res.token) {
          set({ user: res.user });
        }
        return res;
      },

      logout: async () => {
        await authServiceLogout();
        set({ user: null });
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: "havana-auth",
      // Only persist the user object, not methods or loading state
      partialize: (state) => ({ user: state.user }),
      // Skip hydration on server
      skipHydration: true,
    }
  )
);
