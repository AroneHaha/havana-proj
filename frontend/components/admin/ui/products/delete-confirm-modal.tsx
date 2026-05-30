"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Loader2, CheckCircle2, AlertCircle, Flower2 } from "lucide-react";
import type { AdminProduct } from "./products-types";

interface DeleteConfirmModalProps {
  product: AdminProduct | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
}

export function DeleteConfirmModal({ product, open, onClose, onConfirm }: DeleteConfirmModalProps) {
  const [deleting, setDeleting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (!product) return null;

  const handleDelete = async () => {
    setDeleting(true);
    setError("");
    try {
      await onConfirm(product.id);
      setSuccess(true);
      // Auto-close after showing success
      setTimeout(() => {
        setSuccess(false);
        setDeleting(false);
        onClose();
      }, 1200);
    } catch (err) {
      setDeleting(false);
      setError(
        err instanceof Error ? err.message : "Failed to delete product. Please try again."
      );
    }
  };

  const handleClose = () => {
    if (deleting) return; // Prevent closing while deleting
    setSuccess(false);
    setError("");
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative bg-white dark:bg-dark-card rounded-2xl border border-border ring-1 ring-black/[0.05] dark:ring-white/[0.05] shadow-xl w-full max-w-sm p-6"
          >
            {/* Success State */}
            {success ? (
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-foreground text-center">
                  Product Deleted!
                </h3>
                <p className="text-sm text-muted-foreground text-center">
                  &quot;{product.name}&quot; has been removed from your inventory.
                </p>
              </div>
            ) : (
              <>
                {/* Delete Icon */}
                <div className="flex flex-col items-center gap-4 mb-6">
                  <div className="h-14 w-14 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                    <Trash2 className="h-7 w-7 text-red-500" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-serif text-lg font-semibold text-foreground">
                      Delete Product
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      This action cannot be undone. The product will be removed from your inventory.
                    </p>
                  </div>
                </div>

                {/* Product Preview */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border mb-4">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted/30 shrink-0">
                    {product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Flower2 className="w-5 h-5 text-maroon/20 dark:text-gold/20" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                    {product.sku && (
                      <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                    )}
                    <p className="text-xs text-muted-foreground">{product.category}</p>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 mb-4">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={handleClose}
                    disabled={deleting}
                    className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted hover:shadow-xs transition-all duration-200 cursor-pointer ring-1 ring-black/[0.02] dark:ring-white/[0.02] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-5 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-all duration-200 cursor-pointer inline-flex items-center gap-2 shadow-md hover:shadow-lg active:scale-[0.98] ring-1 ring-red-400/20 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Delete Product
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
