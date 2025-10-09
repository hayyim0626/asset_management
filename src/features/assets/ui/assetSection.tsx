"use client";

import React, { useState } from "react";
import { AssetList, CategoryList } from "@/entities/assets/api/types";
import { formatKrw } from "@/shared/lib/functions";
import { ListButton } from "./listButton";
import { SvgIcon } from "@/shared/ui";

interface PropType {
  openAddModal: (type: "crypto" | "stocks" | "cash") => void;
  openEditModal: (type: "crypto" | "stocks" | "cash", asset: AssetList) => void;
  title: string;
  totalValue: { krw: number; usd: number };
  assets: AssetList[];
  type: "crypto" | "stocks" | "cash";
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

  const toggleAsset = (id: string) => {
    setExpandedAssets((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-2xl font-bold text-blue-400 mt-1">{formatKrw(totalValue.krw)}</p>
        </div>
        <button
          onClick={() => openAddModal(type)}
          className="bg-blue-600 hover:bg-blue-700 p-2 rounded-lg transition-colors"
        >
          <SvgIcon name="plus" className="w-5 h-5 text-white cursor-pointer" />
        </button>
      </div>

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
                  isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                {asset.categories && asset.categories.length > 0 && (
                  <div className="px-4 pb-3 space-y-2 border-t border-slate-700/50 pt-3">
                    {asset.categories.map((el) => {
                      const name = category.find((cat) => cat.code === el.category)?.name.ko;
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
                              <p className="text-slate-300 text-sm">
                                {formatKrw(el.amount * asset.currentPrice.krw)}
                              </p>
                              <p className="text-slate-400 text-xs">
                                {type === "cash"
                                  ? `${el.amount.toLocaleString()} ${asset.symbol}`
                                  : `${el.amount} ${asset.symbol}`}
                              </p>
                            </div>
                            <button
                              className="w-5 h-5 cursor-pointer"
                              onClick={() => openEditModal(type, asset)}
                            >
                              <SvgIcon
                                name="edit"
                                className="text-slate-500 hover:text-slate-600 transition-colors"
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
