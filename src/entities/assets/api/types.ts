export type AssetType = {
  totalValue: { krw: number; usd: number };
  cash: { totalValue: { krw: number; usd: number }; assets: [] };
  crypto: { totalValue: { krw: number; usd: number }; assets: [] };
  stocks: { totalValue: { krw: number; usd: number }; assets: [] };
};

export type AssetList = {
  amount: number;
  currency?: string;
  currentPrice: { krw: number; usd: number };
  id: string;
  image: string;
  name: string;
  value: { krw: number; usd: number };
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
