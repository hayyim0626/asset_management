"use server";

import { revalidatePath } from "next/cache";
import { FormState } from "@/shared/types";
import { removeAsset } from "@/features/assets/api";
import { createStockSellTransaction } from "@/entities/stocks/api";
import { cookieUtils } from "@/shared/api/supabase/cookie";

const parseOptionalNumber = (value: FormDataEntryValue | null) => {
  if (typeof value !== "string" || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

export const handleRemoveAsset = async (
  prevState: FormState,
  formData: FormData
): Promise<FormState> => {
  const { getAccessToken } = await cookieUtils();
  const token = getAccessToken() as string;
  const assetType = formData.get("assetType") as string;
  const res =
    assetType === "stocks"
      ? await createStockSellTransaction(token, {
          symbol: formData.get("symbol") as string,
          quantity: Number(formData.get("amount")),
          unitPrice: parseOptionalNumber(formData.get("sellPrice")),
          totalAmount: parseOptionalNumber(formData.get("totalAmount")),
          eventDate: (formData.get("eventDate") as string) || undefined
        })
      : await removeAsset(
          {
            assetType,
            symbol: formData.get("symbol") as string,
            amount: Number(formData.get("amount")),
            eventDate: (formData.get("eventDate") as string) || undefined,
            sellPrice: Number(formData.get("sellPrice")),
            category: formData.get("category") as string,
            categoryName: formData.get("categoryName") as string
          },
          token
        );

  if (res.success) {
    revalidatePath("/assets");
  }

  if (res.success) {
    return {
      success: true,
      error: null,
      message: assetType === "stocks" ? "주식 매도 내역이 저장되었습니다." : "자산이 성공적으로 편집되었습니다."
    };
  }

  return {
    success: false,
    error: res.error ?? (assetType === "stocks" ? "주식 매도 저장에 실패했습니다." : "자산 편집에 실패했습니다."),
    message: null
  };
};
