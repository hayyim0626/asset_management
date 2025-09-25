"use client";
import Image from "next/image";
import React, { useState, useActionState, useEffect, useMemo } from "react";
import { AssetSection } from "./assetSection";
import { Modal } from "@/shared/ui";
import {
  AssetType,
  CurrencyType,
  CoinlistType
} from "@/entities/assets/api/types";
import { ASSET_LIST } from "@/features/assets/lib/consts";
import { formatKrw } from "@/shared/lib/functions";

export interface FormState {
  success: boolean;
  error: string | null;
  message: string | null;
}

interface PropType {
  handleSubmit: (
    prevState: FormState,
    formData: FormData
  ) => Promise<FormState>;
  data: AssetType;
  currencyList: CurrencyType[];
  coinList: CoinlistType[];
}

const PlusIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
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
      d="M12 4v16m8-8H4"
    />
  </svg>
);

const ChevronDownIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

export function AssetClient({
  handleSubmit,
  data,
  currencyList,
  coinList
}: PropType) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assetType, setAssetType] = useState<
    "crypto" | "stocks" | "cash" | null
  >(null);
  const [selectedAsset, setSelectedAsset] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [state, formAction, isPending] = useActionState(handleSubmit, {
    success: false,
    error: null,
    message: null
  });

  useEffect(() => {
    if (state.success) {
      closeModal();
    }
  }, [state.success]);

  useEffect(() => {
    switch (assetType) {
      case "cash":
        if (currencyList.length > 0 && !selectedAsset) {
          setSelectedAsset(currencyList[0].code);
        }
        break;
      case "crypto":
        if (coinList.length > 0 && !selectedAsset) {
          setSelectedAsset(coinList[0].symbol);
        }
        break;
      default:
        setSelectedAsset("");
    }
  }, [assetType, currencyList, coinList]);

  console.log(currencyList);

  const dropdownData = useMemo(() => {
    switch (assetType) {
      case "cash":
        return currencyList.map((el) => ({
          name: el.name,
          symbol: el.code,
          image: el.image
        }));
      case "crypto":
        return coinList.map((el) => ({
          name: el.name,
          symbol: el.symbol,
          image: el.image
        }));
      default:
        return currencyList.map((el) => ({
          name: el.name,
          symbol: el.code,
          image: el.image
        }));
    }
  }, [assetType]);

  const openModal = (assetType: "crypto" | "stocks" | "cash" | null = null) => {
    setAssetType(assetType);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setAssetType(null);
    setSelectedAsset("");
    setIsDropdownOpen(false);
  };

  const handleCurrencySelect = (currencyCode: string) => {
    setSelectedAsset(currencyCode);
    setIsDropdownOpen(false);
  };

  console.log(dropdownData);

  return (
    <div className="max-w-7xl sm:px-6 lg:p-8 mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">내 자산 현황</h1>
          <p className="text-slate-400">보유 자산을 관리하고 추적하세요</p>
        </div>
        {data.totalValue.krw > 0 && (
          <button
            onClick={() => openModal()}
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 cursor-pointer text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
          >
            <PlusIcon className="w-5 h-5" />
            <span>자산 추가</span>
          </button>
        )}
      </div>
      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/30 p-8">
        {data.totalValue.krw === 0 ? (
          <div className="flex flex-col items-center gap-6">
            <p className="text-blue-300 text-lg font-medium mb-2">
              아직 등록된 자산이 없어요!
            </p>
            <button
              onClick={() => openModal()}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 cursor-pointer text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
            >
              <PlusIcon className="w-5 h-5" />
              <span>첫 번째 자산 추가하기</span>
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-blue-300 text-lg font-medium mb-2">
              총 자산 가치
            </p>
            <p className="text-4xl font-bold text-white mb-4">
              {formatKrw(data.totalValue.krw)}
            </p>
            <div className="flex justify-center space-x-8 text-sm">
              <div className="text-center">
                <p className="text-slate-400">코인</p>
                <p className="text-white font-semibold">
                  {formatKrw(data.crypto.totalValue.krw)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-slate-400">주식</p>
                <p className="text-white font-semibold">
                  {formatKrw(data.stocks.totalValue.krw)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-slate-400">현금</p>
                <p className="text-white font-semibold">
                  {formatKrw(data.cash.totalValue.krw)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-8">
        <AssetSection
          openModal={openModal}
          title="현금 자산"
          totalValue={data.cash.totalValue}
          assets={data.cash?.assets || []}
          type="cash"
        />
        <AssetSection
          openModal={openModal}
          title="코인 자산"
          totalValue={data.crypto.totalValue}
          assets={data.crypto?.assets || []}
          type="crypto"
        />
        <AssetSection
          openModal={openModal}
          title="주식 자산"
          totalValue={data.stocks.totalValue}
          assets={data.stocks?.assets || []}
          type="stocks"
        />
      </div>

      <Modal title="자산 추가" isOpen={isModalOpen} onClose={closeModal}>
        <form action={formAction}>
          {assetType && (
            <input type="hidden" name="assetType" value={assetType} />
          )}
          {selectedAsset && (
            <input type="hidden" name="symbol" value={selectedAsset} />
          )}
          <div className="p-6 space-y-6">
            {!assetType && (
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
                        {selectedAsset &&
                        dropdownData.find((c) => c.symbol === selectedAsset) ? (
                          <>
                            <span className="text-lg">
                              {assetType === "cash" ? (
                                dropdownData.find(
                                  (c) => c.symbol === selectedAsset
                                )?.image
                              ) : (
                                <Image
                                  src={
                                    dropdownData.find(
                                      (c) => c.symbol === selectedAsset
                                    )?.image
                                  }
                                  width={20}
                                  height={20}
                                  alt="coin_img"
                                  className="rounded-full"
                                />
                              )}
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">
                                {selectedAsset}
                              </span>
                              <span className="text-slate-400">-</span>
                              <span className="text-sm text-slate-400">
                                {
                                  dropdownData.find(
                                    (c) => c.symbol === selectedAsset
                                  )?.name
                                }
                              </span>
                            </div>
                          </>
                        ) : (
                          <span className="text-slate-400">
                            통화를 선택해주세요
                          </span>
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
                            onClick={() =>
                              handleCurrencySelect(currency.symbol)
                            }
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
                              <span className="font-medium">
                                {currency.symbol}
                              </span>
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
                  step={
                    assetType === "crypto"
                      ? "0.00000001"
                      : assetType === "stocks"
                      ? "1"
                      : "0.01"
                  }
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
              onClick={closeModal}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isPending}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                isPending
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white`}
            >
              {isPending ? "추가 중..." : "추가하기"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
