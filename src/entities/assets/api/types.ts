export type AssetType = {
  totalValue: number;
  cash: { totalValue: number; assets: [] };
  crypto: { totalValue: number; assets: [] };
  stocks: { totalValue: number; assets: [] };
};
