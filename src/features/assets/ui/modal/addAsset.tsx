"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { CategoryList, CoinlistType, CurrencyType } from "@/entities/assets/api/types";
import { Modal, Dropdown } from "@/shared/ui";
import { ASSET_LIST } from "@/features/assets/lib/consts";
import type { AssetType } from "@/entities/assets/types";
import { FormState } from "@/shared/types";
import { useAddAssetForm } from "./useAddAssetForm";

interface PropType {
  isOpen: boolean;
  onClose: () => void;
  isFirstAdd: boolean;
  setIsFirstAdd: (val: boolean) => void;
  assetType: AssetType | null;
  setAssetType: (type: AssetType | null) => void;
  dropdownData: CurrencyType[] | CoinlistType[];
  categoryList: CategoryList[];
  handleAddAsset: (prevState: FormState, formData: FormData) => Promise<FormState>;
}

const RenderImage = ({ assetType, image }: { assetType: "cash" | "crypto"; image: string }) =>
  assetType === "cash" ? (
    <span className="text-lg">{image}</span>
  ) : (
    <Image src={image} width={20} height={20} alt="asset_img" className="rounded-full" />
  );

export function AddAssetModal(props: PropType) {
  const {
    isOpen,
    onClose,
    isFirstAdd,
    setIsFirstAdd,
    assetType,
    setAssetType,
    dropdownData,
    categoryList,
    handleAddAsset
  } = props;
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  const {
    selectedAsset,
    selectedCategory,
    isAddPending,
    addFormAction,
    handleCurrencySelect,
    handleCategorySelect
  } = useAddAssetForm({
    isOpen,
    handleAddAsset,
    onClose,
    setAssetType,
    setIsFirstAdd
  });

  const categoryNamePlaceholder = useMemo(() => {
    switch (assetType) {
      case "cash":
        switch (selectedCategory) {
          case "house_deposit":
            return "부동산/내 월세 집";
          case "stock_account":
            return "삼성증권";
          case "crypto_account":
            return "업비트";
          default:
            return "국민은행";
        }
      case "crypto":
        switch (selectedCategory) {
          case "exchange":
            return "업비트";
          case "personal_wallet":
            return "메타마스크";
          case "hardware_wallet":
            return "JADE";
          case "crypto_account":
            return "업비트";
          case "defi":
            return "유니스왑";
          default:
            return "기타";
        }
      case "stocks":
        return "기타";
    }
  }, [assetType, selectedCategory]);

  return (
    <Modal title="자산 추가" isOpen={isOpen} onClose={onClose}>
      <form action={addFormAction}>
        {assetType && <input type="hidden" name="assetType" value={assetType} />}
        {selectedAsset && <input type="hidden" name="symbol" value={selectedAsset} />}
        {selectedCategory && <input type="hidden" name="category" value={selectedCategory} />}
        <div
          className={`p-6 space-y-6 transition-all duration-200 ${
            isCategoryDropdownOpen ? "min-h-[510px]" : ""
          }`}
        >
          {isFirstAdd && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                자산 유형 선택
              </label>
              <div className="grid grid-cols-3 gap-2">
                {ASSET_LIST.map((el) => (
                  <button
                    key={el.value}
                    onClick={() => setAssetType(el.value)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      assetType === el.value
                        ? "border-blue-500 bg-blue-500/20 text-blue-400"
                        : "border-slate-600 bg-slate-800/50 text-slate-300 hover:border-slate-500"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-lg mb-1">{el.emoji}</div>
                      <div className="text-xs">{el.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {assetType === "crypto" && "코인명/심볼"}
                {assetType === "stocks" && "종목명/심볼"}
                {assetType === "cash" && "통화"}
              </label>

              {assetType !== "stocks" ? (
                <Dropdown<CoinlistType | CurrencyType>
                  items={dropdownData}
                  value={selectedAsset}
                  onSelect={handleCurrencySelect}
                  getKey={(item) => item.symbol}
                  getValue={(item) => item.symbol}
                  placeholder={`${assetType === "cash" ? "통화를" : "코인을"} 선택해주세요`}
                  renderTrigger={(selected: CoinlistType | CurrencyType) => (
                    <>
                      <div className="flex items-center space-x-3">
                        {assetType && (
                          <RenderImage assetType={assetType} image={selected.image || ""} />
                        )}
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{selected.symbol}</span>
                          <span className="text-slate-400">-</span>
                          <span className="text-sm text-slate-400">{selected.name}</span>
                        </div>
                      </div>
                    </>
                  )}
                  renderItem={(item) => (
                    <>
                      {assetType && <RenderImage assetType={assetType} image={item.image} />}
                      <div className="flex items-center space-x-2 flex-1">
                        <span className="font-medium">{item.symbol}</span>
                        <span>-</span>
                        <span className="text-sm">{item.name}</span>
                      </div>
                    </>
                  )}
                />
              ) : (
                // 주식일 때 기존 입력 필드
                <input
                  type="text"
                  name="symbol"
                  required
                  placeholder={"AAPL, TSLA 등"}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {assetType === "crypto" && "보유 수량"}
                {assetType === "stocks" && "보유 주식 수"}
                {assetType === "cash" && "보유 금액"}
              </label>
              <input
                type="number"
                step={assetType === "crypto" ? "0.00000001" : assetType === "stocks" ? "1" : "0.01"}
                placeholder="수량 입력"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                name="amount"
                required
              />
            </div>
            {assetType !== "cash" && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  평균 단가 (원)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="구매 평균 단가"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                  name="averagePrice"
                />
              </div>
            )}
            <Dropdown
              label="카테고리"
              items={categoryList}
              value={selectedCategory}
              onSelect={handleCategorySelect}
              onOpenChange={setIsCategoryDropdownOpen}
              getKey={(item) => item.id}
              getValue={(item) => item.code}
              placeholder="카테고리를 선택해주세요"
              renderTrigger={(selected) => <span className="font-medium">{selected?.name}</span>}
              renderItem={(item) => <span>{item.name}</span>}
            />
            {selectedCategory && (
              <>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  카테고리 상세
                </label>
                <input
                  type="text"
                  placeholder={`예) ${categoryNamePlaceholder}`}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                  name="categoryName"
                  required
                />
              </>
            )}
          </div>
        </div>
        <div className="flex space-x-3 p-6 border-t border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors cursor-pointer"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isAddPending}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors cursor-pointer ${
              isAddPending ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            } text-white`}
          >
            {isAddPending ? "추가 중..." : "추가하기"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
