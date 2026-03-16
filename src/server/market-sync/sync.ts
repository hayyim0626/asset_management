import "server-only";

import { createServiceRoleClient } from "./supabase";
import { fetchCoinPaprikaTickers, fetchFrankfurterRates } from "./providers";
import { INSERT_CHUNK_SIZE } from "./constants";
import {
  CoinPriceInsertRow,
  CurrencyPriceInsertRow,
  MarketCoinRow,
  MarketFxRateRow,
  TrackedCurrencyRow
} from "./types";

const chunk = <T>(rows: T[], size: number) => {
  const chunks: T[][] = [];

  for (let index = 0; index < rows.length; index += size) {
    chunks.push(rows.slice(index, index + size));
  }

  return chunks;
};

const getTrackedCoinSymbols = async () => {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.from("coin_info").select("symbol");

  if (error) {
    throw new Error(`Failed to load coin_info: ${error.message}`);
  }

  return (data ?? []).map((row) => row.symbol as string);
};

const getTrackedCurrencies = async (): Promise<TrackedCurrencyRow[]> => {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.from("currency_info").select("symbol,is_base_currency");

  if (error) {
    throw new Error(`Failed to load currency_info: ${error.message}`);
  }

  return (data ?? []) as TrackedCurrencyRow[];
};

const insertRows = async <T extends object>(
  table: "coin_prices" | "currency_prices",
  rows: T[],
) => {
  if (rows.length === 0) return;

  const supabase = createServiceRoleClient();

  for (const batch of chunk(rows, INSERT_CHUNK_SIZE)) {
    const { error } = await supabase.from(table).insert(batch);

    if (error) {
      throw new Error(`Failed to insert ${table}: ${error.message}`);
    }
  }
};

const mapCoinPriceRows = (trackedSymbols: string[], providerCoins: MarketCoinRow[]): CoinPriceInsertRow[] => {
  const coinBySymbol = new Map(providerCoins.map((coin) => [coin.symbol, coin]));
  const missingSymbols = trackedSymbols.filter((symbol) => !coinBySymbol.has(symbol));

  if (missingSymbols.length > 0) {
    throw new Error(`Missing coin market data for: ${missingSymbols.join(", ")}`);
  }

  return trackedSymbols.map((symbol) => {
    const coin = coinBySymbol.get(symbol)!;

    return {
      coin_symbol: symbol,
      price_usd: coin.current_price_usd,
      price_krw: coin.current_price_krw,
      market_cap_usd: coin.market_cap_usd,
      volume_24h_usd: coin.volume_24h_usd
    };
  });
};

const mapCurrencyPriceRows = (
  trackedCurrencies: TrackedCurrencyRow[],
  providerRates: MarketFxRateRow[]
): CurrencyPriceInsertRow[] => {
  const rateBySymbol = new Map(providerRates.map((rate) => [rate.symbol, rate]));
  const missingSymbols = trackedCurrencies
    .map((currency) => currency.symbol)
    .filter((symbol) => !rateBySymbol.has(symbol));

  if (missingSymbols.length > 0) {
    throw new Error(`Missing FX market data for: ${missingSymbols.join(", ")}`);
  }

  return trackedCurrencies.map((currency) => ({
    currency_symbol: currency.symbol,
    exchange_rate: rateBySymbol.get(currency.symbol)!.exchange_rate
  }));
};

export const syncMarketData = async () => {
  const startedAt = new Date().toISOString();
  const [trackedCoinSymbols, trackedCurrencies, providerCoins] = await Promise.all([
    getTrackedCoinSymbols(),
    getTrackedCurrencies(),
    fetchCoinPaprikaTickers()
  ]);

  const baseCurrency = trackedCurrencies.find((currency) => currency.is_base_currency);

  if (!baseCurrency) {
    throw new Error("Missing base currency configuration in currency_info");
  }

  const providerRates = await fetchFrankfurterRates(
    trackedCurrencies.map((currency) => currency.symbol),
    baseCurrency.symbol
  );

  const coinPriceRows = mapCoinPriceRows(trackedCoinSymbols, providerCoins);
  const currencyPriceRows = mapCurrencyPriceRows(trackedCurrencies, providerRates);

  await insertRows<CoinPriceInsertRow>("coin_prices", coinPriceRows);
  await insertRows<CurrencyPriceInsertRow>("currency_prices", currencyPriceRows);

  return {
    startedAt,
    completedAt: new Date().toISOString(),
    coinCount: coinPriceRows.length,
    exchangeRateCount: currencyPriceRows.length
  };
};
