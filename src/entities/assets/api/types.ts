export type AssetType = {
  totalValue: { krw: number; usd: number };
  cash: AssetInfo;
  crypto: AssetInfo;
  stocks: AssetInfo;
};

export type AssetInfo = {
  totalValue: { krw: number; usd: number };
  assets: [];
};

export type AssetList = {
  amount: number;
  symbol: string;
  categories: Category[];
  currentPrice: { krw: number; usd: number };
  id: string;
  image: string;
  name: string;
  value: { krw: number; usd: number };
};

export type Category = {
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
