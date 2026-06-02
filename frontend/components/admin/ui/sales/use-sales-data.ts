"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { fetchOrders, type Order } from "@/services/orders-service";
import { getErrorMessage } from "@/lib/get-error-message";

interface UseSalesDataReturn {
  orders: Order[];
  loading: boolean;
  isFetching: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSalesData(): UseSalesDataReturn {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);
  const mountedRef = useRef(true);

  const fetchAll = useCallback(async () => {
    const isFirstLoad = !hasFetchedRef.current;
    if (isFirstLoad) setLoading(true);
    setIsFetching(true);
    setError(null);

    try {
      const result = await fetchOrders({ perPage: 999 });
      if (mountedRef.current) {
        setOrders(result.orders);
        hasFetchedRef.current = true;
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(getErrorMessage(err, "Failed to fetch sales data"));
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setIsFetching(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchAll();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchAll]);

  return { orders, loading, isFetching, error, refetch: fetchAll };
}