"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Package,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronDown,
} from "lucide-react";
import { ProductGrid } from "./products-table";
import { ProductFormModal, type ProductFormData } from "./product-form-modal";
import { ProductHistoryDrawer } from "./product-history-drawer";
import { useProductsFilters } from "./use-products-filters";
import { useProductsStore, getStockStatus } from "@/store/product-store";
import { StatsCard, SearchInput, FilterTabs } from "@/components/admin/ui/shared";
import { PRODUCT_STATUS_CONFIG, PRODUCT_FILTER_TABS, PRODUCT_CATEGORIES } from "@/lib/constant";
import type { Product } from "@/types";
import type { AdminProduct, FilterStatus } from "./products-types";

// ─── Re-export for convenience (types now live in products-types.ts) ───
export type { AdminProduct, FilterStatus } from "./products-types";

// CATEGORIES is now PRODUCT_CATEGORIES in @/lib/constant
// statusConfig is now PRODUCT_STATUS_CONFIG in @/lib/constant

// ─── Mapper: Product (store) → AdminProduct (UI) ───
function toAdminProduct(p: Product): AdminProduct {
  return {
    id: p.id,
    name: p.name,
    nameAr: p.localeText?.ar?.name || p.name,
    category: p.category,
    price: p.price,
    salePrice: p.salePrice,
    stock: p.stock,
    status: getStockStatus(p),
    images: p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : []),
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

  const handleAddProduct = async (formData: ProductFormData) => {
    // Validate required fields
    if (!formData.name.trim()) return;
    const price = parseFloat(formData.price);
    const stock = parseInt(formData.stock, 10);
    if (isNaN(price) || price < 0) return;
    if (isNaN(stock) || stock < 0) return;
    try {
      await storeAddProduct({
        name: formData.name.trim(),
        description: formData.description,
        price,
        salePrice: undefined,
        image: formData.images[0] || "",
        images: formData.images,
        category: formData.category,
        stock,
        inStock: stock > 0,
        sku: formData.sku.trim() || `HVF-${Date.now().toString(36).toUpperCase()}`,
        localeText: {
          en: { name: formData.name.trim(), description: formData.description },
          ar: { name: formData.nameAr.trim() || formData.name.trim(), description: formData.description },
        },
      });
      setAddModalOpen(false);
    } catch {
      // Error is stored in product store — UI can display via store error state
    }
  };

  const handleOpenEdit = (product: AdminProduct) => {
    setEditProduct(product);
  };

  const handleSaveEdit = async (product: AdminProduct, editForm: ProductFormData) => {
    const newStock = parseInt(editForm.stock, 10);
    const newPrice = parseFloat(editForm.price);
    if (isNaN(newPrice) || newPrice < 0) return;
    if (isNaN(newStock) || newStock < 0) return;
    try {
      await storeUpdateProduct(product.id, {
        name: editForm.name.trim(),
        description: editForm.description,
        price: newPrice,
        salePrice: undefined,
        image: editForm.images[0] || "",
        images: editForm.images,
        category: editForm.category,
        stock: editForm.soldOut ? 0 : newStock,
        inStock: !editForm.soldOut && newStock > 0,
        sku: product.sku,
        localeText: {
          en: { name: editForm.name.trim(), description: editForm.description },
          ar: { name: editForm.nameAr.trim() || editForm.name.trim(), description: editForm.description },
        },
      });
      setEditProduct(null);
    } catch {
      // Error is stored in product store — UI can display via store error state
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await storeDeleteProduct(id);
    } catch {
      // Error is stored in product store — UI can display via store error state
    }
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
        <StatsCard label="Total Products" value={loading ? "..." : totalProducts} icon={Package} color="text-blue-500" index={0} />
        <StatsCard label="In Stock" value={loading ? "..." : inStock} icon={CheckCircle2} color="text-emerald-500" index={1} />
        <StatsCard label="Low Stock" value={loading ? "..." : lowStock} icon={AlertTriangle} color="text-yellow-500" index={2} />
        <StatsCard label="Sold Out" value={loading ? "..." : soldOut} icon={XCircle} color="text-red-500" index={3} />
      </div>

      {/* ─── Search ─── */}
      <div className="mb-4">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name, SKU, or category..."
        />
      </div>

      {/* ─── Status Tabs + Category ─── */}
      <div className="mb-6 flex items-center gap-3">
        <FilterTabs
          tabs={PRODUCT_FILTER_TABS.map((tab) => ({
            key: tab.key,
            label: tab.label,
            count: tab.key === "all" ? products.length : products.filter((p) => p.status === tab.key).length,
            dotColor: tab.key !== "all" ? PRODUCT_STATUS_CONFIG[tab.key]?.dot : undefined,
          }))}
          activeTab={activeFilter}
          onTabChange={(key) => setActiveFilter(key as FilterStatus)}
        />

        {/* Category dropdown — far right */}
        <div className="ml-auto relative">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-1.5 rounded-lg border border-border bg-white dark:bg-dark-card text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-maroon dark:focus:ring-gold transition-shadow cursor-pointer"
          >
            <option value="all">All Categories</option>
            {PRODUCT_CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
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
          <ProductFormModal
            mode="add"
            onClose={() => setAddModalOpen(false)}
            onSubmit={handleAddProduct}
          />
        )}
      </AnimatePresence>

      {/* ─── Edit Product Modal ─── */}
      <AnimatePresence>
        {editProduct && (
          <ProductFormModal
            mode="edit"
            product={editProduct}
            onClose={() => setEditProduct(null)}
            onSubmit={handleSaveEdit}
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