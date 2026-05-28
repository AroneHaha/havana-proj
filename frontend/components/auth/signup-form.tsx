"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Flower2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguageStore } from "@/store/language-store";
import { getDictionary } from "@/i18n";
import { useAuthStore } from "@/store/auth-store";
import { AuthError } from "@/services/auth-service";
import { SignupSuccessModal } from "@/components/auth/signup-success-modal";

/**
 * Helper: map AuthError codes to i18n messages for signup.
 * Handles both mock and Laravel backend error codes.
 */
function getSignupErrorMessage(err: unknown, t: ReturnType<typeof getDictionary>): string {
  if (!(err instanceof AuthError)) {
    return t.auth.login.requiredFields;
  }

  switch (err.code) {
    case "EMAIL_ALREADY_TAKEN":
      return t.auth.signup.emailAlreadyTaken ?? err.message;
    case "WEAK_PASSWORD":
      return t.auth.signup.weakPassword ?? err.message;
    case "INVALID_CREDENTIALS":
      return t.auth.login.invalidCredentials;
    case "VALIDATION_ERROR": {
      // Show the first Laravel field error
      const firstField = Object.values(err.fields)[0];
      return firstField?.[0] ?? t.auth.login.requiredFields;
    }
    default:
      return t.auth.login.requiredFields;
  }
}

export function SignupPage() {
  const router = useRouter();
  const locale = useLanguageStore((s) => s.locale);
  const t = getDictionary(locale);
  const register = useAuthStore((s) => s.register);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  /** Per-field errors from Laravel validation (422) */
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    // ── Client-side validation ──
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError(t.auth.login.requiredFields);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t.auth.login.invalidEmail);
      return;
    }

    if (password.length < 8) {
      setError(t.auth.signup.passwordTooShort ?? "Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError(t.auth.signup.passwordMismatch);
      return;
    }

    setLoading(true);
    try {
      await register({
        firstName,
        lastName,
        email,
        password,
        passwordConfirmation: confirmPassword,
      });
      setLoading(false);
      setShowSuccess(true);
    } catch (err) {
      // Map Laravel field errors to per-field UI state
      if (err instanceof AuthError && err.code === "VALIDATION_ERROR" && err.fields) {
        const mapped: Record<string, string> = {};
        for (const [field, messages] of Object.entries(err.fields)) {
          mapped[field] = messages[0] ?? "";
        }
        setFieldErrors(mapped);
      }
      setError(getSignupErrorMessage(err, t));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex">
      {/* ── Left: Decorative panel (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden">
        {/* Background image */}
        <img
          src="https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=1200&q=80"
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
                {t.auth.signup.title}
              </span>
            </div>

            <h2 className="font-serif text-4xl xl:text-5xl text-white leading-tight">
              {t.auth.signup.signupTagline}
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
              {t.auth.signup.title}
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t.auth.signup.subtitle}
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
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">
                  {t.auth.signup.firstName}
                </label>
                <div className="relative">
                  <User className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder={t.auth.signup.firstNamePlaceholder}
                    className={`ps-10 h-11 ${fieldErrors.first_name ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  />
                </div>
                {fieldErrors.first_name && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.first_name}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">
                  {t.auth.signup.lastName}
                </label>
                <div className="relative">
                  <User className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder={t.auth.signup.lastNamePlaceholder}
                    className={`ps-10 h-11 ${fieldErrors.last_name ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  />
                </div>
                {fieldErrors.last_name && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.last_name}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">
                {t.auth.signup.email}
              </label>
              <div className="relative">
                <Mail className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.auth.signup.emailPlaceholder}
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
              <label className="block text-sm font-medium text-foreground">
                {t.auth.signup.password}
              </label>
              <div className="relative">
                <Lock className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.auth.signup.passwordPlaceholder}
                  className={`ps-10 pe-10 h-11 ${fieldErrors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 w-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">
                {t.auth.signup.confirmPassword}
              </label>
              <div className="relative">
                <Lock className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t.auth.signup.confirmPasswordPlaceholder}
                  className="ps-10 h-11"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Terms */}
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t.auth.signup.agreeToTerms}
            </p>

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
                  {t.auth.signup.createAccount}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* REMOVED: Divider + Google/Apple social signup buttons */}

          {/* Sign in link */}
          <p className="mt-8 text-center text-sm text-muted-foreground">
            {t.auth.signup.alreadyHaveAccount}{" "}
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="font-medium text-maroon dark:text-gold hover:underline cursor-pointer"
            >
              {t.auth.signup.signIn}
            </button>
          </p>
        </motion.div>
      </div>

      {/* Success Modal */}
      <SignupSuccessModal
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
      />
    </div>
  );
}