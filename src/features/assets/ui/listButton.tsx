"use client";

import type { AssetItem } from "@/entities/assets/api/types";
import type { AssetType } from "@/entities/assets/types";
import { AssetImage } from "@/entities/assets/ui";
import { formatDateTimeKorean, formatKrw, formatUsdCurrency } from "@/shared/lib/functions";
import { SvgIcon } from "@/shared/ui";
import { calcAssetProfitLoss } from "@/features/assets/lib/profitLoss";
import { ProfitLossDisplay } from "./components/ProfitLossDisplay";

interface PropType {
  asset: AssetItem;
  toggleAsset: (id: string) => void;
  type: AssetType;
  expandedAssets: Set<string>;
}

export function ListButton(props: PropType) {
  const { asset, toggleAsset, type, expandedAssets } = props;
  const isExpanded = expandedAssets.has(asset.id);
  const profitLoss = calcAssetProfitLoss(asset, type);
  const isStock = type === "stocks";
  const quoteLabel = isStock
    ? `1주 ≈ ${formatUsdCurrency(asset.currentPrice.usd)} / ${formatKrw(asset.currentPrice.krw)}`
    : `1${asset.symbol} ≈ ${formatKrw(asset.currentPrice.krw)}`;
  const lastUpdatedLabel = formatDateTimeKorean(asset.lastUpdated ?? asset.lastSuccessfulFetchedAt);

  return (
    <button
      onClick={() => toggleAsset(asset.id)}
      className="flex items-center cursor-pointer justify-between py-3 px-4 w-full hover:bg-slate-800/70 transition-colors rounded-lg"
    >
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 rounded-full bg-slate-800 flex justify-center items-center">
          <AssetImage
            assetType={type}
            src={asset.image}
            imageWidth={26}
            emojiSize="text-3xl"
            fallbackText={asset.symbol}
          />
        </div>
        <div className="text-start">
          <div className="flex items-center gap-2">
            <p className="text-white font-medium">{asset.name}</p>
            {isStock && asset.quoteStatus && asset.quoteStatus !== "fresh" && (
              <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                stale
              </span>
            )}
          </div>
          <p className="text-slate-400 text-sm">
            {quoteLabel}
          </p>
          {isStock && lastUpdatedLabel && (
            <p className="text-[11px] text-slate-500">마지막 갱신 {lastUpdatedLabel}</p>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <div className="text-right">
          <p className="text-white font-semibold">{formatKrw(asset.value.krw)}</p>
          {isStock && <p className="text-slate-400 text-sm">{formatUsdCurrency(asset.value.usd)}</p>}
          <p className="text-slate-400 text-sm">
            {type === "cash"
              ? `${asset.amount.toLocaleString()} ${asset.symbol}`
              : `${asset.amount} ${asset.symbol}`}
          </p>
          {profitLoss && (
            <ProfitLossDisplay
              percent={profitLoss.percent}
              amountKrw={profitLoss.amountKrw}
              amountUsd={profitLoss.amountUsd}
            />
          )}
        </div>
        <SvgIcon
          name="chevronDown"
          className={`w-5 h-5 text-slate-400 transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </div>
    </button>
  );
}
