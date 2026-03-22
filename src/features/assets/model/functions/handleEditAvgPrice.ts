"use server";

import { revalidatePath } from "next/cache";
import { FormState } from "@/shared/types";
import { editAveragePrice } from "@/features/assets/api/editAveragePrice";
import { adjustStockCostBasis } from "@/entities/stocks/api";
import { cookieUtils } from "@/shared/api/supabase/cookie";

const parseOptionalNumber = (value: FormDataEntryValue | null) => {
  if (typeof value !== "string" || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

export const handleEditAvgPrice = async (
  prevState: FormState,
  formData: FormData
): Promise<FormState> => {
  const { getAccessToken } = await cookieUtils();
  const token = getAccessToken() as string;
  const assetType = formData.get("assetType") as string;

  const avgPriceRaw = formData.get("averagePrice");
  const averagePrice = avgPriceRaw ? Number(avgPriceRaw) : null;

  const res =
    assetType === "stocks"
      ? await adjustStockCostBasis(token, {
          symbol: formData.get("symbol") as string,
          averagePrice: averagePrice && averagePrice > 0 ? averagePrice : null,
          totalAmount: parseOptionalNumber(formData.get("totalAmount")),
          eventDate: (formData.get("eventDate") as string) || undefined
        })
      : await editAveragePrice(
          {
            categoryId: formData.get("categoryId") as string,
            averagePrice: averagePrice && averagePrice > 0 ? averagePrice : null
          },
          token
        );

  if (res.success) {
    revalidatePath("/assets");

    return {
      success: true,
      error: null,
      message: assetType === "stocks" ? "주식 원가가 수정되었습니다." : "평균 매수 단가가 수정되었습니다."
    };
  }

  return {
    success: false,
    error: res.error ?? (assetType === "stocks" ? "주식 원가 수정에 실패했습니다." : "평균 매수 단가 수정에 실패했습니다."),
    message: null
  };
};
