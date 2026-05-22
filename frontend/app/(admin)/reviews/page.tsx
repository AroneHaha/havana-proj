/** /frontend/app/(admin)/reviews/page.tsx */

"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Star, TrendingUp } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useLanguageStore } from "@/store/language-store";
import { useReviewsStore } from "@/store/review-store";
import { getDictionary } from "@/i18n";
import { ReviewList, ReviewSearchBar, ReviewFiltersBar, RatingSummary } from "@/components/reviews";
import { formatRating } from "@/lib/review-helpers";
import type { ReviewVisibility } from "@/types/review";

export default function ReviewsPage() {
  const locale = useLanguageStore((s) => s.locale);
  const dict = getDictionary(locale);

  const user = useAuthStore((s) => s.user);
  const hydrate = useAuthStore((s) => s.hydrate);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [checking, setChecking] = useState(true);

  const reviews = useReviewsStore((s) => s.reviews);
  const stats = useReviewsStore((s) => s.stats);
  const filters = useReviewsStore((s) => s.filters);
  const loading = useReviewsStore((s) => s.loading);
  const fetchReviews = useReviewsStore((s) => s.fetchReviews);
  const fetchStats = useReviewsStore((s) => s.fetchStats);
  const setFilters = useReviewsStore((s) => s.setFilters);
  const resetFilters = useReviewsStore((s) => s.resetFilters);
  const updateVisibility = useReviewsStore((s) => s.updateVisibility);
  const deleteReview = useReviewsStore((s) => s.deleteReview);

  const [searchValue, setSearchValue] = useState(filters.search ?? "");

  useEffect(() => { hydrate(); }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;
    if (!user || user.role !== "admin") {
      window.location.href = "/login";
      return;
    }
    setChecking(false);
  }, [hydrated, user]);

  useEffect(() => {
    if (!checking) {
      fetchReviews();
      fetchStats();
    }
  }, [checking, fetchReviews, fetchStats]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters({ search: searchValue || undefined });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue, setFilters]);

  // Refetch when filters change
  useEffect(() => {
    if (!checking) {
      fetchReviews(filters);
    }
  }, [filters, checking, fetchReviews]);

  const handleVisibilityChange = useCallback(
    async (id: string, visibility: ReviewVisibility) => {
      try {
        await updateVisibility(id, visibility);
        fetchStats();
      } catch {
        // Error is already in store
      }
    },
    [updateVisibility, fetchStats]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Are you sure you want to delete this review? This action cannot be undone.")) return;
      try {
        await deleteReview(id);
        fetchStats();
      } catch {
        // Error is already in store
      }
    },
    [deleteReview, fetchStats]
  );

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg">
        <div className="w-8 h-8 border-2 border-maroon/30 border-t-maroon rounded-full animate-spin dark:border-gold/30 dark:border-t-gold" />
      </div>
    );
  }

  const statCards = [
    {
      label: "Average Rating",
      value: stats ? formatRating(stats.averageRating) : "—",
      icon: Star,
      color: "text-amber-500",
      change: "out of 5.0",
    },
    {
      label: "Total Reviews",
      value: stats?.totalReviews ?? 0,
      icon: MessageSquare,
      color: "text-blue-500",
      change: "All time",
    },
    {
      label: "Pending Reviews",
      value: reviews.filter((r) => r.visibility === "pending").length,
      icon: TrendingUp,
      color: "text-amber-500",
      change: "Awaiting moderation",
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {/* Page header */}
        <div className="mb-8">
          <h1 className="font-serif text-2xl lg:text-3xl font-bold text-foreground">
            Reviews
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage and moderate customer reviews
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {statCards.map((stat, i) => (
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
                  <stat.icon className="h-4 w-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <span className="text-xs text-muted-foreground">{stat.change}</span>
            </motion.div>
          ))}
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
                Showing {reviews.length} review{reviews.length !== 1 ? "s" : ""}
              </p>
            </div>
            <ReviewList
              reviews={reviews}
              loading={loading}
              onVisibilityChange={handleVisibilityChange}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}