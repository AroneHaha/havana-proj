"use client";

import { motion } from "framer-motion";
import { ShoppingBag, DollarSign, TrendingUp, Clock } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { OrdersT } from "./use-orders-data";

interface StatsCardsProps {
  t: OrdersT;
  ordersCount: number;
  totalRevenue: number;
  avgOrder: number;
  pendingCount: number;
}

export function StatsCards({ t, ordersCount, totalRevenue, avgOrder, pendingCount }: StatsCardsProps) {
  const stats = [
    { label: t.all, value: ordersCount, icon: ShoppingBag, color: "text-blue-500" },
    { label: t.revenue, value: formatPrice(totalRevenue), icon: DollarSign, color: "text-emerald-500" },
    { label: t.averageOrder, value: formatPrice(avgOrder), icon: TrendingUp, color: "text-orange-500" },
    { label: t.pending, value: pendingCount, icon: Clock, color: "text-yellow-500" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {stats.map((stat, i) => (
        <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.08 }} className="bg-white dark:bg-dark-card rounded-2xl p-5 border border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground font-medium">{stat.label}</span>
            <div className={`p-2 rounded-xl bg-muted/50 ${stat.color}`}><stat.icon className="h-4 w-4" /></div>
          </div>
          <p className="text-2xl font-bold text-foreground">{stat.value}</p>
        </motion.div>
      ))}
    </div>
  );
}