import { revalidatePath } from "next/cache";
import { AssetClient } from "@/features/assets/ui";
import { addAsset, removeAsset } from "@/features/assets/api";
import { getAsset, getCurrency, getCoins } from "@/entities/assets/api";
import { cookieUtils } from "@/shared/api/supabase/cookie";
import type { FormState } from "@/features/assets/ui/assetClient";

export default async function AssetsPage() {
  const { getAccessToken } = await cookieUtils();
  const token = getAccessToken() as string;
  const res = await getAsset(token);
  const currency = await getCurrency();
  const coins = await getCoins();

  const handleAddAsset = async (prevState: FormState, formData: FormData): Promise<FormState> => {
    "use server";
    const res = await addAsset(
      {
        assetType: formData.get("assetType") as string,
        symbol: formData.get("symbol") as string,
        amount: Number(formData.get("amount")),
        averagePrice: Number(formData.get("averagePrice"))
      },
      token
    );

    if (res.success) {
      revalidatePath("/assets");
    }

    return {
      success: true,
      error: null,
      message: "자산이 성공적으로 추가되었습니다.",
      date: Date.now()
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
        amount: Number(formData.get("amount"))
      },
      token
    );

    if (res.success) {
      revalidatePath("/assets");
    }

    return {
      success: true,
      error: null,
      message: "자산이 성공적으로 삭제되었습니다.",
      date: Date.now()
    };
  };

  return (
    <>
      <div className="min-h-screen bg-slate-950">
        <AssetClient
          handleAdd={handleAddAsset}
          handleRemove={handleRemoveAsset}
          data={res.data}
          currencyList={currency.data}
          coinList={coins.data}
        />
      </div>
    </>
  );
}
