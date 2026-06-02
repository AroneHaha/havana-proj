"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Flower2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguageStore } from "@/store/language-store";
import { getDictionary } from "@/i18n";
import { useAuthStore } from "@/store/auth-store";
import { AuthError, forgotPassword, getCurrentUserFromAPI } from "@/services/auth-service";

/**
 * Helper: map AuthError codes to i18n message keys.
 * When the backend goes live, Laravel returns specific error codes
 * that we map here — the UI never needs to change.
 */
function getLoginErrorMessage(err: unknown, t: ReturnType<typeof getDictionary>): string {
  // Log the real error for debugging (check browser console → F12)
  console.error("[Login Error]", err);

  if (!(err instanceof AuthError)) {
    // Non-AuthError (e.g., TypeError from response parsing) — show actual message
    return err instanceof Error
      ? err.message
      : t.auth.login.requiredFields;
  }

  switch (err.code) {
    case "INVALID_CREDENTIALS":
      return t.auth.login.invalidCredentials;
    case "TOKEN_EXPIRED":
      return t.auth.login.sessionExpired ?? t.auth.login.invalidCredentials;
    case "VALIDATION_ERROR": {
      // Laravel returns per-field errors — show the first one
      const firstField = Object.values(err.fields)[0];
      return firstField?.[0] ?? t.auth.login.requiredFields;
    }
    case "NETWORK_ERROR":
      return t.auth.login.networkError ?? t.auth.login.requiredFields;
    case "UNKNOWN":
      // Show the actual error message from the backend instead of generic fallback
      return err.message || t.auth.login.networkError || "An unexpected error occurred. Please try again.";
    default:
      // For any unhandled code, show the actual message
      return err.message || t.auth.login.requiredFields;
  }
}

export function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLanguageStore((s) => s.locale);
  const t = getDictionary(locale);
  const login = useAuthStore((s) => s.login);
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const hydrate = useAuthStore((s) => s.hydrate);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  /** Per-field errors from Laravel validation (422) */
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  // ── Redirect already-authenticated users to dashboard ──
  // The middleware no longer redirects /login → /dashboard because the cookie
  // can become stale after server restarts. Instead, we check the ACTUAL auth
  // state here: hydrate from localStorage, then validate the token with the
  // backend. Only redirect if the session is confirmed valid.
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) return; // Not logged in — show the login form

    // User exists in localStorage — verify the token is still valid
    let cancelled = false;
    getCurrentUserFromAPI().then((freshUser) => {
      if (cancelled) return;
      if (freshUser) {
        // Token is valid — redirect to dashboard
        const redirectPath = searchParams.get("redirect");
        router.replace(redirectPath || "/dashboard");
      } else {
        // Token is stale — clear it so the user can log in fresh.
        // We clear localStorage directly rather than calling logout()
        // to avoid an unnecessary backend /auth/logout call with an invalid token.
        localStorage.removeItem("havana-token");
        localStorage.removeItem("havana-refresh-token");
        document.cookie = "havana-auth-token=; path=/; max-age=0";
        // Also clear the Zustand store user so the login form renders
        useAuthStore.setState({ user: null });
      }
    });

    return () => { cancelled = true; };
  }, [hydrated, user, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    // ── Client-side validation ──
    if (!email || !password) {
      setError(t.auth.login.requiredFields);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t.auth.login.invalidEmail);
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      // Use the redirect URL from middleware (?redirect=/products) if available,
      // otherwise default to /dashboard for admin or / for customer.
      const redirectPath = searchParams.get("redirect");
      if (redirectPath) {
        router.push(redirectPath);
      } else if (res.user.role === "admin") {
        router.push("/dashboard");
      } else {
        router.push("/");
      }
    } catch (err) {
      // Map Laravel field errors to per-field UI state
      if (err instanceof AuthError && err.code === "VALIDATION_ERROR" && err.fields) {
        const mapped: Record<string, string> = {};
        for (const [field, messages] of Object.entries(err.fields)) {
          mapped[field] = messages[0] ?? "";
        }
        setFieldErrors(mapped);
      }
      setError(getLoginErrorMessage(err, t));
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
      setError(t.auth.login.invalidEmail);
      return;
    }
    setError("");
    setForgotLoading(true);
    try {
      await forgotPassword(forgotEmail);
      setForgotSent(true);
    } catch {
      setError(t.auth.login.requiredFields);
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left: Decorative panel (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden">
        {/* Background image */}
        <img
          src="https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=1200&q=80"
          alt="Havana Flowers"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-maroon-dark/90 via-maroon/80 to-black/70" />

        {/* Content overlay */}
        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 w-full">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <Flower2 className="h-8 w-8 text-gold" />
              <span className="font-serif text-2xl text-white font-semibold tracking-wide">
                Havana
              </span>
            </div>
          </div>

          {/* Center tagline */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-px w-10 bg-gold/60" />
              <span className="text-gold-light text-sm tracking-[0.2em] uppercase font-medium">
                {t.auth.login.welcomeBack}
              </span>
            </div>

            <h2 className="font-serif text-4xl xl:text-5xl text-white leading-tight">
              {t.auth.login.loginTagline}
            </h2>

            <p className="text-white/60 max-w-sm leading-relaxed">
              {t.hero.description}
            </p>
          </div>

          {/* Bottom decorative detail */}
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-gold" />
              <div className="h-1.5 w-1.5 rounded-full bg-gold/50" />
              <div className="h-1.5 w-1.5 rounded-full bg-gold/25" />
            </div>
          </div>
        </div>

        {/* Corner accents */}
        <div className="absolute top-6 start-6 w-12 h-12 z-10">
          <div className="absolute top-0 start-0 w-full h-px bg-gold/40" />
          <div className="absolute top-0 start-0 w-px h-full bg-gold/40" />
        </div>
        <div className="absolute bottom-6 end-6 w-12 h-12 z-10">
          <div className="absolute bottom-0 end-0 w-full h-px bg-gold/40" />
          <div className="absolute bottom-0 end-0 w-px h-full bg-gold/40" />
        </div>
      </div>

      {/* ── Right: Form panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          {/* Mobile brand */}
          <div className="flex items-center gap-2 lg:hidden mb-8">
            <Flower2 className="h-6 w-6 text-maroon dark:text-gold" />
            <span className="font-serif text-xl font-semibold text-foreground">
              Havana
            </span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-serif text-3xl lg:text-4xl font-bold text-foreground mb-2">
              {showForgotPassword ? t.auth.login.forgotPasswordTitle : t.auth.login.title}
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {showForgotPassword ? t.auth.login.forgotPasswordSubtitle : t.auth.login.subtitle}
            </p>
          </div>

          {/* Error alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          {showForgotPassword ? (
            /* ─── Forgot Password Form ─── */
            <div className="space-y-5">
              {forgotSent ? (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/15 border border-emerald-200 dark:border-emerald-800/30 text-emerald-600 dark:text-emerald-400 text-sm text-center">
                  {t.auth.login.forgotPasswordSent}
                </div>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-foreground">
                      {t.auth.login.email}
                    </label>
                    <div className="relative">
                      <Mail className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <Input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder={t.auth.login.emailPlaceholder}
                        className="ps-10 h-11"
                        dir="ltr"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    disabled={forgotLoading}
                    onClick={handleForgotPassword}
                    size="lg"
                    className="w-full h-12 text-base gap-2"
                  >
                    {forgotLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      t.auth.login.forgotPasswordSend
                    )}
                  </Button>
                </>
              )}
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotSent(false);
                  setForgotEmail("");
                  setError("");
                }}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                {t.auth.login.forgotPasswordBack}
              </button>
            </div>
          ) : (
            /* ─── Login Form ─── */
            <>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-foreground">
                    {t.auth.login.email}
                  </label>
                  <div className="relative">
                    <Mail className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t.auth.login.emailPlaceholder}
                      className={`ps-10 h-11 ${fieldErrors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      dir="ltr"
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-foreground">
                      {t.auth.login.password}
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-xs text-maroon dark:text-gold hover:underline cursor-pointer"
                    >
                      {t.auth.login.forgotPassword}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t.auth.login.passwordPlaceholder}
                      className={`ps-10 pe-10 h-11 ${fieldErrors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>
                  )}
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={loading}
                  size="lg"
                  className="w-full h-12 text-base gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {t.auth.login.signIn}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}