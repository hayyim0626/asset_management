export type AssetType = {
  totalValue: number;
  cash: { totalValue: number; assets: [] };
  crypto: { totalValue: number; assets: [] };
  stocks: { totalValue: number; assets: [] };
};

export type CurrencyType = {
  code: string;
  name: string;
  symbol: string;
  flagEmoji: string;
  exchangeRate: number;
};
