import Link from "next/link";
import Image from "next/image";
import { getAsset } from "@/entities/assets/api";
import { getCoinPrice } from "@/entities/crypto/api/getCoinPrice";
import { cookieUtils } from "@/shared/api/supabase/cookie";
import { formatKrw, formatUsd } from "@/shared/lib/functions";
import { AssetGroup } from "@/entities/assets/api/types";
import { CoinPrice } from "@/entities/crypto/types";
import { ASSET_LIST } from "@/features/assets/lib/consts";

export async function Dashboard() {
  const { getAccessToken } = await cookieUtils();
  const token = getAccessToken() as string;
  const assetData = await getAsset(token);
  const priceData = await getCoinPrice();

  const totalValueArrByAsset = () => {
    const obj = { ...assetData.data };
    delete obj.totalValue;

    return (Object.values(obj) as AssetGroup[])
      .map((el: AssetGroup, idx) => ({
        name: Object.keys(obj)[idx],
        totalValue: el.totalValue
      }))
      .sort((a, b) => (a.totalValue.krw < b.totalValue.krw ? 1 : -1));
  };

  const monthlyExpenses = {
    totalAmount: 750000,
    categories: [
      { name: "식비", amount: 300000 },
      { name: "교통비", amount: 150000 },
      { name: "쇼핑", amount: 200000 },
      { name: "기타", amount: 100000 }
    ]
  };

  return (
    <div className="max-w-7xl sm:px-6 lg:p-8 mx-auto space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">내 자산과 소비 현황을 한눈에 확인하세요</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">내 자산 현황</h2>
            <Link
              href="/assets"
              className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
            >
              자세히 보기 →
            </Link>
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg p-4 border border-blue-500/30">
              <p className="text-sm text-blue-300 font-medium">총 자산 가치</p>
              <p className="text-2xl font-bold text-white">
                {formatKrw(assetData.data.totalValue.krw)}
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-slate-300">자산별</h3>
              {totalValueArrByAsset().map((el) => (
                <div
                  key={el.name}
                  className="flex items-center justify-between py-2 px-3 bg-slate-800/50 rounded-lg border border-slate-700/50"
                >
                  <p className="text-xl">
                    <span className="text-2xl">
                      {ASSET_LIST.find((li) => li.value === el.name)?.emoji}
                    </span>{" "}
                    {ASSET_LIST.find((li) => li.value === el.name)?.name}
                  </p>
                  <div>
                    <p className="text-lg font-medium text-white">{formatKrw(el.totalValue.krw)}</p>
                    <p className="text-sm text-slate-400 text-right">
                      ${formatUsd(el.totalValue.usd, 0)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/assets"
            className="mt-6 w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 text-center block"
          >
            자산 관리하기
          </Link>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">이번달 소비</h2>
            {/* <Link
              href="/expenses"
              className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors"
            >
              자세히 보기 →
            </Link> */}
          </div>

          <div className="space-y-4">
            <p className="text-xl font-extrabold text-center">
              현재 소비노트 기능은 준비중이에요 <br /> 조금만 기다려주세요😅
            </p>
            {/* <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-lg p-4 border border-emerald-500/30">
              <p className="text-sm text-emerald-300 font-medium">총 소비 금액</p>
              <p className="text-2xl font-bold text-white">
                {formatKrw(monthlyExpenses.totalAmount)}
              </p>
            </div> */}
            {/* <div className="space-y-3">
              <h3 className="text-sm font-medium text-slate-300">카테고리별 소비</h3>
              {monthlyExpenses.categories.map((category, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 px-3 bg-slate-800/50 rounded-lg border border-slate-700/50"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <p className="text-sm font-medium text-white">{category.name}</p>
                  </div>
                  <p className="text-sm font-semibold text-white">{formatKrw(category.amount)}</p>
                </div>
              ))}
            </div> */}
          </div>

          {/* <Link
            href="/expenses"
            className="mt-6 w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 text-center block"
          >
            소비 관리하기
          </Link> */}
        </div>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
        <h2 className="text-xl font-semibold text-white mb-6">주요 코인 정보</h2>

        {priceData.coin.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {priceData.coin.map((coin: CoinPrice) => (
              <div
                key={coin.symbol}
                className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 text-center border border-slate-700/50"
              >
                <div className="flex items-center justify-center gap-3">
                  <Image
                    src={coin.image}
                    width={24}
                    height={24}
                    alt="coin_img"
                    className="rounded-full"
                  />
                  <h3 className="font-semibold text-white">{coin.name}</h3>
                </div>
                <p className="text-lg font-bold text-blue-400 mt-2">{formatKrw(coin.price_krw)}</p>
                <p className="text-lg font-bold text-blue-400">${formatUsd(coin.price_usd)}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-center py-8">코인 가격 정보를 불러오는 중...</p>
        )}
      </div>
    </div>
  );
}
