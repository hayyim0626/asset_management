"use client";

import { ASSET_LIST } from "@/features/assets/lib/consts";
import type { AssetType } from "@/entities/assets/types";

interface PropType {
  assetType: AssetType | null;
  onSelect: (type: AssetType) => void;
}

export function AddAssetTypePicker({ assetType, onSelect }: PropType) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-3">자산 유형 선택</label>
      <div className="grid grid-cols-3 gap-2">
        {ASSET_LIST.map((asset) => (
          <button
            key={asset.value}
            type="button"
            onClick={() => onSelect(asset.value)}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              assetType === asset.value
                ? "border-blue-500 bg-blue-500/20 text-blue-400"
                : "border-slate-600 bg-slate-800/50 text-slate-300 hover:border-slate-500"
            }`}
          >
            <div className="text-center">
              <div className="text-lg mb-1">{asset.emoji}</div>
              <div className="text-xs">{asset.name}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
