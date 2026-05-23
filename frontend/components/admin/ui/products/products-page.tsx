"use client";

import { useState, useMemo } from "react";
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
  ChevronDown,
  Flower2,
} from "lucide-react";
import { ProductGrid } from "./products-table";
import { AddProductModal } from "./add-product-modal";
import { EditProductModal } from "./edit-product-modal";
import { useProductsFilters } from "./use-products-filters";

// ─── Types ───
export interface AdminProduct {
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

export type FilterStatus = "all" | "in_stock" | "low_stock" | "sold_out";

// ─── Constants ───
export const CATEGORIES = [
  "Rose Arrangements",
  "Bouquets",
  "Orchids",
  "Lilies",
  "Luxury Boxes",
  "Seasonal",
  "Plants",
  "Accessories",
];

const FILTER_TABS: { key: FilterStatus; label: string }[] = [
  { key: "all", label: "All Products" },
  { key: "in_stock", label: "In Stock" },
  { key: "low_stock", label: "Low Stock" },
  { key: "sold_out", label: "Sold Out" },
];

export const statusConfig = {
  in_stock: { label: "In Stock", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", dot: "bg-emerald-500" },
  low_stock: { label: "Low Stock", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", dot: "bg-yellow-500" },
  sold_out: { label: "Sold Out", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", dot: "bg-red-500" },
};

// ─── Mock Data ───
const mockProducts: AdminProduct[] = [
  { id: "PRD-001", name: "Royal Rose Symphony", nameAr: "سمفونية الورد الملكي", category: "Rose Arrangements", price: 699, stock: 24, status: "in_stock", images: ["/images/royal-rose.jpg"], description: "Premium red and white roses in an elegant arrangement", sku: "HVF-RRS-001", soldOut: false, createdAt: "2025-03-15" },
  { id: "PRD-002", name: "Golden Hour Bouquet", nameAr: "باقة الساعة الذهبية", category: "Bouquets", price: 620, stock: 3, status: "low_stock", images: ["/images/golden-hour.jpg"], description: "Sun-kissed blooms wrapped in gold tissue", sku: "HVF-GHB-002", soldOut: false, createdAt: "2025-03-18" },
  { id: "PRD-003", name: "Midnight Orchid Elegance", nameAr: "أناقة الأوركيد الليلية", category: "Orchids", price: 999, stock: 0, status: "sold_out", images: ["/images/midnight-orchid.jpg"], description: "Exotic dark purple orchids in a ceramic vase", sku: "HVF-MOE-003", soldOut: true, createdAt: "2025-04-01" },
  { id: "PRD-004", name: "Pearl White Lilies", nameAr: "زنابق اللؤلؤ البيضاء", category: "Lilies", price: 550, stock: 18, status: "in_stock", images: ["/images/pearl-lilies.jpg"], description: "Fragrant white lilies with eucalyptus accents", sku: "HVF-PWL-004", soldOut: false, createdAt: "2025-04-05" },
  { id: "PRD-005", name: "Classic Red Rose Box", nameAr: "صندوق الورد الأحمر الكلاسيكي", category: "Luxury Boxes", price: 410, stock: 12, status: "in_stock", images: ["/images/classic-box.jpg"], description: "Long-stem red roses in a velvet hat box", sku: "HVF-CRR-005", soldOut: false, createdAt: "2025-04-10" },
  { id: "PRD-006", name: "Sunset Peony Arrangement", nameAr: "ترتيب البيونيا الغروبي", category: "Seasonal", price: 850, stock: 0, status: "sold_out", images: ["/images/sunset-peony.jpg"], description: "Seasonal peonies in warm sunset tones", sku: "HVF-SPA-006", soldOut: true, createdAt: "2025-04-15" },
  { id: "PRD-007", name: "Baby Breath Accent", nameAr: "لمسة نبات الورد البيبي", category: "Accessories", price: 220, stock: 5, status: "low_stock", images: ["/images/baby-breath.jpg"], description: "Delicate baby breath for gifting accents", sku: "HVF-BBA-007", soldOut: false, createdAt: "2025-04-20" },
  { id: "PRD-008", name: "Luxe Velvet Wrap", nameAr: "لفاف المخمل الفاخر", category: "Accessories", price: 225, stock: 30, status: "in_stock", images: ["/images/velvet-wrap.jpg"], description: "Premium velvet wrapping for bouquet upgrades", sku: "HVF-LVW-008", soldOut: false, createdAt: "2025-04-22" },
  { id: "PRD-009", name: "Tropical Paradise", nameAr: "الجنة الاستوائية", category: "Bouquets", price: 780, stock: 8, status: "in_stock", images: ["/images/tropical.jpg"], description: "Vibrant tropical flowers with bird of paradise", sku: "HVF-TPR-009", soldOut: false, createdAt: "2025-05-01" },
];

// ─── Component ───
export function ProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>(mockProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<AdminProduct | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [stockAdjust, setStockAdjust] = useState<{ [id: string]: string }>({});

  const totalProducts = products.length;
  const inStock = products.filter((p) => p.status === "in_stock").length;
  const lowStock = products.filter((p) => p.status === "low_stock").length;
  const soldOut = products.filter((p) => p.status === "sold_out").length;

  const { filteredProducts } = useProductsFilters(products, searchQuery, activeFilter, categoryFilter);

  const getDerivedStatus = (stock: number, soldOut: boolean): AdminProduct["status"] => {
    if (soldOut || stock === 0) return "sold_out";
    if (stock <= 5) return "low_stock";
    return "in_stock";
  };

  const handleAddProduct = (newProduct: { name: string; nameAr: string; category: string; price: string; stock: string; description: string; sku: string; images: string[] }) => {
    if (!newProduct.name || !newProduct.price || !newProduct.stock) return;
    const p: AdminProduct = {
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
    setAddModalOpen(false);
  };

  const handleOpenEdit = (product: AdminProduct) => { setEditProduct(product); };

  const handleSaveEdit = (product: AdminProduct, editForm: { name: string; nameAr: string; category: string; price: string; stock: string; description: string; soldOut: boolean; images: string[] }) => {
    const newStock = parseInt(editForm.stock);
    const soldOut = editForm.soldOut;
    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id
          ? { ...p, name: editForm.name, nameAr: editForm.nameAr || editForm.name, category: editForm.category, price: parseFloat(editForm.price), stock: newStock, status: getDerivedStatus(newStock, soldOut), description: editForm.description, soldOut, images: editForm.images.length > 0 ? editForm.images : p.images }
          : p
      )
    );
    setEditProduct(null);
  };

  const handleToggleSoldOut = (id: string) => {
    setProducts((prev) => prev.map((p) => { if (p.id !== id) return p; const ns = !p.soldOut; return { ...p, soldOut: ns, status: getDerivedStatus(p.stock, ns) }; }));
  };

  const handleStockAdjust = (id: string) => {
    const adj = parseInt(stockAdjust[id] || "0");
    if (!adj) return;
    setProducts((prev) => prev.map((p) => { if (p.id !== id) return p; const ns = Math.max(0, p.stock + adj); return { ...p, stock: ns, status: getDerivedStatus(ns, p.soldOut) }; }));
    setStockAdjust((prev) => ({ ...prev, [id]: "" }));
  };

  const handleDelete = (id: string) => { setProducts((prev) => prev.filter((p) => p.id !== id)); setDeleteConfirm(null); };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl lg:text-3xl font-bold text-foreground">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage inventory, upload showcase images, and track availability</p>
        </div>
        <button onClick={() => setAddModalOpen(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-maroon text-white dark:bg-gold dark:text-dark-bg text-sm font-medium hover:opacity-90 transition-opacity shrink-0 cursor-pointer">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Stats */}
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

      {/* Search + Category Filter */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by name, SKU, or category..." className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-border bg-white dark:bg-dark-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-maroon dark:focus:ring-gold transition-shadow" />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted transition-colors cursor-pointer">
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </div>
        <div className="relative">
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="appearance-none pl-3 pr-8 py-2.5 rounded-lg border border-border bg-white dark:bg-dark-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-maroon dark:focus:ring-gold transition-shadow cursor-pointer">
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Status Tabs */}
      <div className="mb-6 overflow-x-auto scrollbar-hide">
        <div className="flex gap-1.5 pb-1 min-w-max">
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab.key;
            const count = tab.key === "all" ? products.length : products.filter((p) => p.status === tab.key).length;
            const cfg = tab.key !== "all" ? statusConfig[tab.key] : null;
            return (
              <button key={tab.key} onClick={() => setActiveFilter(tab.key)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${isActive ? "bg-maroon text-white dark:bg-gold dark:text-dark-bg" : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"}`}>
                {cfg && <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />}
                {tab.label}
                <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? "bg-white/20 dark:bg-dark-bg/20" : "bg-muted text-muted-foreground"}`}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Grid */}
      <ProductGrid products={filteredProducts} stockAdjust={stockAdjust} onStockAdjustChange={setStockAdjust} onStockAdjust={handleStockAdjust} onToggleSoldOut={handleToggleSoldOut} onOpenEdit={handleOpenEdit} onDelete={handleDelete} deleteConfirm={deleteConfirm} setDeleteConfirm={setDeleteConfirm} />

      <div className="mt-4 text-xs text-muted-foreground text-center">Showing {filteredProducts.length} of {products.length} products</div>

      {/* Add Product Modal */}
      <AnimatePresence>
        {addModalOpen && <AddProductModal onClose={() => setAddModalOpen(false)} onAdd={handleAddProduct} />}
      </AnimatePresence>

      {/* Edit Product Modal */}
      <AnimatePresence>
        {editProduct && <EditProductModal product={editProduct} onClose={() => setEditProduct(null)} onSave={handleSaveEdit} />}
      </AnimatePresence>
    </motion.div>
  );
}