type FiatValue = { krw: number; usd: number };

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
};

export type UserCategory = {
  amount: number;
  category: string;
  category_name: string;
  id: string;
};

export type CurrencyType = {
  code: string;
  name: string;
  symbol: string;
  image: string;
  exchangeRate: number;
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
