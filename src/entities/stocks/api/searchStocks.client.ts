"use client";

import type { StockSearchResult } from "./types";

export const searchStocksClient = async (
  query: string,
  signal?: AbortSignal
): Promise<StockSearchResult[]> => {
  const params = new URLSearchParams({ q: query });
  const response = await fetch(`/api/stocks/search?${params.toString()}`, {
    method: "GET",
    signal
  });

  const payload = (await response.json()) as {
    success: boolean;
    data?: StockSearchResult[];
  };

  return Array.isArray(payload.data) ? payload.data : [];
};
