"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { SectionHeader } from "@/components/shared/section-header";
import { useLanguageStore } from "@/store/language-store";
import { getDictionary } from "@/i18n";

const occasionData = [
  { key: "eid" as const, image: "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&q=80" },
  { key: "weddings" as const, image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80" },
  { key: "birthday" as const, image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80" },
  { key: "anniversary" as const, image: "https://images.unsplash.com/photo-1469259943454-aa100abba749?w=800&q=80" },
  { key: "graduation" as const, image: "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=800&q=80" },
  { key: "mothersDay" as const, image: "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=800&q=80" },
  { key: "loveRomance" as const, image: "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=800&q=80" },
  { key: "sympathy" as const, image: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=800&q=80" },
];

export function ShopByOccasion() {
  const locale = useLanguageStore((s) => s.locale);
  const t = getDictionary(locale);
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const displayIndex = hovered !== null ? hovered : active;

  // Auto-cycle when not hovering
  useEffect(() => {
    if (hovered !== null) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % occasionData.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [hovered]);

  return (
    <section id="occasions" className="py-20 lg:py-28">
      <div className="container mx-auto px-4 lg:px-8">
        <SectionHeader
          title={t.shopByOccasion.title}
          subtitle={t.shopByOccasion.subtitle}
        />

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-0 lg:divide-x lg:divide-border lg:items-stretch">
          {/* ── Left: Category List ── */}
          <div
            ref={listRef}
            className="lg:w-[38%] lg:pr-10 xl:pr-14 flex flex-col"
          >
            {occasionData.map((occasion, i) => {
              const isActive = displayIndex === i;
              return (
                <button
                  key={occasion.key}
                  onClick={() => {
                    setActive(i);
                    setHovered(null);
                  }}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  className="group relative text-left py-4 lg:py-5 border-b border-border/60 last:border-b-0 transition-all duration-300 focus:outline-none"
                >
                  {/* Gold accent bar — slides in from left when active */}
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-full bg-gold transition-all duration-500 ease-out"
                    style={{
                      height: isActive ? "70%" : "0%",
                      // RTL handled via CSS logical prop below
                    }}
                  />

                  <div className="pl-5 rtl:pl-0 rtl:pr-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {/* Number indicator */}
                      <span
                        className={`font-serif text-sm tabular-nums transition-colors duration-300 ${
                          isActive
                            ? "text-gold"
                            : "text-muted-foreground/40 group-hover:text-muted-foreground/70"
                        }`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>

                      {/* Category name */}
                      <span
                        className={`font-serif text-lg lg:text-xl transition-all duration-300 ${
                          isActive
                            ? "text-foreground font-semibold tracking-tight"
                            : "text-muted-foreground group-hover:text-foreground/80"
                        }`}
                      >
                        {t.occasions[occasion.key]}
                      </span>
                    </div>

                    {/* Arrow — only visible when active */}
                    <span
                      className={`transition-all duration-300 ${
                        isActive
                          ? "opacity-100 translate-x-0 rtl:-translate-x-0"
                          : "opacity-0 translate-x-2 rtl:-translate-x-2"
                      }`}
                    >
                      <ArrowUpRight className="h-4 w-4 text-gold" />
                    </span>
                  </div>

                  {/* Subtle gold underline that expands on active */}
                  <div
                    className={`mt-2 ml-5 rtl:ml-0 rtl:mr-5 h-px bg-gold/30 transition-all duration-500 ease-out origin-left rtl:origin-right ${
                      isActive ? "w-3/4" : "w-0"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* ── Right: Large Image ── */}
          <div className="lg:w-[62%] lg:pl-10 xl:pl-14 relative lg:flex lg:flex-col">
            <div className="relative aspect-[4/5] lg:aspect-auto lg:flex-1 overflow-hidden rounded-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={occasionData[displayIndex].key}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0"
                >
                  <img
                    src={occasionData[displayIndex].image}
                    alt={t.occasions[occasionData[displayIndex].key]}
                    className="h-full w-full object-cover"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Very subtle bottom gradient for readability */}
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

              {/* Category name overlay at bottom of image */}
              <motion.div
                key={`label-${displayIndex}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="absolute bottom-6 left-6 rtl:left-auto rtl:right-6"
              >
                <span className="inline-flex items-center gap-2 text-white/90 font-serif text-2xl lg:text-3xl font-semibold tracking-tight drop-shadow-lg">
                  {t.occasions[occasionData[displayIndex].key]}
                  <ArrowUpRight className="h-5 w-5 text-gold-light" />
                </span>
              </motion.div>

              {/* Thin gold frame accent — top-right corner */}
              <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4 w-10 h-10">
                <div className="absolute top-0 right-0 rtl:right-auto rtl:left-0 w-full h-[1px] bg-gold/50" />
                <div className="absolute top-0 right-0 rtl:right-auto rtl:left-0 w-[1px] h-full bg-gold/50" />
              </div>
              {/* Bottom-left corner */}
              <div className="absolute bottom-4 left-4 rtl:left-auto rtl:right-4 w-10 h-10">
                <div className="absolute bottom-0 left-0 rtl:left-auto rtl:right-0 w-full h-[1px] bg-gold/50" />
                <div className="absolute bottom-0 left-0 rtl:left-auto rtl:right-0 w-[1px] h-full bg-gold/50" />
              </div>
            </div>

            {/* Dot indicators below image (mobile companion) */}
            <div className="flex items-center justify-center gap-2 mt-5 lg:hidden">
              {occasionData.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`rounded-full transition-all duration-300 ${
                    displayIndex === i
                      ? "w-6 h-1.5 bg-gold"
                      : "w-1.5 h-1.5 bg-muted-foreground/25"
                  }`}
                  aria-label={t.occasions[occasionData[i].key]}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
