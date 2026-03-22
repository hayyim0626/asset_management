export interface MarketCoinRow {
  symbol: string;
  provider_id: string;
  name: string;
  image: string;
  current_price_usd: number;
  current_price_krw: number;
  market_cap_usd: number | null;
  volume_24h_usd: number | null;
  rank: number | null;
  last_updated: string;
}

export interface MarketFxRateRow {
  symbol: string;
  exchange_rate: number;
  last_updated: string;
  provider_date: string;
}

export interface TrackedCurrencyRow {
  symbol: string;
  is_base_currency: boolean | null;
}

export interface CoinPriceInsertRow {
  coin_symbol: string;
  price_usd: number;
  price_krw: number;
  market_cap_usd: number | null;
  volume_24h_usd: number | null;
}

export interface CurrencyPriceInsertRow {
  currency_symbol: string;
  exchange_rate: number;
  provider_date: string;
}
