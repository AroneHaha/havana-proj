"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  X,
  Package,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ImagePlus,
  ChevronDown,
  Flower2,
  Save,
  Upload,
  Eye,
} from "lucide-react";

import { useAuthStore } from "@/store/auth-store";
import { useLanguageStore } from "@/store/language-store";
import { getDictionary } from "@/i18n";

import AdminTopbar from "@/components/admin/ui/admin-topbar";
import AdminSidebar from "@/components/admin/ui/admin-sidebar";
import { LayoutDashboard, ShoppingBag as ShoppingBagIcon, Users } from "lucide-react";

// ─── Types ───
interface Product {
  id: string;
  name: string;
  nameAr: string;
  category: string;
  price: number;
  stock: number;
  status: "in_stock" | "low_stock" | "sold_out";
  images: string[];
  description: string;
  sku: string;
  soldOut: boolean;
  createdAt: string;
}

type FilterStatus = "all" | "in_stock" | "low_stock" | "sold_out";

// ─── Constants ───
const sidebarItems = [
  { icon: LayoutDashboard, labelKey: "dashboard", href: "/dashboard" },
  { icon: ShoppingBagIcon, labelKey: "orders", href: "/orders" },
  { icon: Package, labelKey: "products", href: "/products" },
  { icon: Users, labelKey: "Reviews", href: "/sales-reviews" },
];

const FILTER_TABS: { key: FilterStatus; label: string }[] = [
  { key: "all", label: "All Products" },
  { key: "in_stock", label: "In Stock" },
  { key: "low_stock", label: "Low Stock" },
  { key: "sold_out", label: "Sold Out" },
];

const CATEGORIES = [
  "Rose Arrangements",
  "Bouquets",
  "Orchids",
  "Lilies",
  "Luxury Boxes",
  "Seasonal",
  "Plants",
  "Accessories",
];

const mockProducts: Product[] = [
  {
    id: "PRD-001",
    name: "Royal Rose Symphony",
    nameAr: "سمفونية الورد الملكي",
    category: "Rose Arrangements",
    price: 699,
    stock: 24,
    status: "in_stock",
    images: ["/images/royal-rose.jpg"],
    description: "Premium red and white roses in an elegant arrangement",
    sku: "HVF-RRS-001",
    soldOut: false,
    createdAt: "2025-03-15",
  },
  {
    id: "PRD-002",
    name: "Golden Hour Bouquet",
    nameAr: "باقة الساعة الذهبية",
    category: "Bouquets",
    price: 620,
    stock: 3,
    status: "low_stock",
    images: ["/images/golden-hour.jpg"],
    description: "Sun-kissed blooms wrapped in gold tissue",
    sku: "HVF-GHB-002",
    soldOut: false,
    createdAt: "2025-03-18",
  },
  {
    id: "PRD-003",
    name: "Midnight Orchid Elegance",
    nameAr: "أناقة الأوركيد الليلية",
    category: "Orchids",
    price: 999,
    stock: 0,
    status: "sold_out",
    images: ["/images/midnight-orchid.jpg"],
    description: "Exotic dark purple orchids in a ceramic vase",
    sku: "HVF-MOE-003",
    soldOut: true,
    createdAt: "2025-04-01",
  },
  {
    id: "PRD-004",
    name: "Pearl White Lilies",
    nameAr: "زنابق اللؤلؤ البيضاء",
    category: "Lilies",
    price: 550,
    stock: 18,
    status: "in_stock",
    images: ["/images/pearl-lilies.jpg"],
    description: "Fragrant white lilies with eucalyptus accents",
    sku: "HVF-PWL-004",
    soldOut: false,
    createdAt: "2025-04-05",
  },
  {
    id: "PRD-005",
    name: "Classic Red Rose Box",
    nameAr: "صندوق الورد الأحمر الكلاسيكي",
    category: "Luxury Boxes",
    price: 410,
    stock: 12,
    status: "in_stock",
    images: ["/images/classic-box.jpg"],
    description: "Long-stem red roses in a velvet hat box",
    sku: "HVF-CRR-005",
    soldOut: false,
    createdAt: "2025-04-10",
  },
  {
    id: "PRD-006",
    name: "Sunset Peony Arrangement",
    nameAr: "ترتيب البيونيا الغروبي",
    category: "Seasonal",
    price: 850,
    stock: 0,
    status: "sold_out",
    images: ["/images/sunset-peony.jpg"],
    description: "Seasonal peonies in warm sunset tones",
    sku: "HVF-SPA-006",
    soldOut: true,
    createdAt: "2025-04-15",
  },
  {
    id: "PRD-007",
    name: "Baby Breath Accent",
    nameAr: "لمسة نبات الورد البيبي",
    category: "Accessories",
    price: 220,
    stock: 5,
    status: "low_stock",
    images: ["/images/baby-breath.jpg"],
    description: "Delicate baby breath for gifting accents",
    sku: "HVF-BBA-007",
    soldOut: false,
    createdAt: "2025-04-20",
  },
  {
    id: "PRD-008",
    name: "Luxe Velvet Wrap",
    nameAr: "لفاف المخمل الفاخر",
    category: "Accessories",
    price: 225,
    stock: 30,
    status: "in_stock",
    images: ["/images/velvet-wrap.jpg"],
    description: "Premium velvet wrapping for bouquet upgrades",
    sku: "HVF-LVW-008",
    soldOut: false,
    createdAt: "2025-04-22",
  },
  {
    id: "PRD-009",
    name: "Tropical Paradise",
    nameAr: "الجنة الاستوائية",
    category: "Bouquets",
    price: 780,
    stock: 8,
    status: "in_stock",
    images: ["/images/tropical.jpg"],
    description: "Vibrant tropical flowers with bird of paradise",
    sku: "HVF-TPR-009",
    soldOut: false,
    createdAt: "2025-05-01",
  },
];

const statusConfig = {
  in_stock: { label: "In Stock", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", dot: "bg-emerald-500" },
  low_stock: { label: "Low Stock", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", dot: "bg-yellow-500" },
  sold_out: { label: "Sold Out", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", dot: "bg-red-500" },
};

// ─── Image Upload Helper ───
function ImageUploader({
  images,
  onUpload,
  onRemove,
  maxImages = 5,
}: {
  images: string[];
  onUpload: (files: FileList) => void;
  onRemove: (index: number) => void;
  maxImages?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) onUpload(e.target.files);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {images.map((img, i) => (
          <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border group">
            <img
              src={img}
              alt={`Product ${i + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => onRemove(i)}
              className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        ))}
        {images.length < maxImages && (
          <button
            onClick={() => inputRef.current?.click()}
            className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-maroon dark:hover:border-gold hover:text-maroon dark:hover:text-gold transition-colors cursor-pointer"
          >
            <ImagePlus className="w-5 h-5" />
            <span className="text-[10px] font-medium">Upload</span>
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
      <p className="text-[10px] text-muted-foreground">{images.length}/{maxImages} images. First image is the main display image.</p>
    </div>
  );
}

// ─── Component ───
export function AdminProducts() {
  const locale = useLanguageStore((s) => s.locale);
  const dict = getDictionary(locale);
  const nav = dict.admin.nav;

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const hydrate = useAuthStore((s) => s.hydrate);
  const hydrated = useAuthStore((s) => s.hydrated);

  const [checking, setChecking] = useState(true);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);

  // Add form
  const [newProduct, setNewProduct] = useState({
    name: "",
    nameAr: "",
    category: "Rose Arrangements",
    price: "",
    stock: "",
    description: "",
    sku: "",
    images: [] as string[],
  });

  // Edit form
  const [editForm, setEditForm] = useState({
    name: "",
    nameAr: "",
    category: "",
    price: "",
    stock: "",
    description: "",
    soldOut: false,
    images: [] as string[],
  });

  const [stockAdjust, setStockAdjust] = useState<{ [id: string]: string }>({});

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

  // ─── Derived ───
  const totalProducts = products.length;
  const inStock = products.filter((p) => p.status === "in_stock").length;
  const lowStock = products.filter((p) => p.status === "low_stock").length;
  const soldOut = products.filter((p) => p.status === "sold_out").length;

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (activeFilter !== "all") result = result.filter((p) => p.status === activeFilter);
    if (categoryFilter !== "all") result = result.filter((p) => p.category === categoryFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.nameAr.includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      );
    }
    return result;
  }, [products, activeFilter, categoryFilter, searchQuery]);

  // ─── Image Helpers ───
  const processFiles = (files: FileList): Promise<string[]> => {
    return Promise.all(
      Array.from(files).map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          })
      )
    );
  };

  // ─── Handlers ───
  const handleAddImageUpload = async (files: FileList) => {
    const newImages = await processFiles(files);
    setNewProduct((p) => ({
      ...p,
      images: [...p.images, ...newImages].slice(0, 5),
    }));
  };

  const handleAddImageRemove = (index: number) => {
    setNewProduct((p) => ({
      ...p,
      images: p.images.filter((_, i) => i !== index),
    }));
  };

  const handleEditImageUpload = async (files: FileList) => {
    const newImages = await processFiles(files);
    setEditForm((p) => ({
      ...p,
      images: [...p.images, ...newImages].slice(0, 5),
    }));
  };

  const handleEditImageRemove = (index: number) => {
    setEditForm((p) => ({
      ...p,
      images: p.images.filter((_, i) => i !== index),
    }));
  };

  const getDerivedStatus = (stock: number, soldOut: boolean): Product["status"] => {
    if (soldOut || stock === 0) return "sold_out";
    if (stock <= 5) return "low_stock";
    return "in_stock";
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.stock) return;
    const p: Product = {
      id: `PRD-${String(products.length + 1).padStart(3, "0")}`,
      name: newProduct.name,
      nameAr: newProduct.nameAr || newProduct.name,
      category: newProduct.category,
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock),
      status: getDerivedStatus(parseInt(newProduct.stock), false),
      images: newProduct.images.length > 0 ? newProduct.images : ["/images/placeholder.jpg"],
      description: newProduct.description,
      sku: newProduct.sku || `HVF-${Date.now().toString(36).toUpperCase()}`,
      soldOut: false,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setProducts((prev) => [p, ...prev]);
    setNewProduct({ name: "", nameAr: "", category: "Rose Arrangements", price: "", stock: "", description: "", sku: "", images: [] });
    setAddModalOpen(false);
  };

  const handleOpenEdit = (product: Product) => {
    setEditProduct(product);
    setEditForm({
      name: product.name,
      nameAr: product.nameAr,
      category: product.category,
      price: product.price.toString(),
      stock: product.stock.toString(),
      description: product.description,
      soldOut: product.soldOut,
      images: [...product.images],
    });
  };

  const handleSaveEdit = () => {
    if (!editProduct) return;
    const newStock = parseInt(editForm.stock);
    const soldOut = editForm.soldOut;
    setProducts((prev) =>
      prev.map((p) =>
        p.id === editProduct.id
          ? { ...p, name: editForm.name, nameAr: editForm.nameAr || editForm.name, category: editForm.category, price: parseFloat(editForm.price), stock: newStock, status: getDerivedStatus(newStock, soldOut), description: editForm.description, soldOut, images: editForm.images.length > 0 ? editForm.images : p.images }
          : p
      )
    );
    setEditProduct(null);
  };

  const handleToggleSoldOut = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const newSoldOut = !p.soldOut;
        return { ...p, soldOut: newSoldOut, status: getDerivedStatus(p.stock, newSoldOut) };
      })
    );
  };

  const handleStockAdjust = (id: string) => {
    const adj = parseInt(stockAdjust[id] || "0");
    if (!adj) return;
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const newStock = Math.max(0, p.stock + adj);
        return { ...p, stock: newStock, status: getDerivedStatus(newStock, p.soldOut) };
      })
    );
    setStockAdjust((prev) => ({ ...prev, [id]: "" }));
  };

  const handleDelete = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setDeleteConfirm(null);
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
        <AdminSidebar sidebarItems={sidebarItems} nav={nav} handleLogout={handleLogout} activePath="/products" />

        <main className="flex-1 p-6 lg:p-8">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {/* ─── Header ─── */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="font-serif text-2xl lg:text-3xl font-bold text-foreground">Products</h1>
                <p className="text-sm text-muted-foreground mt-1">Manage inventory, upload showcase images, and track availability</p>
              </div>
              <button
                onClick={() => setAddModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-maroon text-white dark:bg-gold dark:text-dark-bg text-sm font-medium hover:opacity-90 transition-opacity shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            </div>

            {/* ─── Stats ─── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { label: "Total Products", value: totalProducts, icon: Package, color: "text-blue-500" },
                { label: "In Stock", value: inStock, icon: CheckCircle2, color: "text-emerald-500" },
                { label: "Low Stock", value: lowStock, icon: AlertTriangle, color: "text-yellow-500" },
                { label: "Sold Out", value: soldOut, icon: XCircle, color: "text-red-500" },
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

            {/* ─── Search + Filters ─── */}
            <div className="mb-4 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, SKU, or category..."
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-border bg-white dark:bg-dark-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-maroon dark:focus:ring-gold transition-shadow"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted transition-colors cursor-pointer">
                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                )}
              </div>
              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2.5 rounded-lg border border-border bg-white dark:bg-dark-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-maroon dark:focus:ring-gold transition-shadow cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* ─── Status Tabs ─── */}
            <div className="mb-6 overflow-x-auto scrollbar-hide">
              <div className="flex gap-1.5 pb-1 min-w-max">
                {FILTER_TABS.map((tab) => {
                  const isActive = activeFilter === tab.key;
                  const count = tab.key === "all" ? products.length : products.filter((p) => p.status === tab.key).length;
                  const cfg = tab.key !== "all" ? statusConfig[tab.key] : null;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveFilter(tab.key)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                        isActive ? "bg-maroon text-white dark:bg-gold dark:text-dark-bg" : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                      }`}
                    >
                      {cfg && <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />}
                      {tab.label}
                      <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? "bg-white/20 dark:bg-dark-bg/20" : "bg-muted text-muted-foreground"}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ─── Product Grid ─── */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white dark:bg-dark-card rounded-2xl border border-border p-16 text-center">
                <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No products found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="bg-white dark:bg-dark-card rounded-2xl border border-border overflow-hidden group"
                  >
                    {/* ── Image ── */}
                    <div className="relative aspect-square bg-muted/30 overflow-hidden">
                      {product.soldOut && (
                        <div className="absolute inset-0 z-10 bg-black/50 flex items-center justify-center">
                          <span className="text-white font-bold text-lg tracking-wide uppercase">Sold Out</span>
                        </div>
                      )}
                      {product.images[0] && product.images[0].startsWith("data:") ? (
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Flower2 className="w-16 h-16 text-maroon/20 dark:text-gold/20" />
                        </div>
                      )}

                      {/* Hover actions */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(product)}
                              className="p-2 rounded-lg bg-white/90 dark:bg-dark-card/90 hover:bg-white dark:hover:bg-dark-card transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Edit3 className="w-4 h-4 text-foreground" />
                            </button>
                            <button
                              onClick={() => setPreviewProduct(product)}
                              className="p-2 rounded-lg bg-white/90 dark:bg-dark-card/90 hover:bg-white dark:hover:bg-dark-card transition-colors cursor-pointer"
                              title="Preview"
                            >
                              <Eye className="w-4 h-4 text-foreground" />
                            </button>
                          </div>
                          {deleteConfirm === product.id ? (
                            <div className="flex gap-1">
                              <button onClick={() => handleDelete(product.id)} className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer">Delete</button>
                              <button onClick={() => setDeleteConfirm(null)} className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white/90 dark:bg-dark-card/90 text-foreground hover:bg-white transition-colors cursor-pointer">Cancel</button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(product.id)}
                              className="p-2 rounded-lg bg-red-500/90 hover:bg-red-500 transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-white" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Status badge */}
                      <div className="absolute top-3 left-3 z-20">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-1 rounded-full ${statusConfig[product.status].color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[product.status].dot}`} />
                          {statusConfig[product.status].label}
                        </span>
                      </div>

                      {/* Image count */}
                      {product.images.length > 1 && (
                        <div className="absolute top-3 right-3 z-20 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full">
                          {product.images.length} photos
                        </div>
                      )}
                    </div>

                    {/* ── Info ── */}
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="text-sm font-semibold text-foreground leading-tight">{product.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{product.nameAr}</p>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>

                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-maroon dark:text-gold">QAR {product.price.toLocaleString()}</span>
                        <span className={`text-xs font-medium ${product.stock === 0 ? "text-red-500" : product.stock <= 5 ? "text-yellow-600 dark:text-yellow-400" : "text-muted-foreground"}`}>
                          {product.stock} in stock
                        </span>
                      </div>

                      {/* Stock adjust */}
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={stockAdjust[product.id] || ""}
                          onChange={(e) => setStockAdjust((prev) => ({ ...prev, [product.id]: e.target.value }))}
                          placeholder="+/- stock"
                          className="flex-1 px-2.5 py-2 text-xs rounded-lg border border-border bg-white dark:bg-dark-bg text-foreground focus:outline-none focus:ring-1 focus:ring-maroon dark:focus:ring-gold"
                        />
                        <button
                          onClick={() => handleStockAdjust(product.id)}
                          className="px-3 py-2 rounded-lg bg-maroon text-white dark:bg-gold dark:text-dark-bg text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleSoldOut(product.id)}
                          className={`px-3 py-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                            product.soldOut
                              ? "border-emerald-300 text-emerald-600 dark:border-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                              : "border-red-300 text-red-600 dark:border-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                          }`}
                        >
                          {product.soldOut ? "Restock" : "Sold Out"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Footer count */}
            <div className="mt-4 text-xs text-muted-foreground text-center">
              Showing {filteredProducts.length} of {products.length} products
            </div>
          </motion.div>
        </main>
      </div>

      {/* ─── Add Product Modal ─── */}
      <AnimatePresence>
        {addModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setAddModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="relative bg-white dark:bg-dark-card rounded-2xl border border-border w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-lg font-semibold text-foreground">Add New Product</h2>
                <button onClick={() => setAddModalOpen(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer"><X className="w-4 h-4 text-muted-foreground" /></button>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2">Product Images</label>
                <ImageUploader images={newProduct.images} onUpload={handleAddImageUpload} onRemove={handleAddImageRemove} />
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Product Name (English)</label>
                  <input type="text" value={newProduct.name} onChange={(e) => setNewProduct((p) => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg border border-border bg-white dark:bg-dark-bg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-maroon dark:focus:ring-gold transition-shadow" placeholder="e.g. Royal Rose Symphony" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Product Name (Arabic)</label>
                  <input type="text" value={newProduct.nameAr} onChange={(e) => setNewProduct((p) => ({ ...p, nameAr: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg border border-border bg-white dark:bg-dark-bg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-maroon dark:focus:ring-gold transition-shadow" placeholder="e.g. سمفونية الورد الملكي" dir="rtl" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Category</label>
                    <div className="relative">
                      <select value={newProduct.category} onChange={(e) => setNewProduct((p) => ({ ...p, category: e.target.value }))} className="w-full appearance-none px-3 py-2.5 rounded-lg border border-border bg-white dark:bg-dark-bg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-maroon dark:focus:ring-gold transition-shadow cursor-pointer">
                        {CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">SKU</label>
                    <input type="text" value={newProduct.sku} onChange={(e) => setNewProduct((p) => ({ ...p, sku: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg border border-border bg-white dark:bg-dark-bg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-maroon dark:focus:ring-gold transition-shadow" placeholder="HVF-XXX-000" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Price (QAR)</label>
                    <input type="number" value={newProduct.price} onChange={(e) => setNewProduct((p) => ({ ...p, price: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg border border-border bg-white dark:bg-dark-bg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-maroon dark:focus:ring-gold transition-shadow" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Stock Quantity</label>
                    <input type="number" value={newProduct.stock} onChange={(e) => setNewProduct((p) => ({ ...p, stock: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg border border-border bg-white dark:bg-dark-bg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-maroon dark:focus:ring-gold transition-shadow" placeholder="0" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
                  <textarea value={newProduct.description} onChange={(e) => setNewProduct((p) => ({ ...p, description: e.target.value }))} rows={3} className="w-full px-3 py-2.5 rounded-lg border border-border bg-white dark:bg-dark-bg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-maroon dark:focus:ring-gold transition-shadow resize-none" placeholder="Brief product description..." />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button onClick={() => setAddModalOpen(false)} className="px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors cursor-pointer">Cancel</button>
                <button onClick={handleAddProduct} className="px-5 py-2.5 rounded-lg bg-maroon text-white dark:bg-gold dark:text-dark-bg text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer inline-flex items-center gap-2"><Upload className="w-4 h-4" />Add Product</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Edit Product Modal ─── */}
      <AnimatePresence>
        {editProduct && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditProduct(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="relative bg-white dark:bg-dark-card rounded-2xl border border-border w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-lg font-semibold text-foreground">Edit Product</h2>
                <button onClick={() => setEditProduct(null)} className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer"><X className="w-4 h-4 text-muted-foreground" /></button>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2">Product Images</label>
                <ImageUploader images={editForm.images} onUpload={handleEditImageUpload} onRemove={handleEditImageRemove} />
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Product Name (English)</label>
                  <input type="text" value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg border border-border bg-white dark:bg-dark-bg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-maroon dark:focus:ring-gold transition-shadow" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Product Name (Arabic)</label>
                  <input type="text" value={editForm.nameAr} onChange={(e) => setEditForm((p) => ({ ...p, nameAr: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg border border-border bg-white dark:bg-dark-bg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-maroon dark:focus:ring-gold transition-shadow" dir="rtl" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Category</label>
                    <div className="relative">
                      <select value={editForm.category} onChange={(e) => setEditForm((p) => ({ ...p, category: e.target.value }))} className="w-full appearance-none px-3 py-2.5 rounded-lg border border-border bg-white dark:bg-dark-bg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-maroon dark:focus:ring-gold transition-shadow cursor-pointer">
                        {CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Price (QAR)</label>
                    <input type="number" value={editForm.price} onChange={(e) => setEditForm((p) => ({ ...p, price: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg border border-border bg-white dark:bg-dark-bg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-maroon dark:focus:ring-gold transition-shadow" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Stock Quantity</label>
                    <input type="number" value={editForm.stock} onChange={(e) => setEditForm((p) => ({ ...p, stock: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg border border-border bg-white dark:bg-dark-bg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-maroon dark:focus:ring-gold transition-shadow" />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer px-3 py-2.5 rounded-lg border border-border bg-white dark:bg-dark-bg w-full">
                      <input type="checkbox" checked={editForm.soldOut} onChange={(e) => setEditForm((p) => ({ ...p, soldOut: e.target.checked }))} className="rounded border-border text-maroon dark:text-gold focus:ring-maroon dark:focus:ring-gold" />
                      <span className="text-sm text-foreground">Sold Out</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
                  <textarea value={editForm.description} onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))} rows={3} className="w-full px-3 py-2.5 rounded-lg border border-border bg-white dark:bg-dark-bg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-maroon dark:focus:ring-gold transition-shadow resize-none" />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button onClick={() => setEditProduct(null)} className="px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors cursor-pointer">Cancel</button>
                <button onClick={handleSaveEdit} className="px-5 py-2.5 rounded-lg bg-maroon text-white dark:bg-gold dark:text-dark-bg text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer inline-flex items-center gap-2"><Save className="w-4 h-4" />Save Changes</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Image Preview Modal ─── */}
      <AnimatePresence>
        {previewProduct && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPreviewProduct(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white dark:bg-dark-card rounded-2xl border border-border w-full max-w-2xl overflow-hidden">
              {/* Image carousel */}
              <div className="relative aspect-[16/10] bg-muted/30 overflow-hidden">
                {previewProduct.images[0] && previewProduct.images[0].startsWith("data:") ? (
                  <img src={previewProduct.images[0]} alt={previewProduct.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Flower2 className="w-20 h-20 text-maroon/20 dark:text-gold/20" />
                  </div>
                )}
                <button onClick={() => setPreviewProduct(null)} className="absolute top-3 right-3 p-2 rounded-lg bg-black/40 hover:bg-black/60 transition-colors cursor-pointer">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
              {/* Thumbnails */}
              {previewProduct.images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {previewProduct.images.map((img, i) => (
                    <div key={i} className="w-16 h-16 rounded-lg overflow-hidden border-2 border-border shrink-0">
                      <img src={img} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
              {/* Info */}
              <div className="p-5 space-y-2">
                <h3 className="font-serif text-lg font-semibold text-foreground">{previewProduct.name}</h3>
                <p className="text-sm text-muted-foreground">{previewProduct.nameAr}</p>
                <p className="text-sm text-muted-foreground">{previewProduct.description}</p>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xl font-bold text-maroon dark:text-gold">QAR {previewProduct.price.toLocaleString()}</span>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${statusConfig[previewProduct.status].color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[previewProduct.status].dot}`} />
                    {statusConfig[previewProduct.status].label} · {previewProduct.stock} units
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">SKU: {previewProduct.sku} · {previewProduct.category}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}