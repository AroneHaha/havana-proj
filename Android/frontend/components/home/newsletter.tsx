"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguageStore } from "@/store/language-store";
import { getDictionary } from "@/i18n";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const locale = useLanguageStore((s) => s.locale);
  const t = getDictionary(locale);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail("");
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-maroon" />
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Decorative elements */}
      <div className="absolute top-10 left-10 h-40 w-40 rounded-full bg-gold/10 blur-3xl" />
      <div className="absolute bottom-10 right-10 h-60 w-60 rounded-full bg-gold/5 blur-3xl" />

      <div className="relative container mx-auto px-4 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 mb-6">
            <Sparkles className="h-5 w-5 text-gold" />
            <span className="text-sm font-medium text-gold uppercase tracking-wider">{t.newsletter.exclusive}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            {t.newsletter.title}
          </h2>
          <p className="text-lg text-white/70 max-w-xl mx-auto mb-10">
            {t.newsletter.description}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto">
            <div className="relative flex-1 w-full">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.newsletter.placeholder}
                className="h-12 px-5 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-0 focus-visible:border-transparent"
                required
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="bg-gold hover:bg-gold-dark text-dark-bg font-semibold gap-2 shrink-0"
            >
              <Send className="h-4 w-4" />
              {t.newsletter.subscribe}
            </Button>
          </form>

          {submitted && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-sm text-gold"
            >
              {t.newsletter.thankYou}
            </motion.p>
          )}

          <p className="mt-6 text-xs text-white/40">{t.newsletter.privacy}</p>
        </motion.div>
      </div>
    </section>
  );
}
