"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Upload, Save, ChevronDown } from "lucide-react";
import { ImageUploader } from "./image-uploader";
import { PRODUCT_CATEGORIES } from "@/lib/constant";
import type { AdminProduct } from "./products-types";

export function processFiles(files: FileList): Promise<string[]> {
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
}

/**
 * Build a FormData object from the product form data + raw files.
 * When the backend is live, use this instead of processFiles() to send
 * multipart/form-data (Laravel expects file uploads via FormData, not base64).
 *
 * For now, this is provided as a ready-to-use alternative. The product service
 * layer can switch to this by accepting FormData instead of JSON.
 */
export function buildProductFormData(
  formData: ProductFormData,
  files: File[]
): FormData {
  const fd = new FormData();
  fd.append("name", formData.name);
  fd.append("name_ar", formData.nameAr);
  fd.append("category", formData.category);
  fd.append("price", formData.price);
  fd.append("stock", formData.stock);
  fd.append("description", formData.description);
  if (formData.sku) fd.append("sku", formData.sku);
  if (formData.soldOut) fd.append("sold_out", "1");
  files.forEach((file, i) => {
    fd.append(`images[${i}]`, file);
  });
  // Keep existing base64 images that weren't replaced
  formData.images.forEach((img, i) => {
    if (!img.startsWith("data:")) {
      fd.append(`existing_images[${i}]`, img);
    }
  });
  return fd;
}

export type ProductFormMode = "add" | "edit";

export interface ProductFormData {
  name: string;
  nameAr: string;
  category: string;
  price: string;
  stock: string;
  description: string;
  sku: string;
  soldOut: boolean;
  images: string[];
}

interface ProductFormModalProps {
  mode: "add";
  onClose: () => void;
  onSubmit: (data: ProductFormData) => void;
}

interface ProductFormModalEditProps {
  mode: "edit";
  product: AdminProduct;
  onClose: () => void;
  onSubmit: (product: AdminProduct, data: ProductFormData) => void;
}

type ProductFormModalPropsUnion = ProductFormModalProps | ProductFormModalEditProps;

export function ProductFormModal(props: ProductFormModalPropsUnion) {
  const { mode, onClose } = props;
  const isEdit = mode === "edit";
  const product = isEdit ? (props as ProductFormModalEditProps).product : null;

  const [form, setForm] = useState<ProductFormData>({
    name: product?.name ?? "",
    nameAr: product?.nameAr ?? "",
    category: product?.category ?? "Rose Arrangements",
    price: product?.price?.toString() ?? "",
    stock: product?.stock?.toString() ?? "",
    description: product?.description ?? "",
    sku: product?.sku ?? "",
    soldOut: product?.soldOut ?? false,
    images: product ? [...product.images] : [],
  });

  // When soldOut is checked, disable and visually indicate the stock field
  const stockDisabled = form.soldOut;

  const handleImageUpload = async (files: FileList) => {
    const newImages = await processFiles(files);
    setForm((p) => ({
      ...p,
      images: [...p.images, ...newImages].slice(0, 5),
    }));
  };

  const handleImageRemove = (index: number) => {
    setForm((p) => ({
      ...p,
      images: p.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = () => {
    if (isEdit && product) {
      (props as ProductFormModalEditProps).onSubmit(product, form);
    } else {
      (props as ProductFormModalProps).onSubmit(form);
    }
  };

  const title = isEdit ? "Edit Product" : "Add New Product";
  const SubmitIcon = isEdit ? Save : Upload;
  const submitLabel = isEdit ? "Save Changes" : "Add Product";

  const inputClass = "w-full px-3 py-2.5 rounded-xl border border-border bg-white dark:bg-dark-bg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-maroon/15 dark:focus:ring-gold/15 focus:border-maroon dark:focus:border-gold transition-all duration-200 shadow-sm hover:shadow-none ring-1 ring-black/[0.03] dark:ring-white/[0.03]";
  const labelClass = "block text-xs font-medium text-muted-foreground mb-1";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative bg-white dark:bg-dark-card rounded-2xl border border-border ring-1 ring-black/[0.05] dark:ring-white/[0.05] shadow-xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold text-foreground">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted/60 hover:shadow-xs transition-all cursor-pointer"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Images */}
        <div>
          <label className={labelClass}>
            Product Images
          </label>
          <ImageUploader
            images={form.images}
            onUpload={handleImageUpload}
            onRemove={handleImageRemove}
          />
        </div>

        {/* Form Fields */}
        <div className="space-y-3">
          <div>
            <label className={labelClass}>
              Product Name (English)
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className={inputClass}
              placeholder="e.g. Royal Rose Symphony"
            />
          </div>

          <div>
            <label className={labelClass}>
              Product Name (Arabic)
            </label>
            <input
              type="text"
              value={form.nameAr}
              onChange={(e) => setForm((p) => ({ ...p, nameAr: e.target.value }))}
              className={inputClass}
              placeholder="e.g. سمفونية الورد الملكي"
              dir="rtl"
            />
          </div>

          {/* Row: Category + (Add: SKU | Edit: Price) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>
                Category
              </label>
              <div className="relative">
                <select
                  value={form.category}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  className={`${inputClass} appearance-none cursor-pointer pr-8`}
                >
                  {PRODUCT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            {isEdit ? (
              <div>
                <label className={labelClass}>
                  Price (KD)
                </label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                  className={inputClass}
                />
              </div>
            ) : (
              <div>
                <label className={labelClass}>
                  SKU
                </label>
                <input
                  type="text"
                  value={form.sku}
                  onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))}
                  className={inputClass}
                  placeholder="HVF-XXX-000"
                />
              </div>
            )}
          </div>

          {/* Row: Price + Stock (add mode) | Stock + Sold Out (edit mode) */}
          <div className="grid grid-cols-2 gap-3">
            {isEdit ? (
              <>
                <div>
                  <label className={labelClass}>
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer px-3 py-2.5 rounded-xl border border-border bg-white dark:bg-dark-bg w-full shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.03]">
                    <input
                      type="checkbox"
                      checked={form.soldOut}
                      onChange={(e) => setForm((p) => ({ ...p, soldOut: e.target.checked }))}
                      className="rounded border-border text-maroon dark:text-gold focus:ring-maroon dark:focus:ring-gold"
                    />
                    <span className="text-sm text-foreground">Sold Out</span>
                  </label>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className={labelClass}>
                    Price (KD)
                  </label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                    className={inputClass}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))}
                    className={inputClass}
                    placeholder="0"
                  />
                </div>
              </>
            )}
          </div>

          <div>
            <label className={labelClass}>
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={3}
              className={`${inputClass} resize-none`}
              placeholder="Brief product description..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted hover:shadow-xs transition-all duration-200 cursor-pointer ring-1 ring-black/[0.02] dark:ring-white/[0.02]"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-maroon to-maroon-light text-white dark:from-gold dark:to-gold-light dark:text-dark-bg text-sm font-medium hover:opacity-90 transition-all duration-200 cursor-pointer inline-flex items-center gap-2 shadow-md hover:shadow-lg active:scale-[0.98] ring-1 ring-maroon/20 dark:ring-gold/20"
          >
            <SubmitIcon className="w-4 h-4" />
            {submitLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}