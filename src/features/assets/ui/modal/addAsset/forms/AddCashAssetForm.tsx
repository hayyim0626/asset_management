"use client";

import { useState } from "react";
import type { CategoryList, CurrencyType } from "@/entities/assets/api/types";
import { AssetImage } from "@/entities/assets/ui";
import { categoryNamePlaceholder } from "@/features/assets/lib/functions";
import { Dropdown } from "@/shared/ui";

interface PropType {
  currencyOptions: CurrencyType[];
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

export function AddCashAssetForm({
  currencyOptions,
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
  const selectedCurrency = currencyOptions.find((item) => item.symbol === selectedSymbol);

  return (
    <div className={`space-y-4 transition-all duration-200 ${isCategoryDropdownOpen ? "min-h-[510px]" : ""}`}>
      <Dropdown>
        <Dropdown.Label>통화</Dropdown.Label>
        <Dropdown.Trigger placeholder="통화를 선택해주세요">
          {selectedSymbol ? (
            <div className="flex items-center space-x-3">
              <AssetImage assetType="cash" src={selectedCurrency?.image || ""} fallbackText={selectedCurrency?.symbol} />
              <div className="flex items-center space-x-2">
                <span className="font-medium">{selectedCurrency?.symbol}</span>
                <span className="text-slate-400">-</span>
                <span className="text-sm text-slate-400">{selectedCurrency?.name}</span>
              </div>
            </div>
          ) : null}
        </Dropdown.Trigger>
        <Dropdown.Container>
          {currencyOptions.map((currency) => (
            <Dropdown.ItemList
              key={currency.symbol}
              value={currency.symbol}
              selectedValue={selectedSymbol}
              onSelect={onSelectSymbol}
            >
              <>
                <AssetImage assetType="cash" src={currency.image} fallbackText={currency.symbol} />
                <div className="flex items-center space-x-2 flex-1">
                  <span className="font-medium">{currency.symbol}</span>
                  <span>-</span>
                  <span className="text-sm">{currency.name}</span>
                </div>
              </>
            </Dropdown.ItemList>
          ))}
        </Dropdown.Container>
      </Dropdown>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">보유 금액</label>
        <input
          type="number"
          step="0.01"
          name="amount"
          value={amount}
          onChange={(e) => onChangeAmount(e.target.value)}
          placeholder="수량 입력"
          className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
          required
        />
      </div>

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
            placeholder={`예) ${categoryNamePlaceholder({ assetType: "cash", selectedCategory })}`}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
            required
          />
        </>
      )}
    </div>
  );
}
