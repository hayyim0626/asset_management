export type StockAssetKind = "US_STOCK" | "US_ETF";

export type StockSearchResult = {
  symbol: string;
  name: string;
  assetKind: StockAssetKind;
  exchange: string | null;
  providerName: string;
  image?: string | null;
};

export type StockQuoteResult = {
  symbol: string;
  priceUsd: number;
  fetchedAt: string;
  providerName: string;
  providerStatus: "fresh" | "stale" | "failed";
};

export interface StockMarketProvider {
  searchSymbols(query: string): Promise<StockSearchResult[]>;
  getQuotes(symbols: string[]): Promise<StockQuoteResult[]>;
}
