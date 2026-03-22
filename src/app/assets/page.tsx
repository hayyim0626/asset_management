import { AssetClient } from "./client";
import { getAsset, getCurrency, getCoins, getAssetCategories } from "@/entities/assets/api";
import { mergeStockPortfolio, normalizePortfolio } from "@/entities/assets/lib";
import { getStockPortfolio } from "@/entities/stocks/api";
import { cookieUtils } from "@/shared/api/supabase/cookie";

export default async function AssetsPage() {
  const { getAccessToken } = await cookieUtils();
  const token = getAccessToken() as string;
  const asset = await getAsset(token);
  const currency = await getCurrency();
  const coins = await getCoins();
  const categories = await getAssetCategories();
  const portfolio = normalizePortfolio(asset.data);
  const stockPortfolio = token
    ? await getStockPortfolio(token)
    : { success: true, error: null, data: portfolio.stocks };
  const mergedPortfolio = mergeStockPortfolio(portfolio, stockPortfolio.data);

  return (
    <>
      <div className="min-h-screen bg-slate-950">
        <AssetClient
          data={mergedPortfolio}
          currencyList={currency.data ?? []}
          coinList={coins.data ?? []}
          category={categories.data ?? { cash: [], crypto: [], stocks: [] }}
        />
      </div>
    </>
  );
}
