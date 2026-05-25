"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Star, MessageSquare, TrendingUp, X } from "lucide-react";
import { ReviewList, ReviewSearchBar, ReviewFiltersBar, RatingSummary } from "@/components/reviews";
import { useReviewsData } from "./use-reviews-data";

const ICON_MAP = {
  star: Star,
  message: MessageSquare,
  trending: TrendingUp,
} as const;

export function AdminReviews() {
  const {
    t,
    loading,
    reviews,
    stats,
    filters,
    searchValue,
    setSearchValue,
    setFilters,
    resetFilters,
    handleVisibilityChange,
    handleDeleteClick,
    handleConfirmDelete,
    handleCancelDelete,
    deleteConfirmId,
    statCards,
  } = useReviewsData();

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {/* Page header */}
        <div className="mb-8">
          <h1 className="font-serif text-2xl lg:text-3xl font-bold text-foreground">
            {t.title}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t.subtitle}
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {statCards.map((stat, i) => {
            const Icon = ICON_MAP[stat.icon];
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="bg-white dark:bg-dark-card rounded-2xl p-5 border border-border"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground font-medium">{stat.label}</span>
                  <div className={`p-2 rounded-xl bg-muted/50 ${stat.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <span className="text-xs text-muted-foreground">{stat.change}</span>
              </motion.div>
            );
          })}
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Rating summary sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <RatingSummary stats={stats} />
          </div>

          {/* Review list */}
          <div className="lg:col-span-3 order-1 lg:order-2 space-y-4">
            <ReviewSearchBar value={searchValue} onChange={setSearchValue} />
            <ReviewFiltersBar
              filters={filters}
              reviews={reviews}
              onFilterChange={setFilters}
              onReset={resetFilters}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {t.showing.replace("{count}", String(reviews.length))}
              </p>
            </div>
            <ReviewList
              reviews={reviews}
              loading={loading}
              onVisibilityChange={handleVisibilityChange}
              onDelete={handleDeleteClick}
            />
          </div>
        </div>
      </motion.div>

      {/* ─── Delete Confirmation Modal ─── */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleCancelDelete} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-white dark:bg-dark-card rounded-2xl border border-border w-full max-w-sm p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg font-semibold text-foreground">{t.deleteReview}</h3>
                <button onClick={handleCancelDelete} className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground">
                {t.deleteConfirm}
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={handleCancelDelete}
                  className="px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-5 py-2.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors cursor-pointer"
                >
                  {t.delete}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminReviews;
