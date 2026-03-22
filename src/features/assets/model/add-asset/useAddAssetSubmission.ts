"use client";

import { useActionState } from "react";
import { INITIAL_STATE } from "@/features/assets/lib/consts";
import type { FormState } from "@/shared/types";
import type { AddAssetNotifier, AddAssetSubmitAction } from "./types";

interface PropType {
  submitAction: AddAssetSubmitAction;
  onClose: () => void;
  notifySuccess: AddAssetNotifier;
  notifyError: AddAssetNotifier;
}

export function useAddAssetSubmission({
  submitAction,
  onClose,
  notifySuccess,
  notifyError
}: PropType) {
  const [, formAction, isPending] = useActionState(
    async (prevState: FormState, formData: FormData) => {
      const result = await submitAction(prevState, formData);

      if (result.success) {
        notifySuccess(result.message ?? "자산이 성공적으로 추가되었습니다.");
        onClose();
      } else if (result.error) {
        notifyError(result.error);
      }

      return result;
    },
    INITIAL_STATE
  );

  return {
    formAction,
    isPending
  };
}
