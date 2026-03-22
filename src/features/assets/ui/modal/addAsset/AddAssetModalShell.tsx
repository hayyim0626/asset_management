"use client";

import { Modal } from "@/shared/ui";
import type { AddAssetHiddenField } from "@/features/assets/model/add-asset";

interface PropType {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  formAction: (formData: FormData) => void;
  hiddenFields: AddAssetHiddenField[];
  isPending: boolean;
  isSubmitDisabled: boolean;
  children: React.ReactNode;
}

export function AddAssetModalShell({
  isOpen,
  onClose,
  title = "자산 추가",
  formAction,
  hiddenFields,
  isPending,
  isSubmitDisabled,
  children
}: PropType) {
  return (
    <Modal title={title} isOpen={isOpen} onClose={onClose}>
      <form action={formAction}>
        {hiddenFields.map((field) => (
          <input key={`${field.name}:${field.value}`} type="hidden" name={field.name} value={field.value} />
        ))}
        {children}
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
            disabled={isPending || isSubmitDisabled}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors cursor-pointer ${
              isPending || isSubmitDisabled
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white`}
          >
            {isPending ? "추가 중..." : "추가하기"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
