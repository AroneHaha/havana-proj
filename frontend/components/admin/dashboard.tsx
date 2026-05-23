"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Flower2,
  Users,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useLanguageStore } from "@/store/language-store";
import { getDictionary } from "@/i18n";

const stats = [
  { labelKey: "totalRevenue", value: "QAR 42,580", change: "+12.5%", icon: DollarSign, color: "text-emerald-500" },
  { labelKey: "totalOrders", value: "384", change: "+8.2%", icon: ShoppingBag, color: "text-blue-500" },
  { labelKey: "activeUsers", value: "1,247", change: "+3.1%", icon: Users, color: "text-purple-500" },
  { labelKey: "products", value: "96", change: "+2", icon: Flower2, color: "text-gold" },
];

const recentOrders = [
  { id: "#HV-1042", customer: "Sara Al-Thani", product: "Royal Rose Symphony", amount: "QAR 699", statusKey: "delivered" },
  { id: "#HV-1041", customer: "Ahmed Hassan", product: "Golden Hour Bouquet", amount: "QAR 620", statusKey: "inTransit" },
  { id: "#HV-1040", customer: "Khalid Noor", product: "Midnight Orchid Elegance", amount: "QAR 999", statusKey: "processing" },
  { id: "#HV-1039", customer: "Fatima Ali", product: "Pearl White Lilies", amount: "QAR 780", statusKey: "delivered" },
  { id: "#HV-1038", customer: "Omar Saeed", product: "Classic Red Rose Box", amount: "QAR 550", statusKey: "delivered" },
];

const statusColors: Record<string, string> = {
  delivered: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  inTransit: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  processing: "bg-gold/10 text-gold-dark dark:text-gold",
};

export function AdminDashboard() {
  const locale = useLanguageStore((s) => s.locale);
  const dict = getDictionary(locale);
  const t = dict.admin.dashboard;

  const user = useAuthStore((s) => s.user);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="mb-8">
        <h1 className="font-serif text-2xl lg:text-3xl font-bold text-foreground">{t.title}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t.subtitle.replace("{name}", user?.firstName ?? "")}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.labelKey}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="bg-white dark:bg-dark-card rounded-2xl p-5 border border-border"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground font-medium">{t[stat.labelKey as keyof typeof t]}</span>
              <div className={`p-2 rounded-xl bg-muted/50 ${stat.color}`}><stat.icon className="h-4 w-4" /></div>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              <span className="text-xs text-emerald-500 font-medium">{stat.change}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white dark:bg-dark-card rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-serif text-lg font-semibold text-foreground">{t.recentOrders}</h2>
          <Link href="/orders" className="text-sm text-maroon dark:text-gold font-medium hover:underline">{t.viewAll}</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t.order}</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t.customer}</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">{t.product}</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t.amount}</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t.status}</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-foreground">{order.id}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{order.customer}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground hidden sm:table-cell">{order.product}</td>
                  <td className="px-6 py-4 text-sm font-medium text-foreground">{order.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.statusKey] ?? "bg-muted text-muted-foreground"}`}>
                      {t[order.statusKey as keyof typeof t]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}