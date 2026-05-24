"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  X,
  Package,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronDown,
} from "lucide-react";
import { ProductGrid } from "./products-table";
import { AddProductModal } from "./add-product-modal";
import { EditProductModal } from "./edit-product-modal";
import { ProductHistoryDrawer } from "./product-history-drawer";
import { useProductsFilters } from "./use-products-filters";
import { useProductsStore, getStockStatus } from "@/store/product-store";
import type { Product } from "@/types";

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

// ─── Mapper: Product (store) → AdminProduct (UI) ───
function toAdminProduct(p: Product): AdminProduct {
  return {
    id: p.id,
    name: p.name,
    nameAr: p.localeText?.ar?.name || p.name,
    category: p.category,
    price: p.salePrice ?? p.price,
    stock: p.stock,
    status: getStockStatus(p),
    images: p.images && p.images.length > 0 ? p.images : [p.image],
    description: p.description,
    sku: p.sku || "",
    soldOut: p.stock <= 0,
    createdAt: p.createdAt?.split("T")[0] || "",
  };
}

// ─── Component ───
export function ProductsPage() {
  const storeProducts = useProductsStore((s) => s.products);
  const loading = useProductsStore((s) => s.loading);
  const fetchProducts = useProductsStore((s) => s.fetchProducts);
  const storeAddProduct = useProductsStore((s) => s.addProduct);
  const storeUpdateProduct = useProductsStore((s) => s.updateProduct);
  const storeDeleteProduct = useProductsStore((s) => s.deleteProduct);

  // Fetch on mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Map store products → admin products
  const products = useMemo(() => storeProducts.map(toAdminProduct), [storeProducts]);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<AdminProduct | null>(null);
  const [previewProduct, setPreviewProduct] = useState<AdminProduct | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // ─── Derived ───
  const totalProducts = products.length;
  const inStock = products.filter((p) => p.status === "in_stock").length;
  const lowStock = products.filter((p) => p.status === "low_stock").length;
  const soldOut = products.filter((p) => p.status === "sold_out").length;

  const { filteredProducts } = useProductsFilters(products, searchQuery, activeFilter, categoryFilter);

  // ─── Handlers ───
  const getDerivedStatus = (stock: number): AdminProduct["status"] => {
    if (stock <= 0) return "sold_out";
    if (stock < 10) return "low_stock";
    return "in_stock";
  };

  const handleAddProduct = (newProduct: {
    name: string;
    nameAr: string;
    category: string;
    price: string;
    stock: string;
    description: string;
    sku: string;
    images: string[];
  }) => {
    if (!newProduct.name || !newProduct.price || !newProduct.stock) return;
    storeAddProduct({
      name: newProduct.name,
      description: newProduct.description,
      price: parseFloat(newProduct.price),
      salePrice: parseFloat(newProduct.price),
      image: newProduct.images[0] || "",
      images: newProduct.images,
      category: newProduct.category,
      stock: parseInt(newProduct.stock),
      inStock: parseInt(newProduct.stock) > 0,
      sku: newProduct.sku || `HVF-${Date.now().toString(36).toUpperCase()}`,
      localeText: {
        en: { name: newProduct.name, description: newProduct.description },
        ar: { name: newProduct.nameAr || newProduct.name, description: newProduct.description },
      },
    });
    setAddModalOpen(false);
  };

  const handleOpenEdit = (product: AdminProduct) => {
    setEditProduct(product);
  };

  const handleSaveEdit = (product: AdminProduct, editForm: {
    name: string;
    nameAr: string;
    category: string;
    price: string;
    stock: string;
    description: string;
    soldOut: boolean;
    images: string[];
  }) => {
    const newStock = parseInt(editForm.stock);
    storeUpdateProduct(product.id, {
      name: editForm.name,
      description: editForm.description,
      price: parseFloat(editForm.price),
      salePrice: parseFloat(editForm.price),
      image: editForm.images[0] || "",
      images: editForm.images,
      category: editForm.category,
      stock: editForm.soldOut ? 0 : newStock,
      inStock: !editForm.soldOut && newStock > 0,
      sku: product.sku,
      localeText: {
        en: { name: editForm.name, description: editForm.description },
        ar: { name: editForm.nameAr || editForm.name, description: editForm.description },
      },
    });
    setEditProduct(null);
  };

  const handleDelete = (id: string) => {
    storeDeleteProduct(id);
    setDeleteConfirm(null);
  };

  // ─── Render ───
  return (
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
            {loading ? (
              <div className="h-8 w-16 bg-muted rounded-lg animate-pulse" />
            ) : (
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            )}
          </motion.div>
        ))}
      </div>

      {/* ─── Search ─── */}
      <div className="mb-4">
        <div className="relative max-w-md">
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
      </div>

      {/* ─── Status Tabs + Category ─── */}
      <div className="mb-6 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-1.5 pb-1 min-w-max">
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

          {/* Category dropdown — far right */}
          <div className="ml-auto relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 rounded-lg border border-border bg-white dark:bg-dark-card text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-maroon dark:focus:ring-gold transition-shadow cursor-pointer"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ─── Product Grid ─── */}
      <ProductGrid
        products={filteredProducts}
        onOpenEdit={handleOpenEdit}
        onPreview={(product) => setPreviewProduct(product)}
        onDelete={handleDelete}
        deleteConfirm={deleteConfirm}
        setDeleteConfirm={setDeleteConfirm}
      />

      {/* Footer count */}
      <div className="mt-4 text-xs text-muted-foreground text-center">
        Showing {filteredProducts.length} of {products.length} products
      </div>

      {/* ─── Add Product Modal ─── */}
      <AnimatePresence>
        {addModalOpen && (
          <AddProductModal
            onClose={() => setAddModalOpen(false)}
            onAdd={handleAddProduct}
          />
        )}
      </AnimatePresence>

      {/* ─── Edit Product Modal ─── */}
      <AnimatePresence>
        {editProduct && (
          <EditProductModal
            product={editProduct}
            onClose={() => setEditProduct(null)}
            onSave={handleSaveEdit}
          />
        )}
      </AnimatePresence>

      {/* ─── Product History Drawer ─── */}
      <ProductHistoryDrawer
        product={previewProduct}
        open={!!previewProduct}
        onClose={() => setPreviewProduct(null)}
        onEdit={(product) => { setPreviewProduct(null); handleOpenEdit(product); }}
        onDelete={(id) => { setPreviewProduct(null); handleDelete(id); }}
      />
    </motion.div>
  );
}