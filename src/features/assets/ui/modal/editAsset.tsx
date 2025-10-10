"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { AssetType } from "@/entities/assets/types";
import type { CategoryList } from "@/entities/assets/api/types";
import type { EditAssetType } from "../assetSection";
import { Modal } from "@/shared/ui";
import { formatUsd } from "@/shared/lib/functions";
import { FormState } from "@/shared/types";

type EditType = "ADD" | "REMOVE" | "DELETE";

interface PropType {
  isOpen: boolean;
  onClose: () => void;
  addFormAction: (data: FormData) => void;
  removeFormAction: (data: FormData) => void;
  assetType: AssetType | null;
  selectedEditData: EditAssetType | null;
  isAddPending: boolean;
  isRemovePending: boolean;
  addState: FormState;
  removeState: FormState;
  categoryList: CategoryList[];
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
  const {
    isOpen,
    onClose,
    addFormAction,
    removeFormAction,
    assetType,
    selectedEditData,
    isAddPending,
    isRemovePending,
    addState,
    removeState,
    categoryList
  } = props;
  const [editAction, setEditAction] = useState<EditType>("ADD");

  useEffect(() => {
    if (!isOpen) setEditAction("ADD");
  }, [isOpen]);

  const category = categoryList?.find((el) => el.code === selectedEditData?.category)?.name;

  return (
    <Modal title="자산 편집" isOpen={isOpen} onClose={onClose}>
      <form action={editAction === "ADD" ? addFormAction : removeFormAction}>
        {assetType && <input type="hidden" name="assetType" value={assetType} />}
        {selectedEditData && <input type="hidden" name="symbol" value={selectedEditData.symbol} />}
        {selectedEditData && (
          <input type="hidden" name="category" value={selectedEditData.category} />
        )}
        {selectedEditData && (
          <input type="hidden" name="categoryName" value={selectedEditData.category_name} />
        )}
        <div className="p-6 space-y-6">
          {selectedEditData && (
            <>
              <div className="flex items-center space-x-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex justify-center items-center">
                  <span className="text-3xl">
                    {assetType === "cash" ? (
                      selectedEditData.image
                    ) : (
                      <Image
                        src={selectedEditData.image}
                        width={26}
                        height={26}
                        alt="asset_img"
                        className="rounded-full"
                      />
                    )}
                  </span>
                </div>
                <div>
                  <p className="text-white font-medium">
                    {selectedEditData.name} / {category} ({selectedEditData.category_name})
                  </p>
                  <p className="text-slate-400 text-sm">
                    현재 보유량: {formatUsd(selectedEditData.amount)} {selectedEditData.symbol}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  편집 유형 선택
                </label>
                <div className="grid grid-cols-3 gap-2">
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
              ) : (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {editAction === "ADD" ? "추가할" : "제거할"}{" "}
                    {assetType === "crypto" ? "수량" : assetType === "stocks" ? "주식 수" : "금액"}
                  </label>
                  <input
                    type="number"
                    step={
                      assetType === "crypto" ? "0.00000001" : assetType === "stocks" ? "1" : "0.01"
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
                  />
                  {editAction === "REMOVE" && (
                    <p className="text-xs text-slate-400 mt-1">보유 수량을 초과할 수 없습니다.</p>
                  )}
                </div>
              )}

              {editAction === "ADD" && assetType !== "cash" && (
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

              {(addState.error || removeState.error) && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{addState.error || removeState.error}</p>
                </div>
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
            disabled={isAddPending || isRemovePending}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors cursor-pointer ${
              isAddPending || isRemovePending
                ? "bg-slate-400 cursor-not-allowed"
                : editAction === "DELETE"
                ? "bg-red-600 hover:bg-red-700"
                : editAction === "REMOVE"
                ? "bg-orange-600 hover:bg-orange-700"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white`}
          >
            {isAddPending || isRemovePending ? "처리 중..." : "업데이트"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
