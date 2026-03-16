import "server-only";

import { MarketCoinRow, MarketFxRateRow } from "./types";

interface CoinPaprikaQuote {
  price?: number;
  market_cap?: number;
  volume_24h?: number;
}

interface CoinPaprikaTicker {
  id?: string;
  name?: string;
  symbol?: string;
  rank?: number;
  quotes?: {
    USD?: CoinPaprikaQuote;
    KRW?: CoinPaprikaQuote;
  };
  last_updated?: string;
}

interface FrankfurterLatestResponse {
  date?: string;
  rates?: Record<string, number>;
}

type FetchLike = typeof fetch;

const COIN_PAPRIKA_URL = "https://api.coinpaprika.com/v1/tickers?quotes=USD,KRW";

const buildFrankfurterUrl = (baseCurrency: string, trackedSymbols: string[]) => {
  const quoteSymbols = trackedSymbols.filter((symbol) => symbol !== baseCurrency);

  if (quoteSymbols.length === 0) {
    return null;
  }

  return `https://api.frankfurter.dev/v1/latest?base=${baseCurrency}&symbols=${quoteSymbols.join(",")}`;
};

const toNumber = (value: number | undefined, field: string, coinId?: string) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new Error(`Invalid ${field}${coinId ? ` for ${coinId}` : ""}`);
  }

  return value;
};

const toIsoString = (value: string | undefined) => {
  if (!value) return new Date().toISOString();

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid timestamp: ${value}`);
  }

  return date.toISOString();
};

const compareCoins = (left: MarketCoinRow, right: MarketCoinRow) => {
  if (left.rank !== null && right.rank !== null && left.rank !== right.rank) {
    return left.rank - right.rank;
  }

  if (left.rank !== null) return -1;
  if (right.rank !== null) return 1;

  return right.last_updated.localeCompare(left.last_updated);
};

const dedupeCoinsBySymbol = (rows: MarketCoinRow[]) => {
  const seenSymbols = new Set<string>();

  return [...rows].sort(compareCoins).filter((row) => {
    if (seenSymbols.has(row.symbol)) {
      return false;
    }

    seenSymbols.add(row.symbol);
    return true;
  });
};

export const fetchCoinPaprikaTickers = async (
  fetchImpl: FetchLike = fetch
): Promise<MarketCoinRow[]> => {
  const response = await fetchImpl(COIN_PAPRIKA_URL, {
    headers: {
      Accept: "application/json"
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`CoinPaprika request failed with ${response.status}`);
  }

  const payload = (await response.json()) as CoinPaprikaTicker[];

  if (!Array.isArray(payload)) {
    throw new Error("CoinPaprika payload is not an array");
  }

  const normalizedRows = payload
    .filter(
      (ticker) => ticker.id && ticker.name && ticker.symbol && ticker.quotes?.USD && ticker.quotes?.KRW
    )
    .map((ticker) => ({
      symbol: ticker.symbol!.toUpperCase(),
      provider_id: ticker.id!,
      name: ticker.name!,
      image: `https://static.coinpaprika.com/coin/${ticker.id}/logo.png`,
      current_price_usd: toNumber(ticker.quotes?.USD?.price, "USD price", ticker.id),
      current_price_krw: toNumber(ticker.quotes?.KRW?.price, "KRW price", ticker.id),
      market_cap_usd:
        typeof ticker.quotes?.USD?.market_cap === "number" ? ticker.quotes.USD.market_cap : null,
      volume_24h_usd:
        typeof ticker.quotes?.USD?.volume_24h === "number" ? ticker.quotes.USD.volume_24h : null,
      rank: typeof ticker.rank === "number" ? ticker.rank : null,
      last_updated: toIsoString(ticker.last_updated)
    }));

  return dedupeCoinsBySymbol(normalizedRows);
};

export const fetchFrankfurterRates = async (
  trackedSymbols: string[],
  baseCurrency: string,
  fetchImpl: FetchLike = fetch
): Promise<MarketFxRateRow[]> => {
  const latestDateFallback = new Date().toISOString();
  const requestUrl = buildFrankfurterUrl(baseCurrency, trackedSymbols);

  if (!requestUrl) {
    return [
      {
        symbol: baseCurrency,
        exchange_rate: 1,
        last_updated: latestDateFallback
      }
    ];
  }

  const response = await fetchImpl(requestUrl, {
    headers: {
      Accept: "application/json"
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Frankfurter request failed with ${response.status}`);
  }

  const payload = (await response.json()) as FrankfurterLatestResponse;
  if (!payload.rates || typeof payload.rates !== "object") {
    throw new Error("Frankfurter payload is missing rates");
  }

  const latestDate = payload.date ? `${payload.date}T00:00:00.000Z` : latestDateFallback;

  return trackedSymbols.map((symbol) => {
    const exchangeRate = symbol === baseCurrency ? 1 : 1 / toNumber(payload.rates?.[symbol], symbol);

    return {
      symbol,
      exchange_rate: exchangeRate,
      last_updated: latestDate
    };
  });
};
