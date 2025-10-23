import { revalidatePath } from "next/cache";
import { FormState } from "@/shared/types";
import { addAsset } from "@/features/assets/api";
import { cookieUtils } from "@/shared/api/supabase/cookie";

export const handleAddAsset = async (
  prevState: FormState,
  formData: FormData
): Promise<FormState> => {
  "use server";
  const { getAccessToken } = await cookieUtils();
  const token = getAccessToken() as string;

  const res = await addAsset(
    {
      assetType: formData.get("assetType") as string,
      symbol: formData.get("symbol") as string,
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

  return {
    success: true,
    error: null,
    message: "자산이 성공적으로 추가되었습니다."
  };
};
