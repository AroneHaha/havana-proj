"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, LogIn, Loader2 } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import { useLanguageStore } from "@/store/language-store";
import { useUIStore } from "@/store/ui-store";
import { getDictionary } from "@/i18n";
import { placeOrder, verifyStock, type CheckoutResult, type StockVerification } from "@/services/checkout-service";
import { calculateDeliveryFee } from "@/lib/constant";

type Step = "form" | "success" | "login-required";

export function CheckoutModal() {
  const isOpen = useUIStore((s) => s.isCheckoutOpen);
  const closeCheckout = useUIStore((s) => s.closeCheckout);
  const closeCart = useUIStore((s) => s.closeCart);
  const items = useCartStore((s) => s.items);
  const clearCartStore = useCartStore((s) => s.clearCart);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const locale = useLanguageStore((s) => s.locale);
  const t = getDictionary(locale);
  const userIsAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  const [step, setStep] = useState<Step>("form");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CheckoutResult | null>(null);
  const [unavailableItems, setUnavailableItems] = useState<StockVerification["unavailableItems"]>([]);

  // Form fields — pre-fill from auth user if available
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});

  const subtotal = getSubtotal();
  const deliveryFee = calculateDeliveryFee(subtotal);
  const total = subtotal + deliveryFee;

  // Pre-fill from auth user when modal opens
  const [initialized, setInitialized] = useState(false);
  if (isOpen && !initialized) {
    setInitialized(true);
    if (userIsAuthenticated() && user) {
      setName(`${user.firstName} ${user.lastName}`.trim());
      setEmail(user.email);
    }
    if (!userIsAuthenticated()) {
      setStep("login-required");
    } else {
      setStep("form");
    }
  }

  function close() {
    closeCheckout();
    setTimeout(() => {
      setStep("form");
      setError(null);
      setResult(null);
      setUnavailableItems([]);
      setInitialized(false);
      setFieldErrors({});
    }, 300);
  }

  function validateForm(): boolean {
    const errors: Record<string, boolean> = {};
    if (!name.trim()) errors.name = true;
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = true;
    // Kuwait phone: +965 followed by exactly 8 digits
    const cleanedPhone = phone.replace(/[\s-]/g, "");
    if (!/^\+965\d{8}$/.test(cleanedPhone)) errors.phone = true;
    if (!address.trim()) errors.address = true;
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handlePlaceOrder() {
    if (!validateForm()) return;

    setPlacing(true);
    setError(null);

    try {
      // 1. Verify stock first
      const stockCheck = await verifyStock(
        items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        }))
      );

      if (!stockCheck.allAvailable) {
        setUnavailableItems(stockCheck.unavailableItems);
        setError(t.checkout.stockUnavailable);
        setPlacing(false);
        return;
      }

      // 2. Place the order
      const orderResult = await placeOrder({
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        customer: {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          address: address.trim(),
        },
        notes: notes.trim() || undefined,
        paymentMethod: "cash",
      });

      // 3. Clear the cart
      await clearCartStore();

      // 4. Show success
      setResult(orderResult);
      setStep("success");
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? (err as { message: string }).message
          : "Failed to place order. Please try again.";
      setError(message);
    } finally {
      setPlacing(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-lg z-[60] bg-card rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
              <div>
                <h2 className="text-lg font-semibold font-serif">
                  {step === "success" ? t.checkout.orderPlaced : t.checkout.title}
                </h2>
                {step !== "success" && (
                  <p className="text-sm text-muted-foreground">{t.checkout.subtitle}</p>
                )}
              </div>
              <button
                onClick={close}
                className="h-10 w-10 flex items-center justify-center rounded-lg hover:bg-muted cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* ─── Login Required ─── */}
              {step === "login-required" && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-maroon/10 dark:bg-gold/10 flex items-center justify-center mb-4">
                    <LogIn className="h-8 w-8 text-maroon dark:text-gold" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{t.checkout.loginRequired}</h3>
                  <p className="text-muted-foreground mb-6 max-w-sm">{t.checkout.loginRequiredMessage}</p>
                  <Button
                    onClick={() => {
                      close();
                      closeCart();
                      window.location.href = "/login";
                    }}
                    className="bg-maroon hover:bg-maroon-light text-white"
                  >
                    {t.checkout.goToLogin}
                  </Button>
                </div>
              )}

              {/* ─── Form ─── */}
              {step === "form" && (
                <div className="space-y-5">
                  {/* Order Summary */}
                  <div className="rounded-xl border border-border p-4 space-y-2">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      {t.cart.title} ({items.length})
                    </h3>
                    {items.map((item) => (
                      <div key={item.product.id} className="flex justify-between text-sm">
                        <span className="text-foreground line-clamp-1">
                          {item.product.name} × {item.quantity}
                        </span>
                        <span className="font-medium text-foreground whitespace-nowrap ml-2">
                          {formatPrice((item.product.salePrice || item.product.price) * item.quantity)}
                        </span>
                      </div>
                    ))}
                    <div className="h-px bg-border" />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t.cart.subtotal}</span>
                      <span className="font-medium">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t.cart.deliveryFee}</span>
                      <span className={cn("font-medium", deliveryFee === 0 && "text-emerald-500")}>
                        {deliveryFee === 0 ? t.cart.freeDelivery : formatPrice(deliveryFee)}
                      </span>
                    </div>
                    <div className="flex justify-between text-base font-bold">
                      <span>{t.cart.total}</span>
                      <span className="text-maroon dark:text-gold">{formatPrice(total)}</span>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">{t.checkout.fullName} *</label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t.checkout.fullNamePlaceholder}
                        className={cn(fieldErrors.name && "border-red-500 focus-visible:ring-red-500")}
                      />
                      {fieldErrors.name && (
                        <p className="text-xs text-red-500 mt-1">{t.checkout.requiredField}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5">{t.checkout.email} *</label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t.checkout.emailPlaceholder}
                        className={cn(fieldErrors.email && "border-red-500 focus-visible:ring-red-500")}
                      />
                      {fieldErrors.email && (
                        <p className="text-xs text-red-500 mt-1">{t.checkout.requiredField}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5">{t.checkout.phone} *</label>
                      <Input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder={t.checkout.phonePlaceholder}
                        className={cn(fieldErrors.phone && "border-red-500 focus-visible:ring-red-500")}
                      />
                      {fieldErrors.phone && (
                        <p className="text-xs text-red-500 mt-1">{t.checkout.invalidPhone}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5">{t.checkout.address} *</label>
                      <Input
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder={t.checkout.addressPlaceholder}
                        className={cn(fieldErrors.address && "border-red-500 focus-visible:ring-red-500")}
                      />
                      {fieldErrors.address && (
                        <p className="text-xs text-red-500 mt-1">{t.checkout.requiredField}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5">{t.checkout.notes}</label>
                      <Input
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder={t.checkout.notesPlaceholder}
                      />
                    </div>

                    {/* Payment Method */}
                    <div>
                      <label className="block text-sm font-medium mb-1.5">{t.checkout.paymentMethod}</label>
                      <div className="rounded-xl border border-maroon dark:border-gold bg-maroon/5 dark:bg-gold/5 p-3 text-sm font-medium">
                        {t.checkout.cashOnDelivery}
                      </div>
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-3">
                      <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                      <div className="text-sm text-red-700 dark:text-red-400">
                        <p>{error}</p>
                        {unavailableItems.length > 0 && (
                          <ul className="mt-1.5 space-y-0.5 text-xs">
                            {unavailableItems.map((item) => (
                              <li key={item.productId}>
                                {item.productName} — {t.checkout.stockUnavailableDetail
                                  .replace("{requested}", String(item.requested))
                                  .replace("{available}", String(item.available))}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ─── Success ─── */}
              {step === "success" && result && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                    <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-semibold font-serif mb-2">{t.checkout.orderPlaced}</h3>
                  <p className="text-muted-foreground mb-4 max-w-sm">{t.checkout.orderPlacedMessage}</p>
                  <div className="rounded-xl border border-border bg-muted/50 p-4 mb-6 w-full max-w-xs">
                    <p className="text-sm text-muted-foreground">{t.checkout.orderNumber}</p>
                    <p className="text-lg font-bold text-maroon dark:text-gold">{result.orderNumber}</p>
                    <p className="text-sm mt-1">{formatPrice(result.total)} KWD</p>
                  </div>
                  <Button
                    onClick={() => {
                      close();
                      closeCart();
                    }}
                    className="bg-maroon hover:bg-maroon-light text-white"
                  >
                    {t.checkout.continueShopping}
                  </Button>
                </div>
              )}
            </div>

            {/* Footer (form step only) */}
            {step === "form" && (
              <div className="border-t border-border p-6 shrink-0">
                <Button
                  onClick={handlePlaceOrder}
                  disabled={placing || items.length === 0}
                  className="w-full bg-maroon hover:bg-maroon-light text-white text-base gap-2"
                  size="lg"
                >
                  {placing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t.checkout.placing}
                    </>
                  ) : (
                    t.checkout.placeOrder
                  )}
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
