import { AssetClient } from "./client";
import { getAsset, getCurrency, getCoins, getAssetCategories } from "@/entities/assets/api";
import { cookieUtils } from "@/shared/api/supabase/cookie";

export default async function AssetsPage() {
  const { getAccessToken } = await cookieUtils();
  const token = getAccessToken() as string;
  const asset = await getAsset(token);
  const currency = await getCurrency();
  const coins = await getCoins();
  const categories = await getAssetCategories();

  return (
    <>
      <div className="min-h-screen bg-slate-950">
        <AssetClient
          data={asset.data}
          currencyList={currency.data}
          coinList={coins.data}
          category={categories.data}
        />
      </div>
    </>
  );
}
