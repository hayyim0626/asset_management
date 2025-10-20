import { revalidatePath } from "next/cache";
import { AssetClient } from "./client";
import { addAsset, removeAsset } from "@/features/assets/api";
import { getAsset, getCurrency, getCoins, getAssetCategories } from "@/entities/assets/api";
import { cookieUtils } from "@/shared/api/supabase/cookie";
import { FormState } from "@/shared/types";

export default async function AssetsPage() {
  const { getAccessToken } = await cookieUtils();
  const token = getAccessToken() as string;
  const asset = await getAsset(token);
  const currency = await getCurrency();
  const coins = await getCoins();
  const categories = await getAssetCategories();

  const handleAddAsset = async (prevState: FormState, formData: FormData): Promise<FormState> => {
    "use server";
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

  const handleRemoveAsset = async (
    prevState: FormState,
    formData: FormData
  ): Promise<FormState> => {
    "use server";
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

  return (
    <>
      <div className="min-h-screen bg-slate-950">
        <AssetClient
          handleAddAsset={handleAddAsset}
          handleRemoveAsset={handleRemoveAsset}
          data={asset.data}
          currencyList={currency.data}
          coinList={coins.data}
          category={categories.data}
        />
      </div>
    </>
  );
}
