"use client";

import type { StockSearchResult } from "@/entities/stocks/api/types";
import { Modal } from "@/shared/ui";

interface PropType {
  isOpen: boolean;
  query: string;
  results: StockSearchResult[];
  isLoading: boolean;
  onClose: () => void;
  onChangeQuery: (query: string) => void;
  onSelectStock: (stock: StockSearchResult) => void;
}

export function StockSearchModal({
  isOpen,
  query,
  results,
  isLoading,
  onClose,
  onChangeQuery,
  onSelectStock
}: PropType) {
  return (
    <Modal
      title="미국주식 / ETF 검색"
      isOpen={isOpen}
      onClose={onClose}
      maxWidthClassName="max-w-lg"
    >
      <div className="p-6 space-y-4">
        <input
          type="text"
          value={query}
          onChange={(e) => onChangeQuery(e.target.value)}
          placeholder="AAPL, QQQ, Apple, Vanguard 등"
          className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
          autoFocus
        />
        <div className="rounded-lg border border-slate-700/60 bg-slate-800/40">
          <div className="max-h-72 overflow-y-auto">
            {isLoading ? (
              <p className="px-4 py-3 text-sm text-slate-400">검색 중...</p>
            ) : results.length > 0 ? (
              results.map((stock) => (
                <button
                  key={stock.symbol}
                  type="button"
                  onClick={() => onSelectStock(stock)}
                  className="w-full border-b border-slate-700/40 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-slate-700/40"
                >
                  <p className="text-sm font-medium text-white">
                    {stock.symbol} · {stock.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {stock.assetKind === "US_ETF" ? "미국 ETF" : "미국주식"}
                    {stock.exchange ? ` · ${stock.exchange}` : ""}
                  </p>
                </button>
              ))
            ) : (
              <p className="px-4 py-3 text-sm text-slate-400">
                검색어를 입력하면 미국 주식 / ETF 후보를 표시합니다.
              </p>
            )}
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-700 px-4 py-2 text-sm text-white transition-colors hover:bg-slate-600"
          >
            돌아가기
          </button>
        </div>
      </div>
    </Modal>
  );
}
