"use client";

import { useState } from "react";
import type { AssetType } from "@/entities/assets/types";
import type { CategoryList, CurrencyType } from "@/entities/assets/api/types";
import type { EditAssetType } from "../assetSection";
import { Modal } from "@/shared/ui";
import { formatUsd } from "@/shared/lib/functions";
import { handleAddAsset, handleRemoveAsset } from "@/features/assets/model/functions";
import { handleEditAvgPrice } from "@/features/assets/model/functions/handleEditAvgPrice";
import { useEditAssetForm } from "@/features/assets/model/hooks";
import { AveragePriceInput } from "../components/AveragePriceInput";
import { AssetImage } from "@/entities/assets/ui";

type EditType = "ADD" | "REMOVE" | "DELETE" | "EDIT";

interface PropType {
  isOpen: boolean;
  onClose: () => void;
  assetType: AssetType | null;
  selectedEditData: EditAssetType | null;
  categoryList: CategoryList[];
  currencyList: CurrencyType[];
}

function EditButton({
  type,
  editAction,
  setEditAction,
  className,
  icon,
  text
}: {
  type: EditType;
  editAction: EditType;
  setEditAction: (action: EditType) => void;
  className: string;
  icon: string;
  text: string;
}) {
  return (
    <button
      type="button"
      onClick={() => setEditAction(type)}
      className={`p-3 rounded-lg border cursor-pointer transition-all ${
        editAction === type
          ? className
          : "border-slate-600 bg-slate-800/50 text-slate-300 hover:border-slate-500"
      }`}
    >
      <div className="text-center">
        <div className="text-lg mb-1 text-white">{icon}</div>
        <div className="text-xs">{text}</div>
      </div>
    </button>
  );
}

export function EditAssetModal(props: PropType) {
  const { isOpen, onClose, assetType, selectedEditData, categoryList, currencyList } = props;
  const [addAmount, setAddAmount] = useState(0);

  const {
    editAction,
    isAddPending,
    isRemovePending,
    isEditPending,
    setEditAction,
    addFormAction,
    removeFormAction,
    editFormAction
  } = useEditAssetForm({
    isOpen,
    handleAddAsset,
    handleRemoveAsset,
    handleEditAvgPrice,
    onClose
  });

  const category = categoryList?.find((el) => el.code === selectedEditData?.category)?.name;
  const usdKrwRate =
    currencyList.find((item) => item.code === "USD" || item.symbol === "USD")?.exchangeRate ?? null;

  const getFormAction = () => {
    if (editAction === "EDIT") return editFormAction;
    if (editAction === "ADD") return addFormAction;
    return removeFormAction;
  };

  const isPending = isAddPending || isRemovePending || isEditPending;

  return (
    <Modal title="자산 편집" isOpen={isOpen} onClose={onClose}>
      <form action={getFormAction()}>
        {assetType && <input type="hidden" name="assetType" value={assetType} />}
        {selectedEditData && <input type="hidden" name="symbol" value={selectedEditData.symbol} />}
        {selectedEditData && (
          <input type="hidden" name="category" value={selectedEditData.category} />
        )}
        {selectedEditData && (
          <input type="hidden" name="categoryName" value={selectedEditData.category_name} />
        )}
        {selectedEditData && (
          <input type="hidden" name="categoryId" value={selectedEditData.id} />
        )}

        <div className="p-6 space-y-6">
          {selectedEditData && (
            <>
              <div className="flex items-center space-x-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex justify-center items-center">
                  <AssetImage
                    assetType={assetType ?? "crypto"}
                    src={selectedEditData.image}
                    imageWidth={26}
                    emojiSize="text-3xl"
                    fallbackText={selectedEditData.symbol}
                  />
                </div>
                <div>
                  <p className="text-white font-medium">
                    {selectedEditData.name} / {category} ({selectedEditData.category_name})
                  </p>
                  <p className="text-slate-400 text-sm">
                    현재 보유량: {formatUsd(selectedEditData.amount, assetType === "stocks" ? 4 : 2)}{" "}
                    {selectedEditData.symbol}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  편집 유형 선택
                </label>
                <div
                  className={`grid gap-2 ${
                    assetType === "crypto" || assetType === "stocks"
                      ? "grid-cols-4"
                      : "grid-cols-3"
                  }`}
                >
                  <EditButton
                    type="ADD"
                    icon="➕"
                    text="추가하기"
                    editAction={editAction}
                    setEditAction={setEditAction}
                    className="border-blue-500 bg-blue-500/20 text-blue-400"
                  />
                  <EditButton
                    type="REMOVE"
                    icon="➖"
                    text="일부 빼기"
                    editAction={editAction}
                    setEditAction={setEditAction}
                    className="border-orange-500 bg-orange-500/20 text-orange-400"
                  />
                  <EditButton
                    type="DELETE"
                    icon="🗑️"
                    text="완전 삭제"
                    editAction={editAction}
                    setEditAction={setEditAction}
                    className="border-red-500 bg-red-500/20 text-red-400"
                  />
                  {(assetType === "crypto" || assetType === "stocks") && (
                    <EditButton
                      type="EDIT"
                      icon="✏️"
                      text={assetType === "stocks" ? "원가 수정" : "평단가 수정"}
                      editAction={editAction}
                      setEditAction={setEditAction}
                      className="border-purple-500 bg-purple-500/20 text-purple-400"
                    />
                  )}
                </div>
              </div>

              {editAction === "DELETE" ? (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-red-400 text-lg">⚠️</span>
                  </div>
                  <p className="text-red-300 text-sm">
                    <strong>
                      {selectedEditData.name} / {category} ({selectedEditData.category_name})
                    </strong>{" "}
                    자산을 완전히 삭제합니다.
                    <br />
                    <strong>한 번 삭제한 자산은 다시 되돌릴 수 없어요.</strong>
                  </p>
                  <input type="hidden" name="amount" value={selectedEditData.amount} />
                </div>
              ) : editAction === "EDIT" ? (
                <>
                  {assetType === "stocks" && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        기준일
                      </label>
                      <input
                        type="date"
                        name="eventDate"
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  )}
                  <AveragePriceInput
                    amount={selectedEditData.amount}
                    defaultValue={
                      assetType === "stocks"
                        ? selectedEditData.averagePriceUsd ?? selectedEditData.averagePrice
                        : selectedEditData.averagePrice
                    }
                    currencyCode={assetType === "stocks" ? "USD" : "KRW"}
                    storageCurrency={assetType === "stocks" ? "USD" : "KRW"}
                    availableCurrencies={assetType === "stocks" ? ["USD", "KRW"] : ["KRW"]}
                    exchangeRate={assetType === "stocks" ? usdKrwRate : null}
                    directModeLabel={assetType === "stocks" ? "1주당 가격" : "1개당 가격"}
                    averagePriceLabel="평균 매수 단가"
                    averagePricePlaceholder={
                      assetType === "stocks"
                        ? "1주당 평균 매수 가격 (USD)"
                        : "1개당 평균 매수 가격 (KRW)"
                    }
                    totalAmountPlaceholder={
                      assetType === "stocks" ? "총 매수금액 (USD)" : "총 투자금액 (KRW)"
                    }
                  />
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      {editAction === "ADD" ? "추가할" : "제거할"}{" "}
                      {assetType === "crypto"
                        ? "수량"
                        : assetType === "stocks"
                          ? "주식 수"
                          : "금액"}
                    </label>
                    <input
                      type="number"
                      step={
                        assetType === "crypto"
                          ? "0.00000001"
                          : assetType === "stocks"
                            ? "0.0001"
                            : "0.01"
                      }
                      max={editAction === "REMOVE" ? selectedEditData.amount : undefined}
                      placeholder={
                        editAction === "ADD"
                          ? "추가할 수량 입력"
                          : `최대 ${selectedEditData.amount} ${selectedEditData.symbol}`
                      }
                      className={`w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none ${
                        editAction === "ADD" ? "focus:border-blue-500" : "focus:border-orange-500"
                      }`}
                      name="amount"
                      required
                      onChange={(e) => {
                        if (editAction === "ADD") {
                          setAddAmount(parseFloat(e.target.value) || 0);
                        }
                      }}
                    />
                    {editAction === "REMOVE" && (
                      <p className="text-xs text-slate-400 mt-1">
                        보유 수량을 초과할 수 없습니다.
                      </p>
                    )}
                  </div>

                  {assetType === "stocks" && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        {editAction === "ADD" ? "매수일" : "매도일"}
                      </label>
                      <input
                        type="date"
                        name="eventDate"
                        className={`w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none ${
                          editAction === "ADD" ? "focus:border-blue-500" : "focus:border-orange-500"
                        }`}
                      />
                    </div>
                  )}

                  {editAction === "REMOVE" && assetType === "stocks" && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        매도가 (USD)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="sellPrice"
                        placeholder="주당 매도가 입력"
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                  )}

                  {editAction === "ADD" && assetType === "crypto" && (
                    <AveragePriceInput amount={addAmount} />
                  )}
                  {editAction === "ADD" && assetType === "stocks" && (
                    <AveragePriceInput
                      amount={addAmount}
                      currencyCode="USD"
                      storageCurrency="USD"
                      availableCurrencies={["USD", "KRW"]}
                      exchangeRate={usdKrwRate}
                      directModeLabel="1주당 가격"
                      averagePriceLabel="추가 매수 단가"
                      averagePricePlaceholder="1주당 평균 매수 가격 (USD)"
                      totalAmountPlaceholder="총 매수금액 (USD)"
                    />
                  )}
                </>
              )}
            </>
          )}
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
            disabled={isPending}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors cursor-pointer ${
              isPending
                ? "bg-slate-400 cursor-not-allowed"
                : editAction === "DELETE"
                  ? "bg-red-600 hover:bg-red-700"
                  : editAction === "REMOVE"
                    ? "bg-orange-600 hover:bg-orange-700"
                    : editAction === "EDIT"
                      ? "bg-purple-600 hover:bg-purple-700"
                      : "bg-blue-600 hover:bg-blue-700"
            } text-white`}
          >
            {isPending ? "처리 중..." : "업데이트"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
