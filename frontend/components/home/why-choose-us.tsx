"use client";

import { motion } from "framer-motion";
import { Truck, Clock, Award, HeadphonesIcon, Palette, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionHeader } from "@/components/shared/section-header";
import { useLanguageStore } from "@/store/language-store";
import { getDictionary } from "@/i18n";

const features = [
  { key: "sameDay" as const, icon: Truck, color: "text-rose-500", ring: "ring-rose-200 dark:ring-rose-900/50" },
  { key: "freshness" as const, icon: Clock, color: "text-emerald-500", ring: "ring-emerald-200 dark:ring-emerald-900/50" },
  { key: "premium" as const, icon: Award, color: "text-gold", ring: "ring-gold/30 dark:ring-gold/20" },
  { key: "support" as const, icon: HeadphonesIcon, color: "text-blue-500", ring: "ring-blue-200 dark:ring-blue-900/50" },
  { key: "personalized" as const, icon: Palette, color: "text-purple-500", ring: "ring-purple-200 dark:ring-purple-900/50" },
  { key: "eco" as const, icon: Leaf, color: "text-teal-500", ring: "ring-teal-200 dark:ring-teal-900/50" },
];

export function WhyChooseUs() {
  const locale = useLanguageStore((s) => s.locale);
  const t = getDictionary(locale);

  return (
    <section className="py-20 lg:py-28 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <SectionHeader
          title={t.whyChooseUs.title}
          subtitle={t.whyChooseUs.subtitle}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-5">
          {/* ── First 2 features: tall, side-by-side, take 7 cols ── */}
          {features.slice(0, 2).map((feature, i) => (
            <motion.div
              key={feature.key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="lg:col-span-6 group"
            >
              <div className="relative h-full rounded-2xl border border-border bg-card p-8 lg:p-10 hover:shadow-lg transition-shadow duration-500 overflow-hidden">
                {/* Big ghost number */}
                <span className="absolute -top-4 -right-2 font-serif text-[140px] lg:text-[180px] font-bold leading-none text-foreground/[0.03] select-none pointer-events-none">
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Icon — ring style, no solid box */}
                <div className={cn("inline-flex h-11 w-11 items-center justify-center rounded-full ring-2 mb-6", feature.ring, feature.color)}>
                  <feature.icon className="h-5 w-5" />
                </div>

                <h3 className="font-serif text-xl lg:text-2xl font-bold text-foreground mb-2">
                  {t.whyChooseUs[feature.key].title}
                </h3>

                <p className="text-muted-foreground leading-relaxed max-w-sm">
                  {t.whyChooseUs[feature.key].description}
                </p>

                {/* Gold accent that grows on hover */}
                <div className="mt-6 h-px w-12 bg-gold/40 group-hover:w-20 transition-all duration-500" />
              </div>
            </motion.div>
          ))}

          {/* ── Remaining 4 features: compact list, take 5 cols on lg ── */}
          <div className="lg:col-span-12 grid grid-cols-1 sm:grid-cols-2 gap-px bg-border rounded-2xl overflow-hidden mt-2 lg:mt-0">
            {features.slice(2).map((feature, i) => (
              <motion.div
                key={feature.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
                className="group bg-card hover:bg-muted/50 transition-colors duration-300"
              >
                <div className="flex items-start gap-4 p-6 lg:p-7">
                  {/* Small dot */}
                  <div className="mt-1.5 flex-shrink-0">
                    <feature.icon className={cn("h-5 w-5", feature.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground mb-1">
                      {t.whyChooseUs[feature.key].title}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t.whyChooseUs[feature.key].description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
