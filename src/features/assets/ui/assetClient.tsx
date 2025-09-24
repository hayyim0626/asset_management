"use client";

import React, { useState, useActionState } from "react";
import { AssetSection } from "./assetSection";
import { Modal } from "@/shared/ui";
import { AssetType } from "@/entities/assets/api/types";
import { ASSET_LIST } from "@/features/assets/lib/consts";
import { formatKrw } from "@/shared/lib/functions";

interface FormState {
  success: boolean;
  error: string | null;
  data: any;
  message: string | null;
}

interface PropType {
  handleSubmit: (
    prevState: FormState | null,
    formData: FormData
  ) => Promise<FormState>;
  data: AssetType;
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

export function AssetClient({ handleSubmit, data }: PropType) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assetType, setAssetType] = useState<
    "crypto" | "stocks" | "cash" | null
  >(null);

  const [_, formAction, isPending] = useActionState(handleSubmit, null);

  const openModal = (assetType: "crypto" | "stocks" | "cash" | null = null) => {
    setAssetType(assetType);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setAssetType(null);
  };

  return (
    <div className="max-w-7xl sm:px-6 lg:p-8 mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">내 자산 현황</h1>
          <p className="text-slate-400">보유 자산을 관리하고 추적하세요</p>
        </div>
        {data.totalValue > 0 && (
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
        {data.totalValue === 0 ? (
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
              {formatKrw(data.totalValue)}
            </p>
            <div className="flex justify-center space-x-8 text-sm">
              <div className="text-center">
                <p className="text-slate-400">코인</p>
                <p className="text-white font-semibold">
                  {formatKrw(data.crypto.totalValue)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-slate-400">주식</p>
                <p className="text-white font-semibold">
                  {formatKrw(data.stocks.totalValue)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-slate-400">현금</p>
                <p className="text-white font-semibold">
                  {formatKrw(data.cash.totalValue)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-8">
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

        <AssetSection
          openModal={openModal}
          title="현금 자산"
          totalValue={data.cash.totalValue}
          assets={data.cash?.assets || []}
          type="cash"
        />
      </div>

      {/* <div className="grid grid-cols-2 gap-4 pt-8">
        <button className="bg-slate-800 hover:bg-slate-700 text-white py-4 px-6 rounded-lg font-medium transition-colors">
          자산 분석 보기
        </button>
        <button className="bg-emerald-600 hover:bg-emerald-700 text-white py-4 px-6 rounded-lg font-medium transition-colors">
          포트폴리오 리포트
        </button>
      </div> */}
      <Modal title="자산 추가" isOpen={isModalOpen} onClose={closeModal}>
        <form action={formAction}>
          {assetType && (
            <input type="hidden" name="assetType" value={assetType} />
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
                <input
                  type="text"
                  name="symbol"
                  placeholder={
                    assetType === "crypto"
                      ? "BTC, ETH 등"
                      : assetType === "stocks"
                      ? "AAPL, TSLA 등"
                      : "USD, EUR 등"
                  }
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                />
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
              onClick={closeModal}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer"
            >
              {isPending ? "추가 중..." : "추가하기"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
