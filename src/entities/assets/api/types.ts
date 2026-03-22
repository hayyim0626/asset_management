export type FiatValue = { krw: number; usd: number };

export type QuoteStatus = "fresh" | "stale" | "failed";

export type AssetSubType = "US_STOCK" | "US_ETF" | "USD_CASH" | "DIVIDEND" | "DEPOSIT";

export type ProfitLossValue = {
  percent: number;
  amountKrw: number;
  amountUsd: number | null;
};

export type UserPortfolio = {
  totalValue: FiatValue;
  cash: AssetGroup;
  crypto: AssetGroup;
  stocks: AssetGroup;
};

export type AssetGroup = {
  totalValue: FiatValue;
  assets: AssetItem[];
};

export type AssetItem = {
  amount: number;
  symbol: string;
  categories: UserCategory[];
  currentPrice: FiatValue;
  id: string;
  image: string;
  name: string;
  value: FiatValue;
  lastUpdated?: string | null;
  quoteStatus?: QuoteStatus;
  isStale?: boolean;
  staleReason?: string | null;
  lastSuccessfulFetchedAt?: string | null;
  profitLoss?: ProfitLossValue | null;
  assetSubType?: AssetSubType;
  exchange?: string | null;
  market?: string | null;
};

export type UserCategory = {
  amount: number;
  category: string;
  category_name: string;
  id: string;
  averagePrice?: number;
  averagePriceUsd?: number;
  averagePriceKrw?: number;
  totalCostUsd?: number;
  totalCostKrw?: number;
  realizedLabel?: string;
  assetSubType?: AssetSubType;
  eventDate?: string | null;
};

export type CurrencyType = {
  code: string;
  name: string;
  symbol: string;
  image: string;
  exchangeRate: number;
  providerDate?: string;
};

export type CoinlistType = {
  name: string;
  image: string;
  symbol: string;
  currentPriceUsd: number;
  currentPriceKrw: number;
  marketCapUsd: number | null;
  volume24hUsd: number | null;
  lastUpdated: string;
};

export type CategoryList = {
  code: string;
  name: string;
  id: number;
};

export interface Category {
  cash: CategoryList[];
  crypto: CategoryList[];
  stocks: CategoryList[];
}
