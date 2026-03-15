import type { AssetItem } from "@/entities/assets/api/types";

/**
 * 수익률(%) 계산
 * @returns 수익률 (예: 12.34) 또는 null (평단가 없음)
 */
export const calcProfitLossPercent = (
  currentPrice: number,
  avgPrice: number | undefined | null
): number | null => {
  if (avgPrice == null || avgPrice <= 0) return null;
  return ((currentPrice - avgPrice) / avgPrice) * 100;
};

/**
 * KRW 손익 금액 계산
 * @returns KRW 손익 금액 또는 null
 */
export const calcProfitLossKrw = (
  currentPrice: number,
  avgPrice: number | undefined | null,
  amount: number
): number | null => {
  if (avgPrice == null || avgPrice <= 0) return null;
  if (amount === 0) return null;
  return (currentPrice - avgPrice) * amount;
};

/**
 * USD 손익 변환
 * @returns USD 손익 금액 또는 null
 */
export const calcProfitLossUsd = (
  profitLossKrw: number | null,
  exchangeRate: number
): number | null => {
  if (profitLossKrw == null) return null;
  if (exchangeRate <= 0) return null;
  return profitLossKrw / exchangeRate;
};

/**
 * 가중 평균 평단가 계산 (추가 매수 시)
 */
export const calcWeightedAvgPrice = (
  oldAvg: number,
  oldQty: number,
  newPrice: number,
  newQty: number
): number => {
  const totalQty = oldQty + newQty;
  if (totalQty === 0) return 0;
  return (oldAvg * oldQty + newPrice * newQty) / totalQty;
};

/**
 * 총 투자금액에서 평단가 역산
 */
export const calcAvgPriceFromTotal = (
  totalInvestment: number,
  amount: number
): number | null => {
  if (amount === 0) return null;
  return totalInvestment / amount;
};

/**
 * 코인 전체 합산 손익 계산 (상단 카드용)
 * 카테고리별 averagePrice가 있는 항목만 합산
 */
export const calcTotalProfitLoss = (
  assets: AssetItem[]
): { totalKrw: number; totalInvestmentKrw: number; totalValueKrw: number } | null => {
  let totalInvestmentKrw = 0;
  let totalValueKrw = 0;
  let hasAnyAvgPrice = false;

  for (const asset of assets) {
    for (const cat of asset.categories) {
      if (cat.averagePrice != null && cat.averagePrice > 0) {
        hasAnyAvgPrice = true;
        totalInvestmentKrw += cat.averagePrice * cat.amount;
        totalValueKrw += asset.currentPrice.krw * cat.amount;
      }
    }
  }

  if (!hasAnyAvgPrice) return null;

  return {
    totalKrw: totalValueKrw - totalInvestmentKrw,
    totalInvestmentKrw,
    totalValueKrw
  };
};
