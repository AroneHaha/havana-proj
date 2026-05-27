"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Flower2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguageStore } from "@/store/language-store";
import { getDictionary } from "@/i18n";

interface SignupSuccessModalProps {
  open: boolean;
  onClose: () => void;
}

export function SignupSuccessModal({ open, onClose }: SignupSuccessModalProps) {
  const router = useRouter();
  const locale = useLanguageStore((s) => s.locale);
  const t = getDictionary(locale);

  // Auto-redirect to login after 5 seconds
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      onClose();
      router.push("/login");
    }, 5000);
    return () => clearTimeout(timer);
  }, [open, onClose, router]);

  const handleGoToLogin = () => {
    onClose();
    router.push("/login");
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={handleGoToLogin}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
          >
            <div
              className="relative w-full max-w-sm bg-card border border-border rounded-2xl p-8 shadow-2xl text-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decorative top accent */}
              <div className="absolute top-0 start-1/2 -translate-x-1/2 w-16 h-1 rounded-b-full bg-gradient-to-r from-maroon via-gold to-maroon" />

              {/* Success icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                className="mx-auto mb-5 relative"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-maroon/10 to-gold/10 dark:from-maroon/20 dark:to-gold/20 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10 text-gold" strokeWidth={1.5} />
                </div>
                {/* Floating petals decoration */}
                <motion.div
                  animate={{ y: [-4, 4, -4], rotate: [0, 10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-1 -end-1"
                >
                  <Flower2 className="w-5 h-5 text-maroon/40 dark:text-gold/40" />
                </motion.div>
                <motion.div
                  animate={{ y: [4, -4, 4], rotate: [0, -15, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute -bottom-1 -start-1"
                >
                  <Flower2 className="w-4 h-4 text-gold/30" />
                </motion.div>
              </motion.div>

              {/* Title */}
              <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
                {t.auth.signup.successTitle}
              </h2>

              {/* Message */}
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                {t.auth.signup.successMessage}
              </p>

              {/* Gold divider */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="h-px w-8 bg-gold/30" />
                <Flower2 className="w-3.5 h-3.5 text-gold/50" />
                <div className="h-px w-8 bg-gold/30" />
              </div>

              {/* Go to login button */}
              <Button
                onClick={handleGoToLogin}
                size="lg"
                className="w-full h-12 text-base gap-2"
              >
                {t.auth.signup.successGoToLogin}
                <ArrowRight className="h-4 w-4" />
              </Button>

              {/* Auto-redirect notice */}
              <p className="mt-4 text-xs text-muted-foreground/60">
                {t.auth.signup.autoRedirectNotice}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
