import "server-only";

import type { StockMarketProvider, StockQuoteResult, StockSearchResult } from "./types";

type SeedStock = StockSearchResult & {
  priceUsd: number;
};

const SEED_STOCKS: SeedStock[] = [
  { symbol: "AAPL", name: "Apple Inc.", assetKind: "US_STOCK", exchange: "NASDAQ", providerName: "seed", priceUsd: 218.32 },
  { symbol: "MSFT", name: "Microsoft Corporation", assetKind: "US_STOCK", exchange: "NASDAQ", providerName: "seed", priceUsd: 427.77 },
  { symbol: "NVDA", name: "NVIDIA Corporation", assetKind: "US_STOCK", exchange: "NASDAQ", providerName: "seed", priceUsd: 118.11 },
  { symbol: "AMZN", name: "Amazon.com, Inc.", assetKind: "US_STOCK", exchange: "NASDAQ", providerName: "seed", priceUsd: 198.45 },
  { symbol: "GOOGL", name: "Alphabet Inc. Class A", assetKind: "US_STOCK", exchange: "NASDAQ", providerName: "seed", priceUsd: 171.12 },
  { symbol: "META", name: "Meta Platforms, Inc.", assetKind: "US_STOCK", exchange: "NASDAQ", providerName: "seed", priceUsd: 498.5 },
  { symbol: "TSLA", name: "Tesla, Inc.", assetKind: "US_STOCK", exchange: "NASDAQ", providerName: "seed", priceUsd: 176.83 },
  { symbol: "PLTR", name: "Palantir Technologies Inc.", assetKind: "US_STOCK", exchange: "NASDAQ", providerName: "seed", priceUsd: 29.14 },
  { symbol: "SPY", name: "SPDR S&P 500 ETF Trust", assetKind: "US_ETF", exchange: "NYSE Arca", providerName: "seed", priceUsd: 518.79 },
  { symbol: "VOO", name: "Vanguard S&P 500 ETF", assetKind: "US_ETF", exchange: "NYSE Arca", providerName: "seed", priceUsd: 477.9 },
  { symbol: "QQQ", name: "Invesco QQQ Trust", assetKind: "US_ETF", exchange: "NASDAQ", providerName: "seed", priceUsd: 441.25 },
  { symbol: "VTI", name: "Vanguard Total Stock Market ETF", assetKind: "US_ETF", exchange: "NYSE Arca", providerName: "seed", priceUsd: 275.66 },
  { symbol: "SCHD", name: "Schwab U.S. Dividend Equity ETF", assetKind: "US_ETF", exchange: "NYSE Arca", providerName: "seed", priceUsd: 79.84 },
  { symbol: "IVV", name: "iShares Core S&P 500 ETF", assetKind: "US_ETF", exchange: "NYSE Arca", providerName: "seed", priceUsd: 525.01 }
];

const normalizeQuery = (value: string) => value.trim().toUpperCase();

export class SeedStockMarketProvider implements StockMarketProvider {
  async searchSymbols(query: string): Promise<StockSearchResult[]> {
    const normalizedQuery = normalizeQuery(query);

    if (!normalizedQuery) {
      return SEED_STOCKS.slice(0, 8).map((stock) => ({
        symbol: stock.symbol,
        name: stock.name,
        assetKind: stock.assetKind,
        exchange: stock.exchange,
        providerName: stock.providerName,
        image: stock.image
      }));
    }

    return SEED_STOCKS.filter((stock) => {
      return (
        stock.symbol.includes(normalizedQuery) || stock.name.toUpperCase().includes(normalizedQuery)
      );
    })
      .slice(0, 12)
      .map((stock) => ({
        symbol: stock.symbol,
        name: stock.name,
        assetKind: stock.assetKind,
        exchange: stock.exchange,
        providerName: stock.providerName,
        image: stock.image
      }));
  }

  async getQuotes(symbols: string[]): Promise<StockQuoteResult[]> {
    const now = new Date().toISOString();

    return symbols
      .map((symbol) => normalizeQuery(symbol))
      .map((symbol) => SEED_STOCKS.find((stock) => stock.symbol === symbol))
      .filter((stock): stock is SeedStock => Boolean(stock))
      .map((stock) => ({
        symbol: stock.symbol,
        priceUsd: stock.priceUsd,
        fetchedAt: now,
        providerName: stock.providerName,
        providerStatus: "fresh"
      }));
  }
}
