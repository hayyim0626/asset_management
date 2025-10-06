"use client";

import React from "react";
import { formatKrw } from "@/shared/lib/functions";
import { AssetList } from "@/entities/assets/api/types";
import Image from "next/image";

interface PropType {
  openAddModal: (type: "crypto" | "stocks" | "cash") => void;
  openEditModal: (type: "crypto" | "stocks" | "cash", asset: AssetList) => void;
  title: string;
  totalValue: { krw: number; usd: number };
  assets: AssetList[];
  type: "crypto" | "stocks" | "cash";
}

const PlusIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    className={`${className} cursor-pointer`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const EditIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    className={`${className} cursor-pointer`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
);

export function AssetSection({
  openAddModal,
  openEditModal,
  title,
  totalValue,
  assets,
  type
}: PropType) {
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
          <PlusIcon className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="space-y-3">
        {assets.map((asset, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-3 px-4 bg-slate-800/50 rounded-lg border border-slate-700/50"
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex justify-center items-center">
                <span className="text-3xl">
                  {type === "cash" ? (
                    asset.image //emoji
                  ) : (
                    <Image
                      src={asset.image}
                      width={26}
                      height={26}
                      alt="coin_img"
                      className="rounded-full"
                    />
                  )}
                </span>
              </div>
              <div>
                <p className="text-white font-medium">{asset.name}</p>
                <p className="text-slate-400 text-sm">
                  1{type === "stocks" ? "주" : asset.symbol} ≈ {formatKrw(asset.currentPrice.krw)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-white font-semibold">{formatKrw(asset.value.krw)}</p>
                <p className="text-slate-400 text-sm">
                  {type === "cash"
                    ? `${asset.amount.toLocaleString()} ${asset.symbol}`
                    : `${asset.amount} ${asset.symbol}`}
                </p>
              </div>
              <button onClick={() => openEditModal(type, asset)}>
                <EditIcon className="w-5 h-5 text-slate-500 hover:text-slate-600 transition-colors" />
              </button>
            </div>
          </div>
        ))}
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
