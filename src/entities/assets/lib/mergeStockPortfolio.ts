import type { AssetGroup, UserPortfolio } from "@/entities/assets/api/types";

export const mergeStockPortfolio = (
  portfolio: UserPortfolio,
  stockGroup: AssetGroup
): UserPortfolio => {
  return {
    ...portfolio,
    stocks: stockGroup,
    totalValue: {
      krw: portfolio.cash.totalValue.krw + portfolio.crypto.totalValue.krw + stockGroup.totalValue.krw,
      usd: portfolio.cash.totalValue.usd + portfolio.crypto.totalValue.usd + stockGroup.totalValue.usd
    }
  };
};
