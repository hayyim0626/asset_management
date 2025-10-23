import { revalidatePath } from "next/cache";
import { FormState } from "@/shared/types";
import { removeAsset } from "@/features/assets/api";
import { cookieUtils } from "@/shared/api/supabase/cookie";

export const handleRemoveAsset = async (
  prevState: FormState,
  formData: FormData
): Promise<FormState> => {
  "use server";
  const { getAccessToken } = await cookieUtils();
  const token = getAccessToken() as string;
  const res = await removeAsset(
    {
      assetType: formData.get("assetType") as string,
      symbol: formData.get("symbol") as string,
      amount: Number(formData.get("amount")),
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
    message: "자산이 성공적으로 편집되었습니다."
  };
};
