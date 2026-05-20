"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  align?: "center" | "start";
  className?: string;
}

export function SectionHeader({ title, subtitle, align = "center", className }: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={cn(
        "mb-12",
        align === "center" && "text-center",
        className
      )}
    >
      <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-4">
        <span className="text-gold-gradient">{title}</span>
      </h2>
      {subtitle && (
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
      <div className={`mt-4 flex items-center gap-2 ${align === "start" ? "justify-start" : "justify-center"}`}>
        <div className="h-[1px] w-12 bg-gold/50" />
        <div className="h-2 w-2 rounded-full bg-gold" />
        <div className="h-[1px] w-12 bg-gold/50" />
      </div>
    </motion.div>
  );
}
