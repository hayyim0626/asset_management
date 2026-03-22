"use server";

import { revalidatePath } from "next/cache";
import { FormState } from "@/shared/types";
import { addAsset } from "@/features/assets/api";
import { createStockBuyTransaction } from "@/entities/stocks/api";
import { cookieUtils } from "@/shared/api/supabase/cookie";

const parseOptionalNumber = (value: FormDataEntryValue | null) => {
  if (typeof value !== "string" || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

export const handleAddAsset = async (
  prevState: FormState,
  formData: FormData
): Promise<FormState> => {
  const { getAccessToken } = await cookieUtils();
  const token = getAccessToken() as string;
  const assetType = formData.get("assetType") as string;

  const res =
    assetType === "stocks"
      ? await createStockBuyTransaction(token, {
          symbol: formData.get("symbol") as string,
          name: (formData.get("name") as string) || undefined,
          assetSubType: ((formData.get("assetSubType") as string) || undefined) as
            | "US_STOCK"
            | "US_ETF"
            | undefined,
          quantity: Number(formData.get("amount")),
          averagePrice: parseOptionalNumber(formData.get("averagePrice")),
          totalAmount: parseOptionalNumber(formData.get("totalAmount")),
          eventDate: (formData.get("eventDate") as string) || undefined
        })
      : await addAsset(
          {
            assetType,
            symbol: formData.get("symbol") as string,
            name: (formData.get("name") as string) || undefined,
            amount: Number(formData.get("amount")),
            averagePrice: Number(formData.get("averagePrice")),
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
      message: assetType === "stocks" ? "주식 매수 내역이 저장되었습니다." : "자산이 성공적으로 추가되었습니다."
    };
  }

  return {
    success: false,
    error: res.error ?? (assetType === "stocks" ? "주식 매수 저장에 실패했습니다." : "자산 추가에 실패했습니다."),
    message: null
  };
};
