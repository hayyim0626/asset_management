"use client";

import { formatProfitLossPercent, formatProfitLossKrw, formatUsd } from "@/shared/lib/functions";

interface PropType {
  percent: number | null;
  amountKrw: number | null;
  amountUsd?: number | null;
  size?: "sm" | "lg";
}

export function ProfitLossDisplay({ percent, amountKrw, amountUsd, size = "sm" }: PropType) {
  if (percent == null || amountKrw == null) return null;

  const colorClass =
    amountKrw > 0 ? "text-[#0ecb81]" : amountKrw < 0 ? "text-[#f6465d]" : "text-slate-400";

  if (size === "lg") {
    return (
      <div className={`${colorClass} mt-1`}>
        <span className="text-lg font-semibold">{formatProfitLossPercent(percent)}</span>
        <span className="text-sm ml-2">
          ({formatProfitLossKrw(amountKrw)}
          {amountUsd != null && ` / $${formatUsd(Math.abs(amountUsd), 2)}`})
        </span>
      </div>
    );
  }

  return (
    <span className={`text-xs ${colorClass}`}>
      {formatProfitLossPercent(percent)} ({formatProfitLossKrw(amountKrw)}
      {amountUsd != null && ` / $${formatUsd(Math.abs(amountUsd), 2)}`})
    </span>
  );
}
