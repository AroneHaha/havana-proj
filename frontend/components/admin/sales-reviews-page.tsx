"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Star,
  ShoppingBag,
  Package,
  LayoutDashboard,
  Users,
  Search,
  X,
  TrendingUp,
  DollarSign,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  CreditCard,
} from "lucide-react";

import { useAuthStore } from "@/store/auth-store";
import { useLanguageStore } from "@/store/language-store";
import { getDictionary } from "@/i18n";

import AdminTopbar from "@/components/admin/ui/admin-topbar";
import AdminSidebar from "@/components/admin/ui/admin-sidebar";

// ─── Sidebar ───
const sidebarItems = [
  { icon: LayoutDashboard, labelKey: "dashboard", href: "/dashboard" },
  { icon: ShoppingBag, labelKey: "orders", href: "/orders" },
  { icon: Package, labelKey: "products", href: "/products" },
  { icon: Users, labelKey: "reviews", href: "/sales-reviews" },
];

// ─── Types ───
interface OrderItem {
  productName: string;
  quantity: number;
  price: number;
}

interface Review {
  id: string;
  orderId: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  productName: string;
}

interface Order {
  id: string;
  customerName: string;
  email: string;
  total: number;
  status: string;
  date: string;
  paymentMethod: string;
  category: string;
  items: OrderItem[];
}

// ─── Mock Data ───
const mockOrders: Order[] = [
  { id: "HV-1042", customerName: "Sara Al-Thani", email: "sara@hannibal.com", total: 699, status: "delivered", date: "2025-05-15T14:30", paymentMethod: "COD", category: "Rose Arrangements", items: [{ productName: "Royal Rose Symphony", quantity: 1, price: 699 }] },
  { id: "HV-1041", customerName: "Ahmed Hassan", email: "ahmed@email.com", total: 845, status: "delivered", date: "2025-05-14T10:15", paymentMethod: "COD", category: "Bouquets", items: [{ productName: "Golden Hour Bouquet", quantity: 1, price: 620 }, { productName: "Luxe Velvet Wrap", quantity: 1, price: 225 }] },
  { id: "HV-1040", customerName: "Khalid Noor", email: "khalid@email.com", total: 1549, status: "delivered", date: "2025-05-12T16:45", paymentMethod: "COD", category: "Orchids", items: [{ productName: "Midnight Orchid Elegance", quantity: 1, price: 999 }, { productName: "Pearl White Lilies", quantity: 1, price: 550 }] },
  { id: "HV-1039", customerName: "Fatima Ali", email: "fatima@email.com", total: 1320, status: "inTransit", date: "2025-05-10T09:00", paymentMethod: "COD", category: "Luxury Boxes", items: [{ productName: "Classic Red Rose Box", quantity: 2, price: 550 }, { productName: "Baby Breath Accent", quantity: 1, price: 220 }] },
  { id: "HV-1038", customerName: "Omar Saeed", email: "omar@email.com", total: 410, status: "processing", date: "2025-05-08T11:30", paymentMethod: "COD", category: "Seasonal", items: [{ productName: "Sunset Peony Arrangement", quantity: 1, price: 410 }] },
  { id: "HV-1037", customerName: "Noor Al-Kuwari", email: "noor@email.com", total: 1120, status: "delivered", date: "2025-05-07T13:20", paymentMethod: "COD", category: "Rose Arrangements", items: [{ productName: "Royal Rose Symphony", quantity: 1, price: 699 }, { productName: "Tropical Paradise", quantity: 1, price: 421 }] },
  { id: "HV-1036", customerName: "Hamad Al-Marri", email: "hamad@email.com", total: 550, status: "delivered", date: "2025-05-05T15:10", paymentMethod: "COD", category: "Lilies", items: [{ productName: "Pearl White Lilies", quantity: 1, price: 550 }] },
  { id: "HV-1035", customerName: "Layla Al-Baker", email: "layla@email.com", total: 2245, status: "delivered", date: "2025-05-04T08:45", paymentMethod: "COD", category: "Luxury Boxes", items: [{ productName: "Midnight Orchid Elegance", quantity: 2, price: 999 }, { productName: "Baby Breath Accent", quantity: 1, price: 247 }] },
  { id: "HV-1034", customerName: "Youssef Mansour", email: "youssef@email.com", total: 620, status: "cancelled", date: "2025-05-03T17:00", paymentMethod: "COD", category: "Bouquets", items: [{ productName: "Golden Hour Bouquet", quantity: 1, price: 620 }] },
  { id: "HV-1033", customerName: "Mariam Khalifa", email: "mariam@email.com", total: 870, status: "delivered", date: "2025-05-02T12:30", paymentMethod: "COD", category: "Seasonal", items: [{ productName: "Sunset Peony Arrangement", quantity: 2, price: 820 }, { productName: "Luxe Velvet Wrap", quantity: 1, price: 50 }] },
  { id: "HV-1032", customerName: "Ali Al-Thani", email: "ali@email.com", total: 999, status: "delivered", date: "2025-05-01T10:00", paymentMethod: "COD", category: "Orchids", items: [{ productName: "Midnight Orchid Elegance", quantity: 1, price: 999 }] },
  { id: "HV-1031", customerName: "Dana Al-Emadi", email: "dana@email.com", total: 1350, status: "delivered", date: "2025-04-30T14:15", paymentMethod: "COD", category: "Rose Arrangements", items: [{ productName: "Royal Rose Symphony", quantity: 1, price: 699 }, { productName: "Pearl White Lilies", quantity: 1, price: 550 }, { productName: "Baby Breath Accent", quantity: 1, price: 101 }] },
];

const mockReviews: Review[] = [
  { id: "REV-001", orderId: "HV-1042", customerName: "Sara Al-Thani", rating: 5, comment: "Absolutely stunning arrangement! The roses were fresh and the presentation was beyond my expectations. Will definitely order again.", date: "2025-05-17", productName: "Royal Rose Symphony" },
  { id: "REV-002", orderId: "HV-1041", customerName: "Ahmed Hassan", rating: 5, comment: "The Golden Hour Bouquet was perfect for my anniversary. My wife loved it!", date: "2025-05-14", productName: "Golden Hour Bouquet" },
  { id: "REV-003", orderId: "HV-1041", customerName: "Ahmed Hassan", rating: 4, comment: "Beautiful wrapping, really added a premium feel to the flowers.", date: "2025-05-14", productName: "Luxe Velvet Wrap" },
  { id: "REV-004", orderId: "HV-1040", customerName: "Khalid Noor", rating: 5, comment: "The orchids were gorgeous and lasted over two weeks. Truly luxury quality.", date: "2025-05-13", productName: "Midnight Orchid Elegance" },
  { id: "REV-005", orderId: "HV-1040", customerName: "Khalid Noor", rating: 5, comment: "Elegant white lilies, smelled incredible. Perfect for the dining table.", date: "2025-05-13", productName: "Pearl White Lilies" },
  { id: "REV-006", orderId: "HV-1039", customerName: "Fatima Ali", rating: 4, comment: "Beautiful roses but delivery was slightly delayed. Flowers were still fresh though.", date: "2025-05-11", productName: "Classic Red Rose Box" },
  { id: "REV-007", orderId: "HV-1037", customerName: "Noor Al-Kuwari", rating: 5, comment: "Amazing quality, the roses were perfect for my mother's birthday.", date: "2025-05-09", productName: "Royal Rose Symphony" },
  { id: "REV-008", orderId: "HV-1036", customerName: "Hamad Al-Marri", rating: 4, comment: "Lovely lilies, great value for money.", date: "2025-05-07", productName: "Pearl White Lilies" },
  { id: "REV-009", orderId: "HV-1035", customerName: "Layla Al-Baker", rating: 5, comment: "Ordered two orchid arrangements for an event. Both were stunning!", date: "2025-05-06", productName: "Midnight Orchid Elegance" },
  { id: "REV-010", orderId: "HV-1033", customerName: "Mariam Khalifa", rating: 3, comment: "Peonies were a bit wilted on arrival but customer service was helpful.", date: "2025-05-04", productName: "Sunset Peony Arrangement" },
  { id: "REV-011", orderId: "HV-1032", customerName: "Ali Al-Thani", rating: 5, comment: "The Midnight Orchid is my go-to gift. Never disappoints.", date: "2025-05-03", productName: "Midnight Orchid Elegance" },
  { id: "REV-012", orderId: "HV-1031", customerName: "Dana Al-Emadi", rating: 5, comment: "Combined arrangement was beautifully done. Each flower was fresh.", date: "2025-05-02", productName: "Royal Rose Symphony" },
];

const statusColors: Record<string, string> = {
  delivered: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  inTransit: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  processing: "bg-gold/10 text-gold-dark dark:text-gold",
  cancelled: "bg-red-500/10 text-red-600 dark:text-red-400",
};

const statusDotColors: Record<string, string> = {
  delivered: "bg-emerald-500",
  inTransit: "bg-blue-500",
  processing: "bg-gold",
  cancelled: "bg-red-500",
};

const CATEGORIES = ["All", "Rose Arrangements", "Bouquets", "Orchids", "Lilies", "Luxury Boxes", "Seasonal", "Accessories"];
const STATUS_TABS = ["all", "delivered", "inTransit", "processing", "cancelled"];

// ─── Component ───
export function SalesReviewsPage() {
  const locale = useLanguageStore((s) => s.locale);
  const dict = getDictionary(locale);
  const nav = dict.admin.nav;

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const hydrate = useAuthStore((s) => s.hydrate);
  const hydrated = useAuthStore((s) => s.hydrated);

  const [checking, setChecking] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 6;

  useEffect(() => { hydrate(); }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;
    if (!user || user.role !== "admin") {
      window.location.href = "/login";
      return;
    }
    setChecking(false);
  }, [hydrated, user]);

  const handleLogout = () => { logout(); window.location.href = "/login"; };

  // ─── Sales Overview Stats ───
  const totalOrders = mockOrders.length;
  const totalRevenue = mockOrders.reduce((sum, o) => sum + o.total, 0);
  const totalProductsSold = mockOrders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // ─── Top Selling Products ───
  const topSelling = useMemo(() => {
    const productMap: Record<string, { name: string; sold: number; revenue: number }> = {};
    mockOrders.forEach((o) => {
      o.items.forEach((item) => {
        if (!productMap[item.productName]) {
          productMap[item.productName] = { name: item.productName, sold: 0, revenue: 0 };
        }
        productMap[item.productName].sold += item.quantity;
        productMap[item.productName].revenue += item.price * item.quantity;
      });
    });
    return Object.values(productMap)
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);
  }, []);

  // ─── Recent Transactions (last 5) ───
  const recentTransactions = useMemo(() => {
    return [...mockOrders]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, []);

  // ─── Revenue by day (last 7 days for chart) ───
  const revenueChart = useMemo(() => {
    const days: { label: string; value: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("en-QA", { weekday: "short", day: "numeric" });
      const value = mockOrders
        .filter((o) => o.date.startsWith(dateStr))
        .reduce((sum, o) => sum + o.total, 0);
      days.push({ label, value });
    }
    return days;
  }, []);

  const maxRevenue = Math.max(...revenueChart.map((d) => d.value), 1);

  // ─── Filtered Orders ───
  const filteredOrders = useMemo(() => {
    let result = [...mockOrders];

    if (statusFilter !== "all") {
      result = result.filter((o) => o.status === statusFilter);
    }
    if (categoryFilter !== "All") {
      result = result.filter((o) => o.category === categoryFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.items.some((i) => i.productName.toLowerCase().includes(q))
      );
    }
    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      result = result.filter((o) => new Date(o.date) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter((o) => new Date(o.date) <= to);
    }

    result.sort((a, b) => {
      const diff = new Date(b.date).getTime() - new Date(a.date).getTime();
      return sortOrder === "newest" ? diff : -diff;
    });

    return result;
  }, [searchQuery, statusFilter, categoryFilter, dateFrom, dateTo, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PER_PAGE));
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const reviews = selectedOrder ? mockReviews.filter((r) => r.orderId === selectedOrder.id) : [];

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setCategoryFilter("All");
    setDateFrom("");
    setDateTo("");
    setSortOrder("newest");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery || statusFilter !== "all" || categoryFilter !== "All" || dateFrom || dateTo;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-QA", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
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
      <AdminTopbar user={user} handleLogout={handleLogout} signOutLabel={nav.signOut} />

      <div className="flex">
        <AdminSidebar sidebarItems={sidebarItems} nav={nav} handleLogout={handleLogout} activePath="/sales-reviews" />

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

            {selectedOrder ? (
              /* ═══════════ ORDER DETAIL + REVIEWS ═══════════ */
              <div className="space-y-6">
                <button onClick={() => setSelectedOrder(null)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Sales
                </button>

                <div className="bg-white dark:bg-dark-card rounded-2xl border border-border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="font-serif text-lg font-semibold text-foreground">{selectedOrder.id}</h2>
                      <p className="text-sm text-muted-foreground">{selectedOrder.customerName} · {selectedOrder.email}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[selectedOrder.status] ?? "bg-muted text-muted-foreground"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusDotColors[selectedOrder.status] ?? "bg-gray-400"}`} />
                      {selectedOrder.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Date/Time</p>
                      <p className="font-medium text-foreground">{formatDate(selectedOrder.date)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Items</p>
                      <p className="font-medium text-foreground">{selectedOrder.items.length} products ({selectedOrder.items.reduce((s, i) => s + i.quantity, 0)} qty)</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total</p>
                      <p className="font-medium text-foreground">QAR {selectedOrder.total.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Payment</p>
                      <p className="font-medium text-foreground flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" />{selectedOrder.paymentMethod}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm font-medium text-foreground mb-2">Items Ordered</p>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{item.productName} x{item.quantity}</span>
                          <span className="font-medium text-foreground">QAR {item.price.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <h3 className="font-serif text-lg font-semibold text-foreground">Reviews ({reviews.length})</h3>

                {reviews.length === 0 ? (
                  <div className="bg-white dark:bg-dark-card rounded-2xl border border-border p-8 text-center text-muted-foreground">No reviews for this order yet.</div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="bg-white dark:bg-dark-card rounded-2xl border border-border p-5">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-sm text-foreground">{review.productName}</p>
                            <p className="text-xs text-muted-foreground">{review.date}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* ═══════════ SALES DASHBOARD ═══════════ */
              <div className="space-y-6">
                {/* Header */}
                <div>
                  <h1 className="font-serif text-2xl lg:text-3xl font-bold text-foreground">Sales & Reviews</h1>
                  <p className="text-muted-foreground text-sm mt-1">Track sales performance, browse records, and manage customer reviews</p>
                </div>

                {/* ─── Sales Overview: Summary Cards ─── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { label: "Total Orders", value: totalOrders, icon: ShoppingBag, color: "text-blue-500", change: "+12%" },
                    { label: "Total Revenue", value: `QAR ${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-emerald-500", change: "+18%" },
                    { label: "Products Sold", value: totalProductsSold, icon: Package, color: "text-purple-500", change: "+8%" },
                    { label: "Avg. Order Value", value: `QAR ${avgOrderValue.toLocaleString()}`, icon: TrendingUp, color: "text-gold", change: "+5%" },
                  ].map((stat, i) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.08 }} className="bg-white dark:bg-dark-card rounded-2xl p-5 border border-border">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-muted-foreground font-medium">{stat.label}</span>
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

                {/* ─── Revenue Chart + Top Selling ─── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Revenue Chart */}
                  <div className="lg:col-span-2 bg-white dark:bg-dark-card rounded-2xl border border-border p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-serif text-base font-semibold text-foreground">Revenue (Last 7 Days)</h2>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-end gap-3 h-40">
                      {revenueChart.map((day, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full bg-muted/50 rounded-t-md relative" style={{ height: "120px" }}>
                            <div
                              className="absolute bottom-0 w-full bg-maroon/20 dark:bg-gold/20 rounded-t-md transition-all duration-500"
                              style={{ height: `${(day.value / maxRevenue) * 100}%` }}
                            />
                            <div
                              className="absolute bottom-0 w-full bg-maroon dark:bg-gold rounded-t-md transition-all duration-500"
                              style={{ height: `${(day.value / maxRevenue) * 80}%` }}
                            />
                          </div>
                          {day.value > 0 && (
                            <span className="text-[10px] font-medium text-foreground">QAR {day.value.toLocaleString()}</span>
                          )}
                          <span className="text-[10px] text-muted-foreground">{day.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Selling */}
                  <div className="bg-white dark:bg-dark-card rounded-2xl border border-border p-5">
                    <h2 className="font-serif text-base font-semibold text-foreground mb-4">Top Selling</h2>
                    <div className="space-y-3">
                      {topSelling.map((product, i) => (
                        <div key={product.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">{i + 1}</span>
                            <div>
                              <p className="text-sm font-medium text-foreground leading-tight">{product.name}</p>
                              <p className="text-[10px] text-muted-foreground">{product.sold} sold</p>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-foreground">QAR {product.revenue.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ─── Recent Transactions ─── */}
                <div className="bg-white dark:bg-dark-card rounded-2xl border border-border overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="font-serif text-base font-semibold text-foreground">Recent Transactions</h2>
                    <span className="text-xs text-muted-foreground">Last 5 orders</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Order</th>
                          <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer</th>
                          <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Date</th>
                          <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</th>
                          <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentTransactions.map((order) => (
                          <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                            <td className="px-6 py-3 text-sm font-medium text-maroon dark:text-gold">#{order.id}</td>
                            <td className="px-6 py-3 text-sm text-muted-foreground">{order.customerName}</td>
                            <td className="px-6 py-3 text-sm text-muted-foreground hidden sm:table-cell">{formatDate(order.date)}</td>
                            <td className="px-6 py-3 text-sm font-semibold text-foreground">QAR {order.total.toLocaleString()}</td>
                            <td className="px-6 py-3">
                              <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[order.status]}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${statusDotColors[order.status]}`} />
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ─── Sales Records: Search & Filter ─── */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-serif text-lg font-semibold text-foreground">Sales Records</h2>
                    {hasActiveFilters && (
                      <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-600 transition-colors cursor-pointer flex items-center gap-1">
                        <X className="w-3 h-3" />Clear filters
                      </button>
                    )}
                  </div>

                  {/* Search Bar */}
                  <div className="mb-3">
                    <div className="relative max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        placeholder="Search by order ID, customer, or product..."
                        className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-border bg-white dark:bg-dark-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-maroon dark:focus:ring-gold transition-shadow"
                      />
                      {searchQuery && (
                        <button onClick={() => { setSearchQuery(""); setCurrentPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted transition-colors cursor-pointer">
                          <X className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Filter row: status tabs + category + date picker + sort */}
                  <div className="flex flex-col gap-3 mb-4">
                    {/* Status tabs */}
                    <div className="overflow-x-auto scrollbar-hide">
                      <div className="flex gap-1.5 min-w-max">
                        {STATUS_TABS.map((status) => {
                          const isActive = statusFilter === status;
                          const label = status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1).replace(/([A-Z])/g, " $1").trim();
                          const count = status === "all" ? mockOrders.length : mockOrders.filter((o) => o.status === status).length;
                          return (
                            <button
                              key={status}
                              onClick={() => { setStatusFilter(status); setCurrentPage(1); }}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                                isActive ? "bg-maroon text-white dark:bg-gold dark:text-dark-bg" : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                              }`}
                            >
                              {status !== "all" && <span className={`w-1.5 h-1.5 rounded-full ${statusDotColors[status]}`} />}
                              {label}
                              <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? "bg-white/20 dark:bg-dark-bg/20" : "bg-muted text-muted-foreground"}`}>{count}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Category + Date + Sort row */}
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={categoryFilter}
                        onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                        className="px-3 py-2 rounded-lg border border-border bg-white dark:bg-dark-card text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-maroon dark:focus:ring-gold transition-shadow cursor-pointer"
                      >
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>)}
                      </select>

                      <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
                        className="px-2.5 py-2 rounded-lg border border-border bg-white dark:bg-dark-bg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-maroon dark:focus:ring-gold transition-shadow"
                      />
                      <span className="text-xs text-muted-foreground">to</span>
                      <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
                        className="px-2.5 py-2 rounded-lg border border-border bg-white dark:bg-dark-bg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-maroon dark:focus:ring-gold transition-shadow"
                      />

                      <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
                        className="px-3 py-2 rounded-lg border border-border bg-white dark:bg-dark-card text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-maroon dark:focus:ring-gold transition-shadow cursor-pointer"
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                      </select>
                    </div>
                  </div>

                  {/* ─── Sales Records Table ─── */}
                  <div className="bg-white dark:bg-dark-card rounded-2xl border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border bg-muted/30">
                            <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Order ID</th>
                            <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer</th>
                            <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Products</th>
                            <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Qty Sold</th>
                            <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</th>
                            <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Payment</th>
                            <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Date/Time</th>
                            <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedOrders.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="p-12 text-center">
                                <div className="flex flex-col items-center gap-2">
                                  <ShoppingBag className="w-10 h-10 text-muted-foreground/30" />
                                  <p className="text-sm text-muted-foreground">No sales records found</p>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            paginatedOrders.map((order) => (
                              <tr
                                key={order.id}
                                onClick={() => setSelectedOrder(order)}
                                className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                              >
                                <td className="px-6 py-4 text-sm font-semibold text-maroon dark:text-gold">#{order.id}</td>
                                <td className="px-6 py-4">
                                  <p className="text-sm font-medium text-foreground">{order.customerName}</p>
                                  <p className="text-xs text-muted-foreground">{order.email}</p>
                                </td>
                                <td className="px-6 py-4 hidden md:table-cell">
                                  <div className="space-y-0.5">
                                    {order.items.slice(0, 2).map((item, i) => (
                                      <p key={i} className="text-xs text-muted-foreground truncate max-w-[160px]">{item.productName}</p>
                                    ))}
                                    {order.items.length > 2 && <p className="text-xs text-muted-foreground">+{order.items.length - 2} more</p>}
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-muted-foreground hidden lg:table-cell">{order.items.reduce((s, i) => s + i.quantity, 0)}</td>
                                <td className="px-6 py-4 text-sm font-semibold text-foreground">QAR {order.total.toLocaleString()}</td>
                                <td className="px-6 py-4 hidden md:table-cell">
                                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <CreditCard className="w-3.5 h-3.5" />
                                    {order.paymentMethod}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-xs text-muted-foreground hidden sm:table-cell">{formatDate(order.date)}</td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[order.status]}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${statusDotColors[order.status]}`} />
                                    {order.status}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {filteredOrders.length > PER_PAGE && (
                      <div className="flex items-center justify-between px-6 py-3 border-t border-border">
                        <p className="text-xs text-muted-foreground">
                          Showing {paginatedOrders.length} of {filteredOrders.length} records
                        </p>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer">
                            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <span className="text-xs text-muted-foreground px-2">Page {currentPage} of {totalPages}</span>
                          <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer">
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}