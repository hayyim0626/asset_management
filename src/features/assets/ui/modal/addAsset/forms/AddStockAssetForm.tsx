"use client";

import type { StockSearchResult } from "@/entities/stocks/api/types";
import { AveragePriceInput } from "@/features/assets/ui/components/AveragePriceInput";

interface PropType {
  selectedStock: StockSearchResult | null;
  stockCategoryName: string;
  amount: string;
  eventDate: string;
  usdKrwRate: number | null;
  onOpenSearch: () => void;
  onChangeAmount: (value: string) => void;
  onChangeEventDate: (value: string) => void;
}

export function AddStockAssetForm({
  selectedStock,
  stockCategoryName,
  amount,
  eventDate,
  usdKrwRate,
  onOpenSearch,
  onChangeAmount,
  onChangeEventDate
}: PropType) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-300">미국주식 / ETF</label>
        <button
          type="button"
          onClick={onOpenSearch}
          className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-left text-white transition-colors hover:border-slate-500"
        >
          {selectedStock ? (
            <div>
              <p className="font-medium">
                {selectedStock.symbol} · {selectedStock.name}
              </p>
              <p className="text-xs text-slate-400">
                {selectedStock.assetKind === "US_ETF" ? "미국 ETF" : "미국주식"}
                {selectedStock.exchange ? ` · ${selectedStock.exchange}` : ""}
              </p>
            </div>
          ) : (
            <span className="text-slate-400">미국 주식 / ETF 검색하기</span>
          )}
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">보유 주식 수</label>
        <input
          type="number"
          step="0.0001"
          name="amount"
          value={amount}
          onChange={(e) => onChangeAmount(e.target.value)}
          placeholder="수량 입력"
          className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">매수일</label>
        <input
          type="date"
          name="eventDate"
          value={eventDate}
          onChange={(e) => onChangeEventDate(e.target.value)}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
        />
      </div>

      <AveragePriceInput
        amount={parseFloat(amount) || 0}
        currencyCode="USD"
        storageCurrency="USD"
        availableCurrencies={["USD", "KRW"]}
        exchangeRate={usdKrwRate}
        directModeLabel="1주당 가격"
        averagePriceLabel="평균 매수 단가"
        averagePricePlaceholder="1주당 평균 매수 가격"
        totalAmountPlaceholder="총 매수금액"
      />

      {selectedStock && (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">카테고리</label>
          <div className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-3 text-sm text-white">
            {stockCategoryName}
          </div>
        </div>
      )}
    </div>
  );
}
