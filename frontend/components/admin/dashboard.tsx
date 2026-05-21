"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  ShoppingBag,
  Flower2,
  Users,
  Package,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  TrendingUp,
  DollarSign,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentUser, logout, type AuthUser } from "@/services/auth-service";

const stats = [
  { label: "Total Revenue", value: "QAR 42,580", change: "+12.5%", icon: DollarSign, color: "text-emerald-500" },
  { label: "Total Orders", value: "384", change: "+8.2%", icon: ShoppingBag, color: "text-blue-500" },
  { label: "Active Users", value: "1,247", change: "+3.1%", icon: Users, color: "text-purple-500" },
  { label: "Products", value: "96", change: "+2", icon: Flower2, color: "text-gold" },
];

const recentOrders = [
  { id: "#HV-1042", customer: "Sara Al-Thani", product: "Royal Rose Symphony", amount: "QAR 699", status: "Delivered" },
  { id: "#HV-1041", customer: "Ahmed Hassan", product: "Golden Hour Bouquet", amount: "QAR 620", status: "In Transit" },
  { id: "#HV-1040", customer: "Khalid Noor", product: "Midnight Orchid Elegance", amount: "QAR 999", status: "Processing" },
  { id: "#HV-1039", customer: "Fatima Ali", product: "Pearl White Lilies", amount: "QAR 780", status: "Delivered" },
  { id: "#HV-1038", customer: "Omar Saeed", product: "Classic Red Rose Box", amount: "QAR 550", status: "Delivered" },
];

const statusColors: Record<string, string> = {
  Delivered: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "In Transit": "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Processing: "bg-gold/10 text-gold-dark dark:text-gold",
};

export function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const current = getCurrentUser();
    if (!current || current.role !== "admin") {
      router.push("/login");
      return;
    }
    setUser(current);
    setChecking(false);
  }, [router]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg">
        <div className="w-8 h-8 border-2 border-maroon/30 border-t-maroon rounded-full animate-spin dark:border-gold/30 dark:border-t-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-dark-card/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-3">
            <Flower2 className="h-6 w-6 text-maroon dark:text-gold" />
            <span className="font-serif text-lg font-semibold text-foreground">
              Havana
            </span>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              Admin
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-maroon dark:bg-gold" />
            </button>
            <div className="flex items-center gap-2.5 pl-3 border-l border-border">
              <div className="h-8 w-8 rounded-full bg-maroon dark:bg-gold flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-foreground leading-none">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* ── Sidebar ── */}
        <aside className="hidden lg:flex flex-col w-60 min-h-[calc(100vh-4rem)] border-r border-border bg-white dark:bg-dark-card p-4">
          <nav className="space-y-1">
            {[
              { icon: LayoutDashboard, label: "Dashboard", active: true },
              { icon: ShoppingBag, label: "Orders" },
              { icon: Package, label: "Products" },
              { icon: Users, label: "Customers" },
              { icon: BarChart3, label: "Analytics" },
              { icon: Settings, label: "Settings" },
            ].map((item) => (
              <button
                key={item.label}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  item.active
                    ? "bg-maroon/5 dark:bg-gold/10 text-maroon dark:text-gold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-4 border-t border-border">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Page header */}
            <div className="mb-8">
              <h1 className="font-serif text-2xl lg:text-3xl font-bold text-foreground">
                Dashboard
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Welcome back, {user?.firstName}. Here&apos;s your store overview.
              </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="bg-white dark:bg-dark-card rounded-2xl p-5 border border-border"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground font-medium">
                      {stat.label}
                    </span>
                    <div className={`p-2 rounded-xl bg-muted/50 ${stat.color}`}>
                      <stat.icon className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                    <span className="text-xs text-emerald-500 font-medium">
                      {stat.change}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Recent orders */}
            <div className="bg-white dark:bg-dark-card rounded-2xl border border-border overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className="font-serif text-lg font-semibold text-foreground">
                  Recent Orders
                </h2>
                <button className="text-sm text-maroon dark:text-gold font-medium hover:underline cursor-pointer">
                  View All
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Order
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                        Product
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-foreground">
                          {order.id}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {order.customer}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground hidden sm:table-cell">
                          {order.product}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-foreground">
                          {order.amount}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                              statusColors[order.status] ?? "bg-muted text-muted-foreground"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}