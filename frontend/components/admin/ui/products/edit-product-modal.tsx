"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Save, ChevronDown } from "lucide-react";
import { ImageUploader } from "./image-uploader";
import { CATEGORIES } from "./products-page";
import type { AdminProduct } from "./products-page";

interface EditProductModalProps {
  product: AdminProduct;
  onClose: () => void;
  onSave: (
    product: AdminProduct,
    editForm: {
      name: string;
      nameAr: string;
      category: string;
      price: string;
      stock: string;
      description: string;
      soldOut: boolean;
      images: string[];
    }
  ) => void;
}

export function EditProductModal({ product, onClose, onSave }: EditProductModalProps) {
  const [editForm, setEditForm] = useState({
    name: product.name,
    nameAr: product.nameAr,
    category: product.category,
    price: product.price.toString(),
    stock: product.stock.toString(),
    description: product.description,
    soldOut: product.soldOut,
    images: [...product.images],
  });

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

  const handleImageUpload = async (files: FileList) => {
    const newImages = await processFiles(files);
    setEditForm((p) => ({
      ...p,
      images: [...p.images, ...newImages].slice(0, 5),
    }));
  };

  const handleImageRemove = (index: number) => {
    setEditForm((p) => ({
      ...p,
      images: p.images.filter((_, i) => i !== index),
    }));
  };

  const handleSave = () => {
    onSave(product, editForm);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="relative bg-white dark:bg-dark-card rounded-2xl border border-border w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold text-foreground">Edit Product</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer"><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-2">Product Images</label>
          <ImageUploader images={editForm.images} onUpload={handleImageUpload} onRemove={handleImageRemove} />
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
          <button onClick={onClose} className="px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors cursor-pointer">Cancel</button>
          <button onClick={handleSave} className="px-5 py-2.5 rounded-lg bg-maroon text-white dark:bg-gold dark:text-dark-bg text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer inline-flex items-center gap-2"><Save className="w-4 h-4" />Save Changes</button>
        </div>
      </motion.div>
    </motion.div>
  );
}