"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Flower2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguageStore } from "@/store/language-store";
import { getDictionary } from "@/i18n";
import { useAuthStore } from "@/store/auth-store";
import { AuthError } from "@/services/auth-service";

/**
 * Helper: map AuthError codes to i18n message keys.
 * When the backend goes live, Laravel returns specific error codes
 * that we map here — the UI never needs to change.
 */
function getLoginErrorMessage(err: unknown, t: ReturnType<typeof getDictionary>): string {
  if (!(err instanceof AuthError)) {
    return t.auth.login.requiredFields;
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
    default:
      return t.auth.login.requiredFields;
  }
}

export function LoginPage() {
  const router = useRouter();
  const locale = useLanguageStore((s) => s.locale);
  const t = getDictionary(locale);
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  /** Per-field errors from Laravel validation (422) */
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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
      if (res.user.role === "admin") {
        // Soft navigation — crossing route groups (site → admin)
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

  return (
    <div className="min-h-[85vh] flex">
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
              Where Every
              <br />
              Petal Tells
              <br />
              <span className="text-gold-gradient">a Story</span>
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
        <div className="absolute top-6 left-6 w-12 h-12 z-10">
          <div className="absolute top-0 left-0 w-full h-px bg-gold/40" />
          <div className="absolute top-0 left-0 w-px h-full bg-gold/40" />
        </div>
        <div className="absolute bottom-6 right-6 w-12 h-12 z-10">
          <div className="absolute bottom-0 right-0 w-full h-px bg-gold/40" />
          <div className="absolute bottom-0 right-0 w-px h-full bg-gold/40" />
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
              {t.auth.login.title}
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t.auth.login.subtitle}
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">
                {t.auth.login.email}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.auth.login.emailPlaceholder}
                  className={`pl-10 h-11 ${fieldErrors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
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
                  className="text-xs text-maroon dark:text-gold hover:underline cursor-pointer"
                >
                  {t.auth.login.forgotPassword}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.auth.login.passwordPlaceholder}
                  className={`pl-10 pr-10 h-11 ${fieldErrors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
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

          {/* Divider */}
          <div className="flex items-center gap-4 my-7">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground tracking-wide uppercase">
              {t.auth.login.orContinueWith}
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Social login */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex items-center justify-center gap-2.5 h-11 rounded-xl border border-border bg-card hover:bg-muted transition-colors text-sm font-medium cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2.5 h-11 rounded-xl border border-border bg-card hover:bg-muted transition-colors text-sm font-medium cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              Apple
            </button>
          </div>

          {/* Sign up link */}
          <p className="mt-8 text-center text-sm text-muted-foreground">
            {t.auth.login.noAccount}{" "}
            <button
              type="button"
              onClick={() => router.push("/signup")}
              className="font-medium text-maroon dark:text-gold hover:underline cursor-pointer"
            >
              {t.auth.login.createAccount}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
