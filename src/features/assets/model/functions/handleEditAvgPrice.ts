"use server";

import { revalidatePath } from "next/cache";
import { FormState } from "@/shared/types";
import { editAveragePrice } from "@/features/assets/api/editAveragePrice";
import { cookieUtils } from "@/shared/api/supabase/cookie";

export const handleEditAvgPrice = async (
  prevState: FormState,
  formData: FormData
): Promise<FormState> => {
  const { getAccessToken } = await cookieUtils();
  const token = getAccessToken() as string;

  const avgPriceRaw = formData.get("averagePrice");
  const averagePrice = avgPriceRaw ? Number(avgPriceRaw) : null;

  const res = await editAveragePrice(
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
      message: "평균 매수 단가가 수정되었습니다."
    };
  }

  return {
    success: false,
    error: res.error ?? "평균 매수 단가 수정에 실패했습니다.",
    message: null
  };
};
