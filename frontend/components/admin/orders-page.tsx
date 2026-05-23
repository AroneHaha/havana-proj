"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Download,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Clock,
  X,
  LayoutDashboard,
  Package,
  Users,
  CreditCard,
} from "lucide-react";
import {
  useOrdersStore,
  OrderStatus,
  STATUS_I18N_KEY,
  Order,
} from "@/store/orders-store";
import { useAuthStore } from "@/store/auth-store";
import { useLanguageStore } from "@/store/language-store";
import { getDictionary } from "@/i18n";
import { OrderDetailDrawer } from "@/components/admin/order-detail-drawer";
import { formatPrice } from "@/lib/format-price";

import AdminTopbar from "@/components/admin/ui/admin-topbar";
import  { AdminSidebar } from "@/components/admin/ui/admin-sidebar";

const ITEMS_PER_PAGE = 8;

const statusColors: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  preparing: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  out_for_delivery: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  delivered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const statusDotColors: Record<OrderStatus, string> = {
  pending: "bg-yellow-500",
  confirmed: "bg-blue-500",
  preparing: "bg-purple-500",
  out_for_delivery: "bg-orange-500",
  delivered: "bg-green-500",
  cancelled: "bg-red-500",
};

type FilterStatus = "all" | OrderStatus;

const FILTER_TABS: FilterStatus[] = [
  "all",
  "pending",
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

const sidebarItems = [
  { icon: LayoutDashboard, labelKey: "dashboard", href: "/dashboard" },
  { icon: ShoppingBag, labelKey: "orders", href: "/orders" },
  { icon: Package, labelKey: "products", href: "products" },
  { icon: Users, labelKey: "Reviews", href: "/sales-reviews" },
];

export function AdminOrders() {
  const locale = useLanguageStore((s) => s.locale);
  const dict = getDictionary(locale);
  const t = dict.admin.orders;
  const nav = dict.admin.nav;

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const hydrate = useAuthStore((s) => s.hydrate);
  const hydrated = useAuthStore((s) => s.hydrated);

  const orders = useOrdersStore((s) => s.orders);
  const storeFetchOrders = useOrdersStore((s) => s.fetchOrders);
  const storeFetchStats = useOrdersStore((s) => s.fetchStats);
  const updateOrderStatus = useOrdersStore((s) => s.updateOrderStatus);
  const deleteOrder = useOrdersStore((s) => s.deleteOrder);
  const getStatusCounts = useOrdersStore((s) => s.getStatusCounts);
  const getTotalRevenue = useOrdersStore((s) => s.getTotalRevenue);
  const getAverageOrderValue = useOrdersStore((s) => s.getAverageOrderValue);

  const [checking, setChecking] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [activeDatePreset, setActiveDatePreset] = useState<"today" | "7d" | "30d" | null>(null);

  useEffect(() => { hydrate(); }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;
    if (!user || user.role !== "admin") {
      window.location.href = "/login";
      return;
    }
    setChecking(false);
    storeFetchOrders();
    storeFetchStats();
  }, [hydrated, user]);

  const statusCounts = getStatusCounts();
  const totalRevenue = getTotalRevenue();
  const avgOrder = getAverageOrderValue();

  const filteredOrders = useMemo(() => {
    let result = [...orders];
    if (activeFilter !== "all") result = result.filter((o) => o.status === activeFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (o) => o.id.toLowerCase().includes(q) || o.customer.name.toLowerCase().includes(q) || o.customer.email.toLowerCase().includes(q) || o.customer.phone.includes(q)
      );
    }
    if (dateFrom) {
      const from = new Date(dateFrom); from.setHours(0, 0, 0, 0);
      result = result.filter((o) => new Date(o.createdAt) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo); to.setHours(23, 59, 59, 999);
      result = result.filter((o) => new Date(o.createdAt) <= to);
    }
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return result;
  }, [orders, activeFilter, searchQuery, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleFilterChange = (filter: FilterStatus) => { setActiveFilter(filter); setCurrentPage(1); };
  const handleViewOrder = (order: Order) => { setSelectedOrder(order); setDrawerOpen(true); };

  const handleUpdateStatus = async (id: string, status: OrderStatus) => {
    try {
      await updateOrderStatus(id, status);
      if (selectedOrder?.id === id) setSelectedOrder((prev) => prev ? { ...prev, status, updatedAt: new Date().toISOString() } : null);
    } catch {}
  };

  const handleDeleteOrder = async (id: string) => {
    try {
      await deleteOrder(id); setDeleteConfirm(null);
      if (selectedOrder?.id === id) { setDrawerOpen(false); setSelectedOrder(null); }
    } catch {}
  };

  const clearDateFilter = () => { setDateFrom(""); setDateTo(""); setActiveDatePreset(null); setCurrentPage(1); };
  const hasDateFilter = dateFrom || dateTo;

  const handleDatePreset = (preset: "today" | "7d" | "30d") => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    if (preset === activeDatePreset) { clearDateFilter(); return; }
    setActiveDatePreset(preset); setDateTo(today); setCurrentPage(1);
    if (preset === "today") setDateFrom(today);
    else if (preset === "7d") { const d = new Date(now); d.setDate(d.getDate() - 6); setDateFrom(d.toISOString().split("T")[0]); }
    else { const d = new Date(now); d.setDate(d.getDate() - 29); setDateFrom(d.toISOString().split("T")[0]); }
  };

  const exportCSV = () => {
    const headers = ["Order ID", "Customer", "Email", "Phone", "Items", "Subtotal", "Delivery Fee", "Total", "Status", "Payment", "Notes", "Created At"];
    const rows = filteredOrders.map((o) => [o.id, o.customer.name, o.customer.email, o.customer.phone, o.items.map((i) => `${i.productName} x${i.quantity}`).join("; "), o.subtotal.toString(), o.deliveryFee.toString(), o.total.toString(), o.status, "Cash on Delivery", o.notes || "", o.createdAt]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `havana-orders-${new Date().toISOString().split("T")[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("en-QA", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  const itemCount = (items: Order["items"]) => items.reduce((sum, i) => sum + i.quantity, 0);

  const handleLogout = () => { logout(); window.location.href = "/login"; };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg">
        <div className="w-8 h-8 border-2 border-maroon/30 border-t-maroon rounded-full animate-spin dark:border-gold/30 dark:border-t-gold" />
      </div>
    );
  }

  const getTabLabel = (filter: FilterStatus): string => {
    if (filter === "all") return t.all;
    return t[STATUS_I18N_KEY[filter] as keyof typeof t] as string;
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      <AdminTopbar user={user} handleLogout={handleLogout} signOutLabel={nav.signOut} />

      <div className="flex">
        <AdminSidebar sidebarItems={sidebarItems} nav={nav} handleLogout={handleLogout} activePath="/orders" />

        <main className="flex-1 p-6 lg:p-8">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="font-serif text-2xl lg:text-3xl font-bold text-foreground">{t.title}</h1>
                <p className="text-sm text-muted-foreground mt-1">{t.subtitle}</p>
              </div>
              <button onClick={exportCSV} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-white dark:bg-dark-card text-sm font-medium text-foreground hover:bg-muted transition-colors shrink-0 cursor-pointer">
                <Download className="w-4 h-4" />{t.exportCSV}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { label: t.all, value: orders.length, icon: ShoppingBag, color: "text-blue-500" },
                { label: t.revenue, value: totalRevenue.toLocaleString(), icon: DollarSign, color: "text-emerald-500" },
                { label: t.averageOrder, value: Math.round(avgOrder).toLocaleString(), icon: TrendingUp, color: "text-orange-500" },
                { label: t.pending, value: statusCounts.pending, icon: Clock, color: "text-yellow-500" },
              ].map((stat, i) => (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.08 }} className="bg-white dark:bg-dark-card rounded-2xl p-5 border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground font-medium">{stat.label}</span>
                    <div className={`p-2 rounded-xl bg-muted/50 ${stat.color}`}><stat.icon className="h-4 w-4" /></div>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </motion.div>
              ))}
            </div>

            <div className="mb-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} placeholder={t.search} className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-border bg-white dark:bg-dark-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-maroon dark:focus:ring-gold transition-shadow" />
                {searchQuery && (
                  <button onClick={() => { setSearchQuery(""); setCurrentPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted transition-colors cursor-pointer">
                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>

            <div className="mb-4 overflow-x-auto scrollbar-hide">
              <div className="flex gap-1.5 pb-1 min-w-max">
                {FILTER_TABS.map((filter) => {
                  const count = filter === "all" ? orders.length : statusCounts[filter];
                  const isActive = activeFilter === filter;
                  return (
                    <button key={filter} onClick={() => handleFilterChange(filter)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${isActive ? "bg-maroon text-white dark:bg-gold dark:text-dark-bg" : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"}`}>
                      {filter !== "all" && <span className={`w-1.5 h-1.5 rounded-full ${statusDotColors[filter]}`} />}
                      {getTabLabel(filter)}
                      <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? "bg-white/20 dark:bg-dark-bg/20" : "bg-muted text-muted-foreground"}`}>{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-white dark:bg-dark-card rounded-2xl border border-border overflow-hidden">
              <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-muted/30 gap-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  {([
                    { key: "today" as const, label: t.today },
                    { key: "7d" as const, label: t.last7Days },
                    { key: "30d" as const, label: t.last30Days },
                  ]).map((preset) => (
                    <button key={preset.key} onClick={() => handleDatePreset(preset.key)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${activeDatePreset === preset.key ? "bg-maroon text-white dark:bg-gold dark:text-dark-bg" : "bg-white dark:bg-dark-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"}`}>{preset.label}</button>
                  ))}
                  {hasDateFilter && !activeDatePreset && <span className="text-xs text-muted-foreground px-1">Custom</span>}
                </div>
                <div className="flex items-center gap-2">
                  <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setActiveDatePreset(null); setCurrentPage(1); }} className="px-2.5 py-1.5 rounded-lg border border-border bg-white dark:bg-dark-bg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-maroon dark:focus:ring-gold transition-shadow" />
                  <span className="text-xs text-muted-foreground">→</span>
                  <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setActiveDatePreset(null); setCurrentPage(1); }} className="px-2.5 py-1.5 rounded-lg border border-border bg-white dark:bg-dark-bg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-maroon dark:focus:ring-gold transition-shadow" />
                  {hasDateFilter && (
                    <button onClick={clearDateFilter} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors cursor-pointer" title={t.clearDate}>
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t.orderID}</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t.customer}</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">{t.items}</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t.total}</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t.status}</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">{t.paymentMethod}</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">{t.date}</th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedOrders.length === 0 ? (
                      <tr><td colSpan={8} className="p-12 text-center"><div className="flex flex-col items-center gap-2"><ShoppingBag className="w-10 h-10 text-muted-foreground/30" /><p className="text-sm text-muted-foreground">{t.noOrders}</p></div></td></tr>
                    ) : (
                      paginatedOrders.map((order) => (
                        <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors group">
                          <td className="px-6 py-4 text-sm font-semibold text-maroon dark:text-gold">#{order.id}</td>
                          <td className="px-6 py-4"><p className="text-sm font-medium text-foreground">{order.customer.name}</p><p className="text-xs text-muted-foreground">{order.customer.email}</p></td>
                          <td className="px-6 py-4 hidden sm:table-cell"><span className="text-sm text-foreground">{itemCount(order.items)}</span><span className="text-xs text-muted-foreground ml-1">{t.items.toLowerCase()}</span></td>
                          <td className="px-6 py-4 text-sm font-semibold text-foreground">{formatPrice(order.total)}</td>
                          <td className="px-6 py-4"><span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[order.status]}`}><span className={`w-1.5 h-1.5 rounded-full ${statusDotColors[order.status]}`} />{t[STATUS_I18N_KEY[order.status] as keyof typeof t] as string}</span></td>
                          <td className="px-6 py-4 hidden md:table-cell"><span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><CreditCard className="w-3.5 h-3.5" />{t.cash}</span></td>
                          <td className="px-6 py-4 hidden lg:table-cell text-xs text-muted-foreground">{formatDate(order.createdAt)}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleViewOrder(order)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors cursor-pointer" title={t.viewDetails}><Eye className="w-4 h-4" /></button>
                              {deleteConfirm === order.id ? (
                                <div className="flex items-center gap-1">
                                  <button onClick={() => handleDeleteOrder(order.id)} className="px-2 py-1 rounded text-xs font-medium bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer">✓</button>
                                  <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 rounded text-xs font-medium bg-muted text-foreground hover:bg-muted/80 transition-colors cursor-pointer">✕</button>
                                </div>
                              ) : (
                                <button onClick={() => setDeleteConfirm(order.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors cursor-pointer" title={t.deleteOrder}><Trash2 className="w-4 h-4" /></button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {filteredOrders.length > ITEMS_PER_PAGE && (
                <div className="flex items-center justify-between px-6 py-3 border-t border-border">
                  <p className="text-xs text-muted-foreground">{t.showing.replace("{count}", String(paginatedOrders.length)).replace("{total}", String(filteredOrders.length))}</p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"><ChevronLeft className="w-4 h-4 text-muted-foreground" /></button>
                    <span className="text-xs text-muted-foreground px-2">{t.page.replace("{current}", String(currentPage)).replace("{total}", String(totalPages))}</span>
                    <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"><ChevronRight className="w-4 h-4 text-muted-foreground" /></button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </main>
      </div>

      <OrderDetailDrawer order={selectedOrder} open={drawerOpen} onClose={() => { setDrawerOpen(false); setSelectedOrder(null); }} onUpdateStatus={handleUpdateStatus} t={t} />
    </div>
  );
}