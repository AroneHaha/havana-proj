/**
 * Next.js Middleware — server-side route protection.
 *
 * Protects admin routes from unauthenticated access at the edge,
 * before the page even begins rendering. This prevents:
 *   - Flash of admin content before client-side redirect kicks in
 *   - Direct URL access to /dashboard, /orders, etc. without a token
 *
 * How it works:
 *   1. Checks for a `havana-auth-token` cookie (set by auth-service on login)
 *   2. If the cookie is missing on an admin route → redirect to /login
 *   3. The client-side layout still does the full role check (admin vs customer)
 *
 * The cookie is set as HTTP-only for security, so it can't be read by
 * client-side JavaScript. Only its existence is checked here — the
 * actual token validation happens on the backend.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_PATHS } from "@/lib/constant";

// Public routes that should redirect to dashboard if already logged in
const AUTH_ROUTES = ["/login", "/signup"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("havana-auth-token")?.value;

  // ── Protect admin routes ────────────────────────────────────────────
  const isAdminRoute = (ADMIN_PATHS as readonly string[]).some((p) =>
    pathname.startsWith(p)
  );

  if (isAdminRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Redirect logged-in users away from auth pages ──────────────────
  if (AUTH_ROUTES.some((route) => pathname.startsWith(route)) && token) {
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
