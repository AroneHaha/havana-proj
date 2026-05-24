"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Upload, ChevronDown } from "lucide-react";
import { ImageUploader } from "./image-uploader";
import { CATEGORIES } from "./products-page";

interface AddProductModalProps {
  onClose: () => void;
  onAdd: (product: { name: string; nameAr: string; category: string; price: string; stock: string; description: string; sku: string; images: string[] }) => void;
}

export function AddProductModal({ onClose, onAdd }: AddProductModalProps) {
  const [form, setForm] = useState({ name: "", nameAr: "", category: "Rose Arrangements", price: "", stock: "", description: "", sku: "", images: [] as string[] });

  const processFiles = (files: FileList): Promise<string[]> => {
    return Promise.all(Array.from(files).map((file) => new Promise<string>((resolve) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result as string); reader.readAsDataURL(file); })));
  };

  const handleImageUpload = async (files: FileList) => {
    const newImages = await processFiles(files);
    setForm((p) => ({ ...p, images: [...p.images, ...newImages].slice(0, 5) }));
  };

  const handleImageRemove = (index: number) => {
    setForm((p) => ({ ...p, images: p.images.filter((_, i) => i !== index) }));
  };

  const handleAddProduct = () => {
    onAdd(form);
    setForm({ name: "", nameAr: "", category: "Rose Arrangements", price: "", stock: "", description: "", sku: "", images: [] });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="relative bg-white dark:bg-dark-card rounded-2xl border border-border w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold text-foreground">Add New Product</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer"><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-2">Product Images</label>
          <ImageUploader images={form.images} onUpload={handleImageUpload} onRemove={handleImageRemove} />
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Product Name (English)</label>
            <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg border border-border bg-white dark:bg-dark-bg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-maroon dark:focus:ring-gold transition-shadow" placeholder="e.g. Royal Rose Symphony" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Product Name (Arabic)</label>
            <input type="text" value={form.nameAr} onChange={(e) => setForm((p) => ({ ...p, nameAr: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg border border-border bg-white dark:bg-dark-bg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-maroon dark:focus:ring-gold transition-shadow" placeholder="e.g. سمفونية الورد الملكي" dir="rtl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Category</label>
              <div className="relative">
                <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="w-full appearance-none px-3 py-2.5 rounded-lg border border-border bg-white dark:bg-dark-bg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-maroon dark:focus:ring-gold transition-shadow cursor-pointer">
                  {CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">SKU</label>
              <input type="text" value={form.sku} onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg border border-border bg-white dark:bg-dark-bg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-maroon dark:focus:ring-gold transition-shadow" placeholder="HVF-XXX-000" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Price (QAR)</label>
              <input type="number" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg border border-border bg-white dark:bg-dark-bg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-maroon dark:focus:ring-gold transition-shadow" placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Stock Quantity</label>
              <input type="number" value={form.stock} onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg border border-border bg-white dark:bg-dark-bg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-maroon dark:focus:ring-gold transition-shadow" placeholder="0" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} className="w-full px-3 py-2.5 rounded-lg border border-border bg-white dark:bg-dark-bg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-maroon dark:focus:ring-gold transition-shadow resize-none" placeholder="Brief product description..." />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors cursor-pointer">Cancel</button>
          <button onClick={handleAddProduct} className="px-5 py-2.5 rounded-lg bg-maroon text-white dark:bg-gold dark:text-dark-bg text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer inline-flex items-center gap-2"><Upload className="w-4 h-4" />Add Product</button>
        </div>
      </motion.div>
    </motion.div>
  );
}