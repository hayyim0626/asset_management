"use client";

import { useState, useEffect } from "react";
import { Tooltip } from "@/shared/ui";

type InputMode = "direct" | "total";

interface PropType {
  amount: number;
  defaultValue?: number;
}

export function AveragePriceInput({ amount, defaultValue }: PropType) {
  const [mode, setMode] = useState<InputMode>("direct");
  const [directValue, setDirectValue] = useState(defaultValue?.toString() || "");
  const [totalValue, setTotalValue] = useState(
    defaultValue && amount ? (defaultValue * amount).toString() : ""
  );

  const avgPrice =
    mode === "direct"
      ? parseFloat(directValue) || 0
      : amount > 0
        ? (parseFloat(totalValue) || 0) / amount
        : 0;

  useEffect(() => {
    if (defaultValue) {
      setDirectValue(defaultValue.toString());
      if (amount > 0) {
        setTotalValue((defaultValue * amount).toString());
      }
    }
  }, [defaultValue, amount]);

  const handleModeChange = (newMode: InputMode) => {
    if (newMode === mode) return;
    if (newMode === "total" && directValue) {
      setTotalValue(String(parseFloat(directValue) * (amount || 0)));
    } else if (newMode === "direct" && totalValue && amount > 0) {
      setDirectValue(String(parseFloat(totalValue) / amount));
    }
    setMode(newMode);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1">
          <label className="text-sm font-medium text-slate-300">
            평균 매수 단가 (KRW)
          </label>
          <Tooltip
            content={
              <>
                <p><strong className="text-white">1개당 가격</strong> : 코인 1개당 평균 매수 가격을 입력하는 방식이에요.</p>
                <p><strong className="text-white">총액으로 계산</strong> : 총 투자금액을 입력하면 추가된 수량으로 나눠 평단가를 자동 계산해요.</p>
              </>
            }
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0ZM8.94 6.94a.75.75 0 1 1-1.061-1.061 3 3 0 1 1 2.871 5.026v.345a.75.75 0 0 1-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 1 0 8.94 6.94ZM10 15a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
            </svg>
          </Tooltip>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => handleModeChange("direct")}
            className={`px-3 py-1 text-xs rounded-md transition-colors cursor-pointer ${
              mode === "direct"
                ? "bg-blue-600 text-white"
                : "bg-slate-700 text-slate-400 hover:text-slate-300"
            }`}
          >
            1개당 가격
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("total")}
            className={`px-3 py-1 text-xs rounded-md transition-colors cursor-pointer ${
              mode === "total"
                ? "bg-blue-600 text-white"
                : "bg-slate-700 text-slate-400 hover:text-slate-300"
            }`}
          >
            총액으로 계산
          </button>
        </div>
      </div>
      {mode === "direct" ? (
        <input
          type="number"
          step="0.01"
          placeholder="1개당 평균 매수 가격 (원)"
          className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
          value={directValue}
          onChange={(e) => setDirectValue(e.target.value)}
        />
      ) : (
        <>
          <input
            type="number"
            step="0.01"
            placeholder="총 투자금액 (원)"
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
            value={totalValue}
            onChange={(e) => setTotalValue(e.target.value)}
          />
          {amount > 0 && parseFloat(totalValue) > 0 && (
            <p className="text-xs text-slate-400 mt-1">
              1개당 ≈ {Math.round(parseFloat(totalValue) / amount).toLocaleString()}원
            </p>
          )}
        </>
      )}
      <input type="hidden" name="averagePrice" value={avgPrice || ""} />
      <p className="text-xs text-slate-500 mt-1">평균 매수 단가를 입력하지 않으면 손익이 표시되지 않아요.</p>
    </div>
  );
}
