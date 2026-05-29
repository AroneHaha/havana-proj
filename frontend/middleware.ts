/**
 * Next.js Middleware — server-side route protection.
 *
 * Protects admin routes from unauthenticated AND non-admin access at the edge,
 * before the page even begins rendering. This prevents:
 *   - Flash of admin content before client-side redirect kicks in
 *   - Direct URL access to /dashboard, /orders, etc. without proper credentials
 *   - Logged-in customers from seeing the admin layout shell
 *
 * How it works:
 *   1. Reads `havana-auth-token` cookie (set by auth-service on login)
 *   2. The cookie contains a URL-encoded JSON: {"r":"admin"} or {"r":"customer"}
 *   3. For admin routes: redirects to /login if cookie is missing OR role !== "admin"
 *   4. For auth pages (login/signup): redirects to /dashboard if already logged in as admin
 *
 * SECURITY: The cookie value is NOT the JWT — it's a minimal role indicator.
 * It can be spoofed by a technical user, but this is only a UX guard layer.
 * Real authorization is enforced by:
 *   - Client-side: admin layout checks `user.role === "admin"` from Zustand store
 *   - Server-side: Laravel `auth:sanctum` + `admin` middleware on every API call
 *
 * For true HTTP-only cookies (Phase 2), Laravel will set the cookie server-side
 * and we can simplify this middleware to just check cookie existence.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_PATHS } from "@/lib/constant";

// Public routes that should redirect to dashboard if already logged in
const AUTH_ROUTES = ["/login", "/signup"];

/**
 * Parse the role from the havana-auth-token cookie.
 * Cookie format: URL-encoded JSON {"r":"admin"} or {"r":"customer"}
 * Returns null if cookie is missing or malformed.
 */
function parseAuthRole(cookieValue: string | undefined): "admin" | "customer" | null {
  if (!cookieValue) return null;

  try {
    // Legacy format: cookie value was just "1" (no role info)
    if (cookieValue === "1") return "admin"; // Assume admin for backward compat

    const decoded = JSON.parse(decodeURIComponent(cookieValue));
    if (decoded && typeof decoded.r === "string") {
      return decoded.r as "admin" | "customer";
    }
  } catch {
    // Malformed cookie — treat as unauthenticated
    return null;
  }

  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookieValue = request.cookies.get("havana-auth-token")?.value;
  const role = parseAuthRole(cookieValue);

  // ── Protect admin routes ────────────────────────────────────────────
  const isAdminRoute = (ADMIN_PATHS as readonly string[]).some((p) =>
    pathname.startsWith(p)
  );

  if (isAdminRoute) {
    // Not logged in OR not an admin → redirect to login
    if (!role || role !== "admin") {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ── Redirect logged-in admins away from auth pages ──────────────────
  if (AUTH_ROUTES.some((route) => pathname.startsWith(route)) && role === "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Match all routes except static files, API routes, and _next
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
