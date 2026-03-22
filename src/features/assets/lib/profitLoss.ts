import type { AssetItem, ProfitLossValue, UserCategory } from "@/entities/assets/api/types";
import type { AssetType } from "@/entities/assets/types";

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

const resolveStockAveragePriceUsd = (category: UserCategory) => {
  if (category.averagePriceUsd != null && category.averagePriceUsd > 0) {
    return category.averagePriceUsd;
  }

  if (category.totalCostUsd != null && category.totalCostUsd > 0 && category.amount > 0) {
    return category.totalCostUsd / category.amount;
  }

  if (category.averagePrice != null && category.averagePrice > 0) {
    return category.averagePrice;
  }

  return null;
};

const resolveStockAveragePriceKrw = (category: UserCategory) => {
  if (category.averagePriceKrw != null && category.averagePriceKrw > 0) {
    return category.averagePriceKrw;
  }

  if (category.totalCostKrw != null && category.totalCostKrw > 0 && category.amount > 0) {
    return category.totalCostKrw / category.amount;
  }

  return null;
};

export const calcCategoryProfitLoss = (
  asset: AssetItem,
  category: UserCategory,
  assetType: AssetType
): ProfitLossValue | null => {
  if (assetType === "stocks") {
    const averagePriceUsd = resolveStockAveragePriceUsd(category);
    if (averagePriceUsd == null) return null;

    const percent = calcProfitLossPercent(asset.currentPrice.usd, averagePriceUsd);
    if (percent == null) return null;

    const amountUsd = (asset.currentPrice.usd - averagePriceUsd) * category.amount;
    const averagePriceKrw =
      resolveStockAveragePriceKrw(category) ??
      (averagePriceUsd > 0 && asset.currentPrice.usd > 0
        ? averagePriceUsd * (asset.currentPrice.krw / asset.currentPrice.usd)
        : null);
    const amountKrw =
      averagePriceKrw != null ? (asset.currentPrice.krw - averagePriceKrw) * category.amount : 0;

    return {
      percent,
      amountUsd,
      amountKrw
    };
  }

  const percent = calcProfitLossPercent(asset.currentPrice.krw, category.averagePrice);
  const amountKrw = calcProfitLossKrw(asset.currentPrice.krw, category.averagePrice, category.amount);

  if (percent == null || amountKrw == null) return null;

  return {
    percent,
    amountKrw,
    amountUsd: null
  };
};

export const calcAssetProfitLoss = (asset: AssetItem, assetType: AssetType): ProfitLossValue | null => {
  if (asset.profitLoss) {
    return asset.profitLoss;
  }

  let totalInvestmentKrw = 0;
  let totalInvestmentUsd = 0;
  let totalValueKrw = 0;
  let totalValueUsd = 0;
  let totalAmount = 0;

  for (const category of asset.categories) {
    const categoryProfitLoss = calcCategoryProfitLoss(asset, category, assetType);
    if (!categoryProfitLoss) continue;

    totalAmount += category.amount;
    totalValueKrw += asset.currentPrice.krw * category.amount;
    totalValueUsd += asset.currentPrice.usd * category.amount;

    if (assetType === "stocks") {
      const averagePriceUsd = resolveStockAveragePriceUsd(category);
      const averagePriceKrw =
        resolveStockAveragePriceKrw(category) ??
        (averagePriceUsd != null && asset.currentPrice.usd > 0
          ? averagePriceUsd * (asset.currentPrice.krw / asset.currentPrice.usd)
          : null);

      if (averagePriceUsd != null) {
        totalInvestmentUsd += averagePriceUsd * category.amount;
      }
      if (averagePriceKrw != null) {
        totalInvestmentKrw += averagePriceKrw * category.amount;
      }
      continue;
    }

    if (category.averagePrice != null && category.averagePrice > 0) {
      totalInvestmentKrw += category.averagePrice * category.amount;
    }
  }

  if (totalAmount === 0) return null;

  const baseInvestment =
    assetType === "stocks" ? totalInvestmentUsd : totalInvestmentKrw;
  const baseValue = assetType === "stocks" ? totalValueUsd : totalValueKrw;
  const percent = baseInvestment > 0 ? ((baseValue - baseInvestment) / baseInvestment) * 100 : null;

  if (percent == null) return null;

  return {
    percent,
    amountKrw: totalValueKrw - totalInvestmentKrw,
    amountUsd: assetType === "stocks" ? totalValueUsd - totalInvestmentUsd : null
  };
};

/**
 * 코인 전체 합산 손익 계산 (상단 카드용)
 * 카테고리별 averagePrice가 있는 항목만 합산
 */
export const calcTotalProfitLoss = (
  assets: AssetItem[],
  assetType: AssetType = "crypto"
): { totalKrw: number; totalInvestmentKrw: number; totalValueKrw: number } | null => {
  let totalInvestmentKrw = 0;
  let totalValueKrw = 0;
  let hasAnyCostBasis = false;

  for (const asset of assets) {
    for (const category of asset.categories) {
      if (assetType === "stocks") {
        const averagePriceUsd = resolveStockAveragePriceUsd(category);
        if (averagePriceUsd == null) continue;

        hasAnyCostBasis = true;
        totalValueKrw += asset.currentPrice.krw * category.amount;

        const averagePriceKrw =
          resolveStockAveragePriceKrw(category) ??
          (asset.currentPrice.usd > 0
            ? averagePriceUsd * (asset.currentPrice.krw / asset.currentPrice.usd)
            : null);

        if (averagePriceKrw != null) {
          totalInvestmentKrw += averagePriceKrw * category.amount;
        }
        continue;
      }

      if (category.averagePrice != null && category.averagePrice > 0) {
        hasAnyCostBasis = true;
        totalInvestmentKrw += category.averagePrice * category.amount;
        totalValueKrw += asset.currentPrice.krw * category.amount;
      }
    }
  }

  if (!hasAnyCostBasis) return null;

  return {
    totalKrw: totalValueKrw - totalInvestmentKrw,
    totalInvestmentKrw,
    totalValueKrw
  };
};
