"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CoinlistType, CurrencyType } from "@/entities/assets/api/types";
import { Modal } from "@/shared/ui";
import { ASSET_LIST } from "@/features/assets/lib/consts";

interface PropType {
  isOpen: boolean;
  onClose: () => void;
  isFirstAdd: boolean;
  setIsFirstAdd: (val: boolean) => void;
  addFormAction: (data: FormData) => void;
  assetType: "crypto" | "stocks" | "cash" | null;
  setAssetType: (type: "crypto" | "stocks" | "cash" | null) => void;
  isAddPending: boolean;
  dropdownData: CurrencyType[] | CoinlistType[];
}

export function AddAssetModal(props: PropType) {
  const {
    isOpen,
    onClose,
    isFirstAdd,
    setIsFirstAdd,
    addFormAction,
    assetType,
    setAssetType,
    isAddPending,
    dropdownData
  } = props;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<string>("");

  useEffect(() => {
    if (!isOpen) {
      setAssetType(null);
      setIsFirstAdd(false);
    }
  }, [isOpen]);

  const handleCurrencySelect = (currencyCode: string) => {
    setSelectedAsset(currencyCode);
    setIsDropdownOpen(false);
  };

  const ChevronDownIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );

  return (
    <Modal title="자산 추가" isOpen={isOpen} onClose={onClose}>
      <form action={addFormAction}>
        {assetType && <input type="hidden" name="assetType" value={assetType} />}
        {selectedAsset && <input type="hidden" name="symbol" value={selectedAsset} />}
        <div className="p-6 space-y-6">
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
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full px-4 py-3 cursor-pointer bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      {selectedAsset && dropdownData.find((c) => c.symbol === selectedAsset) ? (
                        <>
                          <span className="text-lg">
                            {assetType === "cash" ? (
                              dropdownData.find((c) => c.symbol === selectedAsset)?.image
                            ) : (
                              <Image
                                src={
                                  dropdownData.find((c) => c.symbol === selectedAsset)?.image || ""
                                }
                                width={20}
                                height={20}
                                alt="coin_img"
                                className="rounded-full"
                              />
                            )}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{selectedAsset}</span>
                            <span className="text-slate-400">-</span>
                            <span className="text-sm text-slate-400">
                              {dropdownData.find((c) => c.symbol === selectedAsset)?.name}
                            </span>
                          </div>
                        </>
                      ) : (
                        <span className="text-slate-400">통화를 선택해주세요</span>
                      )}
                    </div>
                    <ChevronDownIcon
                      className={`w-5 h-5 text-slate-400 transition-transform ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                      {dropdownData.map((currency) => (
                        <button
                          key={currency.symbol}
                          type="button"
                          onClick={() => handleCurrencySelect(currency.symbol)}
                          className={`w-full px-4 py-3 flex items-center space-x-3 hover:bg-slate-700 transition-colors text-left ${
                            selectedAsset === currency.symbol
                              ? "bg-blue-500/20 text-blue-400"
                              : "text-white"
                          }`}
                        >
                          {assetType === "cash" ? (
                            <span className="text-lg">{currency.image}</span>
                          ) : (
                            <Image
                              src={currency.image}
                              width={20}
                              height={20}
                              alt="coin_img"
                              className="rounded-full"
                            />
                          )}
                          <div className="flex items-center space-x-2 flex-1">
                            <span className="font-medium">{currency.symbol}</span>
                            <span>-</span>
                            <span className="text-sm">{currency.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
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
