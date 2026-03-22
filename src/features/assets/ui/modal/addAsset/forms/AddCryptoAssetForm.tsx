"use client";

import { useState } from "react";
import type { CategoryList, CoinlistType } from "@/entities/assets/api/types";
import { AssetImage } from "@/entities/assets/ui";
import { categoryNamePlaceholder } from "@/features/assets/lib/functions";
import { Dropdown } from "@/shared/ui";
import { AveragePriceInput } from "@/features/assets/ui/components/AveragePriceInput";

interface PropType {
  coinOptions: CoinlistType[];
  categoryList: CategoryList[];
  selectedSymbol: string;
  selectedCategory: string;
  categoryName: string;
  amount: string;
  onSelectSymbol: (symbol: string) => void;
  onSelectCategory: (category: string) => void;
  onChangeCategoryName: (value: string) => void;
  onChangeAmount: (value: string) => void;
}

export function AddCryptoAssetForm({
  coinOptions,
  categoryList,
  selectedSymbol,
  selectedCategory,
  categoryName,
  amount,
  onSelectSymbol,
  onSelectCategory,
  onChangeCategoryName,
  onChangeAmount
}: PropType) {
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const selectedCoin = coinOptions.find((item) => item.symbol === selectedSymbol);

  return (
    <div className={`space-y-4 transition-all duration-200 ${isCategoryDropdownOpen ? "min-h-[510px]" : ""}`}>
      <Dropdown>
        <Dropdown.Label>코인명/심볼</Dropdown.Label>
        <Dropdown.Trigger placeholder="코인을 선택해주세요">
          {selectedSymbol ? (
            <div className="flex items-center space-x-3">
              <AssetImage assetType="crypto" src={selectedCoin?.image || ""} fallbackText={selectedCoin?.symbol} />
              <div className="flex items-center space-x-2">
                <span className="font-medium">{selectedCoin?.symbol}</span>
                <span className="text-slate-400">-</span>
                <span className="text-sm text-slate-400">{selectedCoin?.name}</span>
              </div>
            </div>
          ) : null}
        </Dropdown.Trigger>
        <Dropdown.Container>
          {coinOptions.map((coin) => (
            <Dropdown.ItemList
              key={coin.symbol}
              value={coin.symbol}
              selectedValue={selectedSymbol}
              onSelect={onSelectSymbol}
            >
              <>
                <AssetImage assetType="crypto" src={coin.image} fallbackText={coin.symbol} />
                <div className="flex items-center space-x-2 flex-1">
                  <span className="font-medium">{coin.symbol}</span>
                  <span>-</span>
                  <span className="text-sm">{coin.name}</span>
                </div>
              </>
            </Dropdown.ItemList>
          ))}
        </Dropdown.Container>
      </Dropdown>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">보유 수량</label>
        <input
          type="number"
          step="0.00000001"
          name="amount"
          value={amount}
          onChange={(e) => onChangeAmount(e.target.value)}
          placeholder="수량 입력"
          className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
          required
        />
      </div>

      <AveragePriceInput amount={parseFloat(amount) || 0} />

      <Dropdown onOpenChange={setIsCategoryDropdownOpen}>
        <Dropdown.Label>카테고리</Dropdown.Label>
        <Dropdown.Trigger placeholder="카테고리를 선택해주세요">
          {selectedCategory && (
            <span className="font-medium">
              {categoryList.find((item) => item.code === selectedCategory)?.name}
            </span>
          )}
        </Dropdown.Trigger>
        <Dropdown.Container>
          {categoryList.map((category) => (
            <Dropdown.ItemList
              key={category.id}
              selectedValue={selectedCategory}
              value={category.code}
              onSelect={onSelectCategory}
            >
              {category.name}
            </Dropdown.ItemList>
          ))}
        </Dropdown.Container>
      </Dropdown>

      {selectedCategory && (
        <>
          <label className="block text-sm font-medium text-slate-300 mb-2">카테고리 상세</label>
          <input
            type="text"
            name="categoryNameVisible"
            value={categoryName}
            onChange={(e) => onChangeCategoryName(e.target.value)}
            placeholder={`예) ${categoryNamePlaceholder({ assetType: "crypto", selectedCategory })}`}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
            required
          />
        </>
      )}
    </div>
  );
}
