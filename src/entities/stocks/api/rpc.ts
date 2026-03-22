import "server-only";

import type { AssetGroup, AssetItem, AssetSubType, QuoteStatus } from "@/entities/assets/api/types";
import { createAuthenticatedSupabaseServerClient, createServiceRoleSupabaseClient } from "@/shared/api/supabase/server";
import { getStockMarketProvider } from "./provider";
import type { StockAssetKind, StockSearchResult } from "./types";

const STALE_AFTER_MINUTES = 15;
const EMPTY_ASSET_GROUP: AssetGroup = {
  totalValue: { krw: 0, usd: 0 },
  assets: []
};

type SearchStockSymbolRow = {
  symbol: string;
  name: string;
  market: string;
  asset_kind: StockAssetKind;
  currency: string;
  exchange: string | null;
  provider_symbol: string | null;
  provider_name: string | null;
  is_active: boolean;
};

type RefreshStockQuoteRow = {
  symbol: string;
  needs_refresh: boolean;
  reason: string;
  latest_fetched_at: string | null;
  last_successful_fetched_at: string | null;
  current_status: QuoteStatus;
};

type StockPortfolioRow = {
  symbol: string;
  name: string;
  asset_sub_type: AssetSubType;
  quantity: number | string;
  avg_unit_cost_usd: number | string;
  cost_basis_usd: number | string;
  current_price_usd: number | string;
  current_price_krw: number | string;
  market_value_usd: number | string;
  market_value_krw: number | string;
  profit_loss_usd: number | string;
  profit_loss_krw: number | string;
  profit_loss_percent: number | string;
  quote_status: QuoteStatus;
  is_stale: boolean;
  last_updated: string | null;
  last_successful_fetched_at: string | null;
  exchange: string | null;
  market: string;
};

type StockBuyPayload = {
  symbol: string;
  name?: string;
  assetSubType?: StockAssetKind;
  quantity: number;
  averagePrice?: number | null;
  totalAmount?: number | null;
  eventDate?: string | null;
};

type StockSellPayload = {
  symbol: string;
  quantity: number;
  unitPrice?: number | null;
  totalAmount?: number | null;
  eventDate?: string | null;
};

type StockCostBasisPayload = {
  symbol: string;
  averagePrice?: number | null;
  totalAmount?: number | null;
  eventDate?: string | null;
};

type StockMutationResult = {
  success: boolean;
  error: string | null;
  data: unknown;
};

const normalizeSymbol = (value: string) => value.trim().toUpperCase();

const toNumber = (value: number | string | null | undefined) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const toNullableNumber = (value: number | string | null | undefined) => {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toQuoteStatus = (value: string | null | undefined): QuoteStatus => {
  if (value === "fresh" || value === "stale" || value === "failed") {
    return value;
  }
  return "failed";
};

const mapSearchRows = (rows: SearchStockSymbolRow[]): StockSearchResult[] => {
  return rows.map((row) => ({
    symbol: row.symbol,
    name: row.name,
    assetKind: row.asset_kind,
    exchange: row.exchange,
    providerName: row.provider_name ?? "stock-domain"
  }));
};

const loadLocalSearchResults = async (query: string, limit = 12) => {
  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase.rpc("search_stock_symbols", {
    p_query: query,
    p_limit: limit
  });

  if (error) {
    throw new Error(error.message);
  }

  return mapSearchRows((data ?? []) as SearchStockSymbolRow[]);
};

const upsertStockSymbols = async (results: StockSearchResult[]) => {
  if (results.length === 0) return;

  const supabase = createServiceRoleSupabaseClient();
  const now = new Date().toISOString();
  const rows = results.map((result) => ({
    symbol: normalizeSymbol(result.symbol),
    name: result.name,
    market: "US",
    asset_kind: result.assetKind,
    currency: "USD",
    exchange: result.exchange,
    provider_symbol: normalizeSymbol(result.symbol),
    provider_name: result.providerName,
    is_active: true,
    updated_at: now
  }));

  const { error } = await supabase.from("stock_symbols").upsert(rows, {
    onConflict: "symbol"
  });

  if (error) {
    throw new Error(error.message);
  }
};

const ensureStockSymbol = async (payload: {
  symbol: string;
  name?: string;
  assetSubType?: StockAssetKind;
}) => {
  const symbol = normalizeSymbol(payload.symbol);
  if (!symbol || !payload.name || !payload.assetSubType) return;

  await upsertStockSymbols([
    {
      symbol,
      name: payload.name,
      assetKind: payload.assetSubType,
      exchange: null,
      providerName: "stock-domain"
    }
  ]);
};

const getLatestUsdKrwRate = async () => {
  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("currency_prices")
    .select("exchange_rate")
    .eq("currency_symbol", "USD")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return toNullableNumber(data?.exchange_rate) ?? 0;
};

const mapPortfolioRowToAsset = (row: StockPortfolioRow): AssetItem => {
  const quantity = toNumber(row.quantity);
  const currentPriceUsd = toNumber(row.current_price_usd);
  const currentPriceKrw = toNumber(row.current_price_krw);
  const costBasisUsd = toNumber(row.cost_basis_usd);
  const avgUnitCostUsd = toNumber(row.avg_unit_cost_usd);
  const inferredFxRate = currentPriceUsd > 0 ? currentPriceKrw / currentPriceUsd : 0;
  const costBasisKrw = inferredFxRate > 0 ? costBasisUsd * inferredFxRate : 0;
  const assetSubType = row.asset_sub_type === "US_ETF" ? "US_ETF" : "US_STOCK";

  return {
    amount: quantity,
    symbol: row.symbol,
    categories: [
      {
        amount: quantity,
        category: assetSubType === "US_ETF" ? "etf" : "individual_stock",
        category_name: row.symbol,
        id: row.symbol,
        averagePriceUsd: avgUnitCostUsd,
        averagePriceKrw: inferredFxRate > 0 ? avgUnitCostUsd * inferredFxRate : undefined,
        totalCostUsd: costBasisUsd,
        totalCostKrw: costBasisKrw > 0 ? costBasisKrw : undefined,
        assetSubType
      }
    ],
    currentPrice: {
      usd: currentPriceUsd,
      krw: currentPriceKrw
    },
    id: row.symbol,
    image: "",
    name: row.name,
    value: {
      usd: toNumber(row.market_value_usd),
      krw: toNumber(row.market_value_krw)
    },
    lastUpdated: row.last_updated,
    quoteStatus: toQuoteStatus(row.quote_status),
    isStale: Boolean(row.is_stale),
    staleReason: row.is_stale ? "quote_stale" : null,
    lastSuccessfulFetchedAt: row.last_successful_fetched_at,
    profitLoss: {
      percent: toNumber(row.profit_loss_percent),
      amountUsd: toNumber(row.profit_loss_usd),
      amountKrw: toNumber(row.profit_loss_krw)
    },
    assetSubType,
    exchange: row.exchange,
    market: row.market
  };
};

const mapPortfolioRowsToAssetGroup = (rows: StockPortfolioRow[]): AssetGroup => {
  const assets = rows.map(mapPortfolioRowToAsset);

  const totalValue = assets.reduce(
    (acc, asset) => ({
      usd: acc.usd + asset.value.usd,
      krw: acc.krw + asset.value.krw
    }),
    { usd: 0, krw: 0 }
  );

  return {
    totalValue,
    assets
  };
};

export const searchStocks = async (query: string): Promise<StockSearchResult[]> => {
  const trimmedQuery = query.trim();
  const localResults = await loadLocalSearchResults(trimmedQuery);

  if (localResults.length >= (trimmedQuery ? 6 : 8)) {
    return localResults;
  }

  const provider = getStockMarketProvider();
  const providerResults = await provider.searchSymbols(trimmedQuery);

  if (providerResults.length === 0) {
    return localResults;
  }

  await upsertStockSymbols(providerResults);

  const refreshedResults = await loadLocalSearchResults(trimmedQuery);
  return refreshedResults.length > 0 ? refreshedResults : providerResults;
};

export const refreshStockQuotesIfStale = async (accessToken: string, symbols?: string[]) => {
  const supabase = createAuthenticatedSupabaseServerClient(accessToken);
  const normalizedSymbols = symbols?.map(normalizeSymbol).filter(Boolean);

  const { data, error } = await supabase.rpc("refresh_stock_quotes_if_stale", {
    p_symbols: normalizedSymbols && normalizedSymbols.length > 0 ? normalizedSymbols : null,
    p_stale_after_minutes: STALE_AFTER_MINUTES
  });

  if (error) {
    throw new Error(error.message);
  }

  const staleRows = ((data ?? []) as RefreshStockQuoteRow[]).filter((row) => row.needs_refresh);
  if (staleRows.length === 0) return;

  const provider = getStockMarketProvider();
  const quoteResults = await provider.getQuotes(staleRows.map((row) => row.symbol));
  if (quoteResults.length === 0) return;

  const fxRate = await getLatestUsdKrwRate();
  const now = new Date();
  const rows = quoteResults.map((quote) => {
    const fetchedAt = quote.fetchedAt || now.toISOString();
    const fetchedAtDate = new Date(fetchedAt);
    const staleAt =
      quote.providerStatus === "fresh"
        ? new Date(fetchedAtDate.getTime() + STALE_AFTER_MINUTES * 60_000).toISOString()
        : fetchedAtDate.toISOString();

    return {
      symbol: normalizeSymbol(quote.symbol),
      price: quote.priceUsd,
      currency: "USD",
      price_krw: fxRate > 0 ? quote.priceUsd * fxRate : null,
      fx_rate_snapshot: fxRate > 0 ? fxRate : null,
      fetched_at: fetchedAtDate.toISOString(),
      stale_at: staleAt,
      provider_name: quote.providerName,
      provider_status: quote.providerStatus
    };
  });

  const serviceRole = createServiceRoleSupabaseClient();
  const { error: insertError } = await serviceRole.from("stock_quotes").insert(rows);

  if (insertError) {
    throw new Error(insertError.message);
  }
};

export const getStockPortfolio = async (accessToken: string) => {
  let refreshErrorMessage: string | null = null;

  try {
    await refreshStockQuotesIfStale(accessToken);
  } catch (error) {
    refreshErrorMessage =
      error instanceof Error ? error.message : "주식 시세 갱신에 실패했습니다.";
  }

  try {
    const supabase = createAuthenticatedSupabaseServerClient(accessToken);
    const { data, error } = await supabase.rpc("get_stock_portfolio");

    if (error) {
      return {
        success: false,
        error: error.message,
        data: EMPTY_ASSET_GROUP
      };
    }

    return {
      success: true,
      error: refreshErrorMessage,
      data: mapPortfolioRowsToAssetGroup((data ?? []) as StockPortfolioRow[])
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "주식 포트폴리오 조회에 실패했습니다.",
      data: EMPTY_ASSET_GROUP
    };
  }
};

export const createStockBuyTransaction = async (
  accessToken: string,
  payload: StockBuyPayload
): Promise<StockMutationResult> => {
  try {
    await ensureStockSymbol(payload);

    const supabase = createAuthenticatedSupabaseServerClient(accessToken);
    const { data, error } = await supabase.rpc("create_stock_buy_transaction", {
      p_symbol: normalizeSymbol(payload.symbol),
      p_quantity: payload.quantity,
      p_unit_price: payload.averagePrice ?? null,
      p_total_amount: payload.totalAmount ?? null,
      p_event_date: payload.eventDate ?? null,
      p_asset_sub_type: payload.assetSubType ?? null,
      p_meta: {} as Record<string, never>
    });

    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      };
    }

    return {
      success: true,
      error: null,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "주식 매수 저장에 실패했습니다.",
      data: null
    };
  }
};

export const createStockSellTransaction = async (
  accessToken: string,
  payload: StockSellPayload
): Promise<StockMutationResult> => {
  try {
    const supabase = createAuthenticatedSupabaseServerClient(accessToken);
    const { data, error } = await supabase.rpc("create_stock_sell_transaction", {
      p_symbol: normalizeSymbol(payload.symbol),
      p_quantity: payload.quantity,
      p_unit_price: payload.unitPrice ?? null,
      p_total_amount: payload.totalAmount ?? null,
      p_event_date: payload.eventDate ?? null,
      p_meta: {} as Record<string, never>
    });

    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      };
    }

    return {
      success: true,
      error: null,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "주식 매도 저장에 실패했습니다.",
      data: null
    };
  }
};

export const adjustStockCostBasis = async (
  accessToken: string,
  payload: StockCostBasisPayload
): Promise<StockMutationResult> => {
  try {
    const supabase = createAuthenticatedSupabaseServerClient(accessToken);
    const { data, error } = await supabase.rpc("adjust_stock_cost_basis", {
      p_symbol: normalizeSymbol(payload.symbol),
      p_total_cost_basis_usd: payload.totalAmount ?? null,
      p_avg_unit_cost_usd: payload.averagePrice ?? null,
      p_event_date: payload.eventDate ?? null,
      p_meta: {} as Record<string, never>
    });

    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      };
    }

    return {
      success: true,
      error: null,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "주식 원가 수정에 실패했습니다.",
      data: null
    };
  }
};
