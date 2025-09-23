"use client";

import { useState } from "react";
import { formatKrw } from "@/shared/lib/functions";

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

const XIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
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
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

// 자산 추가 모달 컴포넌트
const AddAssetModal = ({
  isOpen,
  onClose,
  selectedAssetType
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedAssetType: "crypto" | "stocks" | "cash" | null;
}) => {
  const [assetType, setAssetType] = useState<"crypto" | "stocks" | "cash">(
    selectedAssetType || "crypto"
  );

  if (!isOpen) return null;

  const handleSubmit = () => {
    console.log("Adding asset:", assetType);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-xl border border-slate-700 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white">자산 추가</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* 모달 컨텐츠 */}
        <div className="p-6 space-y-6">
          {/* 자산 타입 선택 (조건부 렌더링) */}
          {!selectedAssetType && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                자산 유형 선택
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setAssetType("crypto")}
                  className={`p-3 rounded-lg border transition-all ${
                    assetType === "crypto"
                      ? "border-blue-500 bg-blue-500/20 text-blue-400"
                      : "border-slate-600 bg-slate-800/50 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-lg mb-1">₿</div>
                    <div className="text-xs">코인</div>
                  </div>
                </button>
                <button
                  onClick={() => setAssetType("stocks")}
                  className={`p-3 rounded-lg border transition-all ${
                    assetType === "stocks"
                      ? "border-blue-500 bg-blue-500/20 text-blue-400"
                      : "border-slate-600 bg-slate-800/50 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-lg mb-1">📈</div>
                    <div className="text-xs">주식</div>
                  </div>
                </button>
                <button
                  onClick={() => setAssetType("cash")}
                  className={`p-3 rounded-lg border transition-all ${
                    assetType === "cash"
                      ? "border-blue-500 bg-blue-500/20 text-blue-400"
                      : "border-slate-600 bg-slate-800/50 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-lg mb-1">💰</div>
                    <div className="text-xs">현금</div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* 자산 입력 폼 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {assetType === "crypto" && "코인명/심볼"}
                {assetType === "stocks" && "종목명/심볼"}
                {assetType === "cash" && "통화"}
              </label>
              <input
                type="text"
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
                />
              </div>
            )}
          </div>
        </div>

        {/* 모달 푸터 */}
        <div className="flex space-x-3 p-6 border-t border-slate-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            추가하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default function AssetsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAssetType, setSelectedAssetType] = useState<
    "crypto" | "stocks" | "cash" | null
  >(null);

  // 임시 데이터 (실제로는 사용자별 데이터를 API에서 가져와야 함)
  const userAssets = {
    totalValue: 5670000,
    crypto: {
      totalValue: 2150000,
      assets: [
        {
          symbol: "BTC",
          name: "Bitcoin",
          amount: 0.05,
          currentPrice: 43250000,
          value: 2162500
        },
        {
          symbol: "ETH",
          name: "Ethereum",
          amount: 1.2,
          currentPrice: 3200000,
          value: 3840000
        }
      ]
    },
    stocks: {
      totalValue: 2350000,
      assets: [
        {
          symbol: "AAPL",
          name: "Apple Inc",
          amount: 10,
          currentPrice: 150000,
          value: 1500000
        },
        {
          symbol: "TSLA",
          name: "Tesla Inc",
          amount: 5,
          currentPrice: 170000,
          value: 850000
        }
      ]
    },
    cash: {
      totalValue: 1170000,
      assets: [
        { currency: "KRW", name: "원화", amount: 1000000, value: 1000000 },
        {
          currency: "USD",
          name: "달러",
          amount: 130,
          currentPrice: 1300,
          value: 169000
        }
      ]
    }
  };

  const openModal = (assetType: "crypto" | "stocks" | "cash" | null = null) => {
    setSelectedAssetType(assetType);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAssetType(null);
  };

  const AssetSection = ({
    title,
    totalValue,
    assets,
    type
  }: {
    title: string;
    totalValue: number;
    assets: any[];
    type: "crypto" | "stocks" | "cash";
  }) => (
    <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-2xl font-bold text-blue-400 mt-1">
            {formatKrw(totalValue)}
          </p>
        </div>
        <button
          onClick={() => openModal(type)}
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
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-white">
                  {type === "cash" ? asset.currency : asset.symbol}
                </span>
              </div>
              <div>
                <p className="text-white font-medium">{asset.name}</p>
                <p className="text-slate-400 text-sm">
                  {type === "cash"
                    ? `${asset.amount.toLocaleString()} ${asset.currency}`
                    : `${asset.amount} 개`}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-semibold">
                {formatKrw(asset.value)}
              </p>
              {type !== "cash" && (
                <p className="text-slate-400 text-sm">
                  {type === "crypto"
                    ? `${formatKrw(asset.currentPrice)}/개`
                    : `${formatKrw(asset.currentPrice)}/주`}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {assets.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          <p>등록된 {title.toLowerCase()} 자산이 없습니다.</p>
          <button
            onClick={() => openModal(type)}
            className="mt-4 text-blue-400 hover:text-blue-300 text-sm"
          >
            + 첫 번째 자산 추가하기
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="min-h-screen bg-slate-950 pt-[52px]">
        <div className="max-w-6xl mx-auto p-6 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                내 자산 현황
              </h1>
              <p className="text-slate-400">보유 자산을 관리하고 추적하세요</p>
            </div>
            <button
              onClick={() => openModal()}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 cursor-pointer text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
            >
              <PlusIcon className="w-5 h-5" />
              <span>자산 추가</span>
            </button>
          </div>

          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/30 p-8">
            <div className="text-center">
              <p className="text-blue-300 text-lg font-medium mb-2">
                총 자산 가치
              </p>
              <p className="text-4xl font-bold text-white mb-4">
                {formatKrw(userAssets.totalValue)}
              </p>
              <div className="flex justify-center space-x-8 text-sm">
                <div className="text-center">
                  <p className="text-slate-400">코인</p>
                  <p className="text-white font-semibold">
                    {formatKrw(userAssets.crypto.totalValue)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-slate-400">주식</p>
                  <p className="text-white font-semibold">
                    {formatKrw(userAssets.stocks.totalValue)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-slate-400">현금</p>
                  <p className="text-white font-semibold">
                    {formatKrw(userAssets.cash.totalValue)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <AssetSection
              title="코인 자산"
              totalValue={userAssets.crypto.totalValue}
              assets={userAssets.crypto.assets}
              type="crypto"
            />

            <AssetSection
              title="주식 자산"
              totalValue={userAssets.stocks.totalValue}
              assets={userAssets.stocks.assets}
              type="stocks"
            />

            <AssetSection
              title="현금 자산"
              totalValue={userAssets.cash.totalValue}
              assets={userAssets.cash.assets}
              type="cash"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-8">
            <button className="bg-slate-800 hover:bg-slate-700 text-white py-4 px-6 rounded-lg font-medium transition-colors">
              자산 분석 보기
            </button>
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white py-4 px-6 rounded-lg font-medium transition-colors">
              포트폴리오 리포트
            </button>
          </div>
        </div>
      </div>

      <AddAssetModal
        isOpen={isModalOpen}
        onClose={closeModal}
        selectedAssetType={selectedAssetType}
      />
    </>
  );
}
