"use client";

import { useState, useEffect } from "react";

/**
 * Returns `true` once the component has mounted on the client.
 * Use this to prevent hydration mismatches with Zustand persist stores
 * that load data from localStorage (which differs from server-rendered state).
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}
