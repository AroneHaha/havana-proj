"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  StickyNote,
  Package,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Loader2,
} from "lucide-react";
import {
  type Order,
  type OrderStatus,
  type PaymentMethod,
  ORDER_STATUS_FLOW,
  STATUS_I18N_KEY,
} from "@/store/orders-store";
import { formatPrice } from "@/lib/format-price";
import { ORDER_STATUS_COLORS } from "@/lib/constant";
import type { OrdersT } from "./use-orders-data";

interface OrderDetailDrawerProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, status: OrderStatus) => Promise<void>;
  t: OrdersT;
  locale: "en" | "ar";
}

type ConfirmModalType = "none" | "status" | "delivered" | "cancel";

interface PendingStatusChange {
  status: OrderStatus;
}

export function OrderDetailDrawer({
  order,
  open,
  onClose,
  onUpdateStatus,
  t,
  locale,
}: OrderDetailDrawerProps) {
  const [confirmModal, setConfirmModal] = useState<ConfirmModalType>("none");
  const [pendingChange, setPendingChange] = useState<PendingStatusChange | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!order) return null;

  const currentIndex = ORDER_STATUS_FLOW.indexOf(order.status);
  const nextStatus: OrderStatus | null =
    order.status !== "cancelled" && currentIndex < ORDER_STATUS_FLOW.length - 1
      ? ORDER_STATUS_FLOW[currentIndex + 1]
      : null;

  const isDelivered = order.status === "delivered";
  const isCancelled = order.status === "cancelled";
  const isNextDelivered = nextStatus === "delivered";

  const nextStatusBtnKey: Record<string, string> = {
    confirmed: "markConfirmed",
    preparing: "markPreparing",
    out_for_delivery: "markOutForDelivery",
    delivered: "markDelivered",
  };

  const getPaymentLabel = (_method: PaymentMethod) => {
    // Cash on delivery is the only payment method
    return t.cashOnDelivery;
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(locale === "ar" ? "ar-KW" : "en-KW", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const progressSteps = ORDER_STATUS_FLOW.map((s, i) => ({
    status: s,
    label: t[STATUS_I18N_KEY[s] as keyof typeof t] as string,
    completed: i <= currentIndex && !isCancelled,
    current: s === order.status,
  }));

  // ── Confirmation flow ────────────────────────────────────────────────

  const handleAdvanceStatus = () => {
    if (!nextStatus) return;
    if (isNextDelivered) {
      // Delivered gets its own special modal with warning
      setPendingChange({ status: "delivered" });
      setConfirmModal("delivered");
    } else {
      // Other status transitions get a generic confirmation
      setPendingChange({ status: nextStatus });
      setConfirmModal("status");
    }
  };

  const handleCancelClick = () => {
    setPendingChange({ status: "cancelled" });
    setConfirmModal("cancel");
  };

  const handleConfirmAction = async () => {
    if (!pendingChange || isUpdating) return;
    setIsUpdating(true);
    try {
      await onUpdateStatus(order.id, pendingChange.status);
      closeConfirmModal();
      if (pendingChange.status === "cancelled") {
        onClose();
      }
    } catch {
      // Error is handled by the store — keep modal open so user can retry
    } finally {
      setIsUpdating(false);
    }
  };

  const closeConfirmModal = () => {
    if (isUpdating) return; // Prevent closing while request is in flight
    setConfirmModal("none");
    setPendingChange(null);
  };

  // ── Confirmation modal content builders ──────────────────────────────

  const getStatusLabel = (status: OrderStatus): string => {
    return t[STATUS_I18N_KEY[status] as keyof typeof t] as string;
  };

  const renderConfirmModal = () => {
    if (confirmModal === "none") return null;

    const orderIdDisplay = order.orderNumber || order.id;

    // ── Delivered confirmation (existing special design) ──
    if (confirmModal === "delivered") {
      return (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            onClick={isUpdating ? undefined : closeConfirmModal}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          >
            <div
              className="bg-white dark:bg-dark-card rounded-2xl shadow-xl border border-border ring-1 ring-black/[0.03] dark:ring-white/[0.03] max-w-md w-full p-6 space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
                  {isUpdating ? <Loader2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 animate-spin" /> : <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{t.confirmDeliveryTitle}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {t.confirmDeliveryMessage.replace("{id}", orderIdDisplay)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg p-3 border border-amber-100 dark:border-amber-900/20">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                  {t.confirmDeliveryWarning}
                </p>
              </div>
              <div className="bg-inset rounded-lg p-3 space-y-2 border border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t.orderID}</span>
                  <span className="font-semibold text-foreground">#{orderIdDisplay}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t.customer}</span>
                  <span className="font-medium text-foreground">{order.customer.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t.total}</span>
                  <span className="font-bold text-maroon dark:text-gold">
                    {formatPrice(order.total, locale)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={closeConfirmModal}
                  disabled={isUpdating}
                  className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors cursor-pointer ring-1 ring-black/[0.02] dark:ring-white/[0.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t.cancelBtn}
                </button>
                <button
                  onClick={handleConfirmAction}
                  disabled={isUpdating}
                  className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-sm font-medium transition-colors cursor-pointer shadow-sm ring-1 ring-emerald-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
                  {t.confirmDeliveryBtn}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      );
    }

    // ── Cancel confirmation ──
    if (confirmModal === "cancel") {
      return (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            onClick={isUpdating ? undefined : closeConfirmModal}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          >
            <div
              className="bg-white dark:bg-dark-card rounded-2xl shadow-xl border border-border ring-1 ring-black/[0.03] dark:ring-white/[0.03] max-w-md w-full p-6 space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                  {isUpdating ? <Loader2 className="w-6 h-6 text-red-600 dark:text-red-400 animate-spin" /> : <X className="w-6 h-6 text-red-600 dark:text-red-400" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{t.confirmCancelTitle}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {t.confirmCancelMessage.replace("{id}", orderIdDisplay)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg p-3 border border-amber-100 dark:border-amber-900/20">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                  {t.confirmDeliveryWarning.replace("delivered", "cancelled")}
                </p>
              </div>
              <div className="bg-inset rounded-lg p-3 space-y-2 border border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t.orderID}</span>
                  <span className="font-semibold text-foreground">#{orderIdDisplay}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t.customer}</span>
                  <span className="font-medium text-foreground">{order.customer.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t.total}</span>
                  <span className="font-bold text-maroon dark:text-gold">
                    {formatPrice(order.total, locale)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={closeConfirmModal}
                  disabled={isUpdating}
                  className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors cursor-pointer ring-1 ring-black/[0.02] dark:ring-white/[0.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t.cancelBtn}
                </button>
                <button
                  onClick={handleConfirmAction}
                  disabled={isUpdating}
                  className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white text-sm font-medium transition-colors cursor-pointer shadow-sm ring-1 ring-red-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
                  {t.confirmCancelBtn}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      );
    }

    // ── Generic status change confirmation (confirmed, preparing, out_for_delivery) ──
    if (confirmModal === "status" && pendingChange) {
      const nextStatusLabel = getStatusLabel(pendingChange.status);
      return (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            onClick={isUpdating ? undefined : closeConfirmModal}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          >
            <div
              className="bg-white dark:bg-dark-card rounded-2xl shadow-xl border border-border ring-1 ring-black/[0.03] dark:ring-white/[0.03] max-w-md w-full p-6 space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-maroon/10 dark:bg-gold/10 flex items-center justify-center shrink-0">
                  {isUpdating ? <Loader2 className="w-6 h-6 text-maroon dark:text-gold animate-spin" /> : <ArrowRight className="w-6 h-6 text-maroon dark:text-gold" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{t.confirmStatusTitle}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {t.confirmStatusMessage
                      .replace("{id}", orderIdDisplay)
                      .replace("{status}", nextStatusLabel)}
                  </p>
                </div>
              </div>
              <div className="bg-inset rounded-lg p-4 border border-border">
                <div className="flex items-center justify-center gap-4">
                  <span
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full shadow-xs ${ORDER_STATUS_COLORS[order.status]}`}
                  >
                    {getStatusLabel(order.status)}
                  </span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full shadow-xs ${ORDER_STATUS_COLORS[pendingChange.status]}`}
                  >
                    {nextStatusLabel}
                  </span>
                </div>
              </div>
              <div className="bg-inset rounded-lg p-3 space-y-2 border border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t.orderID}</span>
                  <span className="font-semibold text-foreground">#{orderIdDisplay}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t.customer}</span>
                  <span className="font-medium text-foreground">{order.customer.name}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={closeConfirmModal}
                  disabled={isUpdating}
                  className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors cursor-pointer ring-1 ring-black/[0.02] dark:ring-white/[0.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t.cancelBtn}
                </button>
                <button
                  onClick={handleConfirmAction}
                  disabled={isUpdating}
                  className="flex-1 py-2.5 rounded-lg bg-maroon hover:bg-maroon-light dark:bg-gold dark:hover:bg-gold-dark text-white dark:text-dark-bg text-sm font-medium transition-colors cursor-pointer shadow-sm ring-1 ring-maroon/20 dark:ring-gold/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
                  {t.confirmStatusBtn}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      );
    }

    return null;
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-lg bg-white dark:bg-dark-card shadow-drawer overflow-y-auto"
          >
            <div className="sticky top-0 z-10 bg-white dark:bg-dark-card border-b border-border shadow-topbar">
              <div className="flex items-center justify-between p-5">
                <div>
                  <h2 className="text-lg font-bold text-foreground">{t.orderDetails}</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">#{order.orderNumber || order.id}</p>
                </div>
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-all duration-200 cursor-pointer hover:shadow-xs">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-6">
              {!isCancelled && (
                <div className="bg-inset rounded-xl p-4 border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full shadow-xs ${ORDER_STATUS_COLORS[order.status]}`}>
                      {t[STATUS_I18N_KEY[order.status] as keyof typeof t] as string}
                    </span>
                    {nextStatus && (
                      <button
                        onClick={handleAdvanceStatus}
                        className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer shadow-sm ring-1 ${
                          isNextDelivered
                            ? "bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-white dark:hover:bg-emerald-600 ring-emerald-500/20"
                            : "bg-maroon text-white hover:bg-maroon-light dark:bg-gold dark:text-dark-bg dark:hover:bg-gold-dark ring-maroon/20 dark:ring-gold/20"
                        }`}
                      >
                        {t[nextStatusBtnKey[nextStatus] as keyof typeof t] as string}
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {progressSteps.map((step) => (
                      <div key={step.status} className="flex-1">
                        <div className={`h-1.5 rounded-full transition-all ${step.completed ? "bg-maroon dark:bg-gold" : "bg-gray-200 dark:bg-[#2A2A2A]"}`} />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2">
                    {progressSteps.map((step) => (
                      <span key={step.status} className={`text-[10px] ${step.current ? "font-semibold text-maroon dark:text-gold" : step.completed ? "text-muted-foreground" : "text-gray-300 dark:text-[#444]"}`}>
                        {step.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {isCancelled && (
                <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-4 flex items-center gap-3 border border-red-100 dark:border-red-900/20">
                  <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                    <X className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-red-700 dark:text-red-400">{t.cancelled}</p>
                    <p className="text-xs text-red-500/70 dark:text-red-400/50">{formatDate(order.updatedAt)}</p>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4 text-maroon dark:text-gold" />{t.orderInfo}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-inset rounded-lg p-3 border border-border ring-1 ring-black/[0.02] dark:ring-white/[0.02]">
                    <p className="text-xs text-muted-foreground">{t.createdAt}</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="bg-inset rounded-lg p-3 border border-border ring-1 ring-black/[0.02] dark:ring-white/[0.02]">
                    <p className="text-xs text-muted-foreground">{t.updatedAt}</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">{formatDate(order.updatedAt)}</p>
                  </div>
                  <div className="bg-inset rounded-lg p-3 border border-border ring-1 ring-black/[0.02] dark:ring-white/[0.02]">
                    <p className="text-xs text-muted-foreground">{t.paymentMethod}</p>
                    <p className="text-sm font-medium text-foreground mt-0.5 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-maroon dark:text-gold" />{getPaymentLabel(order.paymentMethod)}
                    </p>
                  </div>
                  <div className="bg-inset rounded-lg p-3 border border-border ring-1 ring-black/[0.02] dark:ring-white/[0.02]">
                    <p className="text-xs text-muted-foreground">{t.status}</p>
                    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-0.5 shadow-xs ${ORDER_STATUS_COLORS[order.status]}`}>
                      {t[STATUS_I18N_KEY[order.status] as keyof typeof t] as string}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-maroon dark:text-gold" />{t.customerInfo}
                </h3>
                <div className="bg-inset rounded-lg p-4 space-y-3 border border-border ring-1 ring-black/[0.02] dark:ring-white/[0.02]">
                  <p className="text-sm font-semibold text-foreground">{order.customer.name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-3.5 h-3.5 shrink-0" /><span>{order.customer.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-3.5 h-3.5 shrink-0" /><span dir="ltr">{order.customer.phone}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" /><span>{order.customer.address}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-maroon dark:text-gold" />{t.orderItems}
                </h3>
                <div className="space-y-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between bg-inset rounded-lg p-3 border border-border ring-1 ring-black/[0.02] dark:ring-white/[0.02]">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">{formatPrice(item.price, locale)} &times; {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-foreground ms-3">{formatPrice(item.price * item.quantity, locale)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 border-t border-border pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t.subtotal}</span>
                    <span className="text-foreground">{formatPrice(order.subtotal, locale)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t.deliveryFee}</span>
                    <span className="text-foreground">{order.deliveryFee === 0 ? t.freeDelivery : formatPrice(order.deliveryFee, locale)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold border-t border-border pt-2">
                    <span className="text-foreground">{t.total}</span>
                    <span className="text-maroon dark:text-gold">{formatPrice(order.total, locale)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <StickyNote className="w-4 h-4 text-maroon dark:text-gold" />{t.notes}
                </h3>
                <div className="bg-inset rounded-lg p-3 border border-border ring-1 ring-black/[0.02] dark:ring-white/[0.02]">
                  <p className="text-sm text-muted-foreground">{order.notes || t.noNotes}</p>
                </div>
              </div>

              {!isDelivered && !isCancelled && (
                <button
                  onClick={handleCancelClick}
                  className="w-full py-2.5 rounded-lg border-2 border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors cursor-pointer"
                >
                  {t.cancelOrder}
                </button>
              )}
            </div>
          </motion.div>

          <AnimatePresence>{renderConfirmModal()}</AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
