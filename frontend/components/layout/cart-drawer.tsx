"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, ShoppingBag, X, ArrowRight } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useUIStore, useCartStore } from "@/store";
import { useLanguageStore } from "@/store/language-store";
import { getDictionary } from "@/i18n";

export function CartDrawer() {
  const isCartOpen = useUIStore((s) => s.isCartOpen);
  const closeCart = useUIStore((s) => s.closeCart);
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const subtotal = useCartStore((s) =>
    s.items.reduce((sum, item) => sum + (item.product.salePrice || item.product.price) * item.quantity, 0)
  );
  const deliveryFee = subtotal >= 50 ? 0 : 3;
  const total = subtotal + deliveryFee;
  const locale = useLanguageStore((s) => s.locale);
  const t = getDictionary(locale);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: locale === "ar" ? "-100%" : "100%" }}
            animate={{ x: 0 }}
            exit={{ x: locale === "ar" ? "-100%" : "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={`fixed inset-y-0 z-50 w-full max-w-md bg-card shadow-2xl flex flex-col ${
              locale === "ar" ? "left-0" : "right-0"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-maroon dark:text-gold" />
                <h2 className="text-lg font-semibold">{t.cart.title}</h2>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-maroon text-[10px] font-bold text-white">
                  {items.length}
                </span>
              </div>
              <button onClick={closeCart} className="h-10 w-10 flex items-center justify-center rounded-lg hover:bg-muted cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground mb-4">{t.cart.empty}</p>
                  <Button variant="outline" onClick={closeCart}>
                    {t.cart.continueShopping}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-4 rounded-xl border border-border p-3">
                      <div className="h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                        <img src={item.product.image} alt="" className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm line-clamp-1">
                          {item.product.name}
                        </h3>
                        <p className="text-sm font-semibold text-maroon dark:text-gold mt-1">
                          {formatPrice(item.product.salePrice || item.product.price)}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2 border border-border rounded-lg">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="flex h-7 w-7 items-center justify-center hover:bg-muted rounded-l-lg cursor-pointer"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="flex h-7 w-7 items-center justify-center hover:bg-muted rounded-r-lg cursor-pointer"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border p-6 space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.cart.subtotal}</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.cart.deliveryFee}</span>
                    <span className={cn("font-medium", deliveryFee === 0 && "text-emerald-500")}>
                      {deliveryFee === 0 ? t.cart.freeDelivery : formatPrice(deliveryFee)}
                    </span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between text-base font-bold">
                    <span>{t.cart.total}</span>
                    <span className="text-maroon dark:text-gold">{formatPrice(total)}</span>
                  </div>
                </div>
                <Button className="w-full gap-2 text-base" size="lg">
                  {t.cart.checkout}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}