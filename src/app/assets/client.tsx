/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useState, useMemo } from "react";
import { AssetSection } from "@/features/assets/ui/assetSection";
import type {
  UserPortfolio,
  CurrencyType,
  CoinlistType,
  Category
} from "@/entities/assets/api/types";
import type { EditAssetType } from "@/features/assets/ui/assetSection";
import { AddAssetModal, EditAssetModal } from "@/features/assets/ui";
import { formatKrw } from "@/shared/lib/functions";
import { FormState } from "@/shared/types";
import { AssetType } from "@/entities/assets/types";
import { SvgIcon } from "@/shared/ui";

interface PropType {
  handleAddAsset: (prevState: FormState, formData: FormData) => Promise<FormState>;
  handleRemoveAsset: (prevState: FormState, formData: FormData) => Promise<FormState>;
  data: UserPortfolio;
  currencyList: CurrencyType[];
  coinList: CoinlistType[];
  category: Category;
}

export function AssetClient({
  handleAddAsset,
  handleRemoveAsset,
  data,
  currencyList,
  coinList,
  category
}: PropType) {
  const [isAddModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [assetType, setAssetType] = useState<AssetType | null>(null);
  const [selectedEditData, setSelectedEditData] = useState<EditAssetType | null>(null);
  const [isFirstAdd, setIsFirstAdd] = useState(false);

  const dropdownData = useMemo(() => {
    switch (assetType) {
      case "cash":
        return currencyList;
      case "crypto":
        return coinList;
      default:
        return currencyList;
    }
  }, [assetType]);

  const openAddModal = (assetType: AssetType | null = null) => {
    setAssetType(assetType);
    setIsModalOpen(true);
  };

  const closeAddModal = () => {
    setIsModalOpen(false);
    setAssetType(null);
  };

  const openEditModal = (assetType: AssetType, asset: EditAssetType) => {
    setAssetType(assetType);
    setSelectedEditData(asset);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setAssetType(null);
    setSelectedEditData(null);
  };

  return (
    <div className="max-w-7xl sm:px-6 lg:p-8 mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">내 자산 현황</h1>
        <p className="text-slate-400">보유 자산을 관리하고 추적하세요</p>
      </div>
      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/30 p-8">
        {data.totalValue.krw === 0 ? (
          <div className="flex flex-col items-center gap-6">
            <p className="text-blue-300 text-lg font-medium mb-2">아직 등록된 자산이 없어요!</p>
            <button
              onClick={() => {
                setIsFirstAdd(true);
                openAddModal();
              }}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 cursor-pointer text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
            >
              <SvgIcon name="plus" />
              <span>첫 번째 자산 추가하기</span>
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-blue-300 text-lg font-medium mb-2">총 자산 가치</p>
            <p className="text-4xl font-bold text-white mb-4">{formatKrw(data.totalValue.krw)}</p>
            <div className="flex justify-center space-x-8 text-sm">
              <div className="text-center">
                <p className="text-slate-400">코인</p>
                <p className="text-white font-semibold">{formatKrw(data.crypto.totalValue.krw)}</p>
              </div>
              <div className="text-center">
                <p className="text-slate-400">주식</p>
                <p className="text-white font-semibold">{formatKrw(data.stocks.totalValue.krw)}</p>
              </div>
              <div className="text-center">
                <p className="text-slate-400">현금</p>
                <p className="text-white font-semibold">{formatKrw(data.cash.totalValue.krw)}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-8">
        <AssetSection
          openAddModal={openAddModal}
          openEditModal={openEditModal}
          title="현금 자산"
          totalValue={data.cash.totalValue}
          assets={data.cash?.assets || []}
          type="cash"
          category={category["cash"]}
        />
        <AssetSection
          openAddModal={openAddModal}
          openEditModal={openEditModal}
          title="코인 자산"
          totalValue={data.crypto.totalValue}
          assets={data.crypto?.assets || []}
          type="crypto"
          category={category["crypto"]}
        />
        <AssetSection
          openAddModal={openAddModal}
          openEditModal={openEditModal}
          title="주식 자산"
          totalValue={data.stocks.totalValue}
          assets={data.stocks?.assets || []}
          type="stocks"
          category={category["stocks"]}
        />
      </div>

      <AddAssetModal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        isFirstAdd={isFirstAdd}
        setIsFirstAdd={setIsFirstAdd}
        assetType={assetType}
        setAssetType={setAssetType}
        dropdownData={dropdownData}
        handleAddAsset={handleAddAsset}
        categoryList={category[assetType!]}
      />
      <EditAssetModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        assetType={assetType}
        selectedEditData={selectedEditData}
        handleAddAsset={handleAddAsset}
        handleRemoveAsset={handleRemoveAsset}
        categoryList={category[assetType!]}
      />
    </div>
  );
}
