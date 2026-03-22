"use client";

import React, { useMemo, useState } from "react";
import type { AssetItem, CategoryList, UserCategory } from "@/entities/assets/api/types";
import type { AssetType } from "@/entities/assets/types";
import { formatDateTimeKorean, formatKrw, formatUsdCurrency } from "@/shared/lib/functions";
import { ListButton } from "./listButton";
import { SvgIcon } from "@/shared/ui";
import { calcCategoryProfitLoss, calcTotalProfitLoss } from "@/features/assets/lib/profitLoss";
import { ProfitLossDisplay } from "./components/ProfitLossDisplay";

export interface EditAssetType extends UserCategory {
  symbol: string;
  image: string;
  name: string;
}

interface PropType {
  openAddModal: (type: AssetType) => void;
  openEditModal: (type: AssetType, asset: EditAssetType) => void;
  title: string;
  totalValue: { krw: number; usd: number };
  assets: AssetItem[];
  type: AssetType;
  category: CategoryList[];
}

export function AssetSection({
  openAddModal,
  openEditModal,
  title,
  totalValue,
  assets,
  type,
  category
}: PropType) {
  const [expandedAssets, setExpandedAssets] = useState<Set<string>>(new Set());

  const sectionProfitLoss = useMemo(() => {
    if (type !== "crypto" && type !== "stocks") return null;

    const result = calcTotalProfitLoss(assets, type);
    if (!result) return null;

    const percent =
      result.totalInvestmentKrw > 0
        ? ((result.totalValueKrw - result.totalInvestmentKrw) / result.totalInvestmentKrw) * 100
        : 0;

    return { percent, amountKrw: result.totalKrw };
  }, [assets, type]);

  const staleAssets = useMemo(() => {
    if (type !== "stocks") return [];

    return assets.filter(
      (asset) => asset.isStale || asset.quoteStatus === "stale" || asset.quoteStatus === "failed"
    );
  }, [assets, type]);

  const toggleAsset = (id: string) => {
    setExpandedAssets((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-2xl font-bold text-blue-400 mt-1">{formatKrw(totalValue.krw)}</p>
          {type === "stocks" && totalValue.usd > 0 && (
            <p className="text-sm text-slate-400 mt-1">{formatUsdCurrency(totalValue.usd)}</p>
          )}
          {sectionProfitLoss && (
            <div className="mt-1">
              <ProfitLossDisplay
                percent={sectionProfitLoss.percent}
                amountKrw={sectionProfitLoss.amountKrw}
              />
            </div>
          )}
        </div>
        <button
          onClick={() => openAddModal(type)}
          className="bg-blue-600 hover:bg-blue-700 p-2 rounded-lg transition-colors cursor-pointer"
        >
          <SvgIcon name="plus" className="w-5 h-5 text-white" />
        </button>
      </div>

      {type === "stocks" && staleAssets.length > 0 && (
        <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          최신 시세를 불러오지 못해 마지막으로 저장된 가격을 표시하고 있습니다.
        </div>
      )}

      <div className="space-y-3">
        {assets.map((asset, index) => {
          const isExpanded = expandedAssets.has(asset.id);

          return (
            <div key={index} className="bg-slate-800/50 rounded-lg border border-slate-700/50">
              <ListButton
                type={type}
                toggleAsset={toggleAsset}
                asset={asset}
                expandedAssets={expandedAssets}
              />
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isExpanded ? "max-h-[520px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                {asset.categories && asset.categories.length > 0 && (
                  <div className="px-4 pb-3 space-y-2 border-t border-slate-700/50 pt-3">
                    {asset.categories.map((el) => {
                      const name = category.find((cat) => cat.code === el.category)?.name;
                      const categoryProfitLoss = calcCategoryProfitLoss(asset, el, type);
                      const averagePriceLabel =
                        type === "stocks"
                          ? el.averagePriceUsd ?? el.averagePrice
                            ? `${formatUsdCurrency(el.averagePriceUsd ?? el.averagePrice ?? 0)} avg`
                            : null
                          : el.averagePrice
                            ? `${formatKrw(el.averagePrice)} avg`
                            : null;
                      const totalValueLabel =
                        type === "stocks"
                          ? `${formatKrw(el.amount * asset.currentPrice.krw)} / ${formatUsdCurrency(
                              el.amount * asset.currentPrice.usd
                            )}`
                          : formatKrw(el.amount * asset.currentPrice.krw);
                      const eventDateLabel =
                        type === "stocks" ? formatDateTimeKorean(el.eventDate) : null;

                      return (
                        <div
                          key={el.id}
                          className="flex items-center justify-between py-2 px-3 bg-slate-700/30 rounded-md"
                        >
                          <div>
                            <p className="text-slate-300 text-sm font-medium">{name}</p>
                            <p className="text-slate-500 text-xs">{el.category_name}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <p className="text-slate-300 text-sm">{totalValueLabel}</p>
                              <p className="text-slate-400 text-xs">
                                {type === "cash"
                                  ? `${el.amount.toLocaleString()} ${asset.symbol}`
                                  : `${el.amount} ${asset.symbol}`}
                              </p>
                              {averagePriceLabel && (
                                <p className="text-[11px] text-slate-500">{averagePriceLabel}</p>
                              )}
                              {eventDateLabel && (
                                <p className="text-[11px] text-slate-500">기준일 {eventDateLabel}</p>
                              )}
                              {categoryProfitLoss && (
                                <ProfitLossDisplay
                                  percent={categoryProfitLoss.percent}
                                  amountKrw={categoryProfitLoss.amountKrw}
                                  amountUsd={categoryProfitLoss.amountUsd}
                                />
                              )}
                            </div>
                            <button
                              className="w-5 h-5 cursor-pointer"
                              onClick={() =>
                                openEditModal(type, {
                                  symbol: asset.symbol,
                                  image: asset.image,
                                  name: asset.name,
                                  ...el
                                })
                              }
                            >
                              <SvgIcon
                                name="edit"
                                className="text-slate-500 hover:text-slate-300 transition-colors"
                              />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {assets.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          <p>등록된 {title.toLowerCase()}이 없습니다.</p>
          <button
            onClick={() => openAddModal(type)}
            className="mt-4 text-blue-400 hover:text-blue-300 text-sm"
          >
            + 첫 번째 자산 추가하기
          </button>
        </div>
      )}
    </div>
  );
}
