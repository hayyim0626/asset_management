import { revalidatePath } from "next/cache";
import { AssetClient } from "@/features/assets/ui";
import { addAsset } from "@/features/assets/api";
import { getAsset, getCurrency, getCoins } from "@/entities/assets/api";
import { cookieUtils } from "@/shared/api/supabase/cookie";
import type { FormState } from "@/features/assets/ui/assetClient";

export default async function AssetsPage() {
  const { getAccessToken } = await cookieUtils();
  const token = getAccessToken() as string;
  const res = await getAsset(token);
  const currency = await getCurrency();
  const coins = await getCoins();

  const handleSubmit = async (
    prevState: FormState,
    formData: FormData
  ): Promise<FormState> => {
    "use server";
    // 여기 다시 수정해야 함(currency symbol 바뀜)
    // const res = await addAsset(
    //   {
    //     assetType: formData.get("assetType") as string,
    //     symbol: formData.get("symbol") as string,
    //     amount: Number(formData.get("amount")),
    //     averagePrice: Number(formData.get("averagePrice"))
    //   },
    //   token
    // );

    // if (res.success) {
    //   revalidatePath("/assets");
    // }

    return {
      success: true,
      error: null,
      message: "자산이 성공적으로 추가되었습니다."
    };
  };

  return (
    <>
      <div className="min-h-screen bg-slate-950">
        <AssetClient
          handleSubmit={handleSubmit}
          data={res.data}
          currencyList={currency.data}
          coinList={coins.data}
        />
      </div>
    </>
  );
}
