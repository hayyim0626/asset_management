"use client";
import type { AssetItem } from "@/entities/assets/api/types";
import type { AssetType } from "@/entities/assets/types";
import { formatKrw } from "@/shared/lib/functions";
import { SvgIcon } from "@/shared/ui";
import Image from "next/image";

interface PropType {
  asset: AssetItem;
  toggleAsset: (id: string) => void;
  type: AssetType;
  expandedAssets: Set<string>;
}

export function ListButton(props: PropType) {
  const { asset, toggleAsset, type, expandedAssets } = props;
  const isExpanded = expandedAssets.has(asset.id);
  return (
    <button
      onClick={() => toggleAsset(asset.id)}
      className="flex items-center cursor-pointer justify-between py-3 px-4 w-full hover:bg-slate-800/70 transition-colors rounded-lg"
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
        <div className="text-start">
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
