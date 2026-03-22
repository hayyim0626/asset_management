"use client";

import { useDeferredValue, useEffect, useState } from "react";
import type { StockSearchResult } from "@/entities/stocks/api/types";
import type { SearchStocksFn } from "./types";

interface PropType {
  enabled: boolean;
  query: string;
  searchStocks: SearchStocksFn;
}

export function useStockPicker({ enabled, query, searchStocks }: PropType) {
  const deferredQuery = useDeferredValue(query);
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    const run = async () => {
      setIsLoading(true);

      try {
        const data = await searchStocks(deferredQuery, controller.signal);
        if (!controller.signal.aborted) {
          setResults(data);
        }
      } catch {
        if (!controller.signal.aborted) {
          setResults([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void run();

    return () => controller.abort();
  }, [deferredQuery, enabled, searchStocks]);

  return {
    results,
    isLoading
  };
}
