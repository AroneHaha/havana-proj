"use client";

import { useState, useCallback, useEffect } from "react";
import { useReviewsStore } from "@/store/review-store";
import { useLanguageStore } from "@/store/language-store";
import { getDictionary } from "@/i18n";
import { formatRating } from "@/lib/review-helpers";
import type { ReviewVisibility } from "@/types/review";
import type { Translation } from "@/i18n/types";

export function useReviewsData() {
  const locale = useLanguageStore((s) => s.locale);
  const dict = getDictionary(locale);
  const t = dict.admin.reviews;

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
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Fetch on mount + refetch when filters change
  // (This single effect handles both — filters starts as {}, which triggers
  // the initial fetch, and any subsequent filter change triggers a refetch.)
  useEffect(() => {
    fetchReviews(filters);
  }, [filters, fetchReviews]);

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Debounced search — updates store filters (which triggers the effect above)
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters({ search: searchValue || undefined });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue, setFilters]);

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

  const handleDeleteClick = useCallback((id: string) => {
    setDeleteConfirmId(id);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteReview(deleteConfirmId);
      fetchStats();
    } catch {
      // Error is already in store
    }
    setDeleteConfirmId(null);
  }, [deleteConfirmId, deleteReview, fetchStats]);

  const handleCancelDelete = useCallback(() => {
    setDeleteConfirmId(null);
  }, []);

  const statCards = [
    {
      label: t.averageRating,
      value: stats ? formatRating(stats.averageRating) : "—",
      icon: "star" as const,
      color: "text-amber-500",
      change: t.outOf5,
    },
    {
      label: t.totalReviews,
      value: stats?.totalReviews ?? 0,
      icon: "message" as const,
      color: "text-blue-500",
      change: t.allTime,
    },
    {
      label: t.pendingReviews,
      value: reviews.filter((r) => r.visibility === "pending").length,
      icon: "trending" as const,
      color: "text-amber-500",
      change: t.awaitingModeration,
    },
  ];

  return {
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
  };
}

export type ReviewsT = Translation["admin"]["reviews"];
