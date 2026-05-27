"use client";

import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  borderAccent?: string;
  bgAccent?: string;
  index?: number;
}

export function StatsCard({ label, value, icon: Icon, color, borderAccent = "border-l-gray-300", bgAccent = "bg-muted/50", index = 0 }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className={`bg-white dark:bg-dark-card rounded-2xl p-5 border border-border shadow-elevated-hover border-l-[4px] ${borderAccent}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground font-medium">{label}</span>
        <div className={`p-2 rounded-xl ${bgAccent} ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </motion.div>
  );
}
