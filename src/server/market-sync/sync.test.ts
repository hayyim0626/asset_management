/** @jest-environment node */

import { createServiceRoleClient } from "./supabase";
import { fetchCoinPaprikaTickers, fetchFrankfurterRates } from "./providers";
import { syncMarketData } from "./sync";

jest.mock("./supabase", () => ({
  createServiceRoleClient: jest.fn()
}));

jest.mock("./providers", () => ({
  fetchCoinPaprikaTickers: jest.fn(),
  fetchFrankfurterRates: jest.fn()
}));

const createCoinRow = (index: number, symbol = `COIN${index}`) => ({
  symbol,
  provider_id: `provider-${index}`,
  name: `Coin ${index}`,
  image: `https://example.com/${index}.png`,
  current_price_usd: index + 1,
  current_price_krw: (index + 1) * 1000,
  market_cap_usd: null,
  volume_24h_usd: null,
  rank: index + 1,
  last_updated: "2026-03-16T00:00:00.000Z"
});

describe("syncMarketData", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-16T10:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it("추적 중인 심볼만 기존 prices 히스토리 테이블에 insert한다", async () => {
    const insertCalls: Array<{
      table: string;
      rows: Array<Record<string, unknown>>;
    }> = [];

    (createServiceRoleClient as jest.Mock).mockReturnValue({
      from: (table: string) => {
        if (table === "coin_info") {
          return {
            select: async () => ({
              data: [{ symbol: "BTC" }, { symbol: "ETH" }],
              error: null
            })
          };
        }

        if (table === "currency_info") {
          return {
            select: async () => ({
              data: [
                { symbol: "KRW", is_base_currency: true },
                { symbol: "USD", is_base_currency: false }
              ],
              error: null
            })
          };
        }

        return {
          insert: async (rows: Array<Record<string, unknown>>) => {
            insertCalls.push({ table, rows });
            return { error: null };
          }
        };
      }
    });

    (fetchCoinPaprikaTickers as jest.Mock).mockResolvedValue([
      createCoinRow(0, "BTC"),
      createCoinRow(1, "ETH"),
      createCoinRow(2, "XRP")
    ]);
    (fetchFrankfurterRates as jest.Mock).mockResolvedValue([
      {
        symbol: "KRW",
        exchange_rate: 1,
        last_updated: "2026-03-16T00:00:00.000Z"
      },
      {
        symbol: "USD",
        exchange_rate: 1333.333333,
        last_updated: "2026-03-16T00:00:00.000Z"
      }
    ]);

    const result = await syncMarketData();

    expect(result).toEqual({
      startedAt: "2026-03-16T10:00:00.000Z",
      completedAt: "2026-03-16T10:00:00.000Z",
      coinCount: 2,
      exchangeRateCount: 2
    });

    expect(fetchFrankfurterRates).toHaveBeenCalledWith(["KRW", "USD"], "KRW");
    expect(insertCalls).toHaveLength(2);
    expect(insertCalls.map((call) => call.table)).toEqual([
      "coin_prices",
      "currency_prices"
    ]);
    expect(insertCalls[0]?.rows).toEqual([
      {
        coin_symbol: "BTC",
        price_usd: 1,
        price_krw: 1000,
        market_cap_usd: null,
        volume_24h_usd: null
      },
      {
        coin_symbol: "ETH",
        price_usd: 2,
        price_krw: 2000,
        market_cap_usd: null,
        volume_24h_usd: null
      }
    ]);
    expect(insertCalls[1]?.rows).toEqual([
      {
        currency_symbol: "KRW",
        exchange_rate: 1
      },
      {
        currency_symbol: "USD",
        exchange_rate: 1333.333333
      }
    ]);
  });

  it("추적 중인 코인 시세가 비어 있으면 실패한다", async () => {
    (createServiceRoleClient as jest.Mock).mockReturnValue({
      from: (table: string) => {
        if (table === "coin_info") {
          return {
            select: async () => ({
              data: [{ symbol: "BTC" }],
              error: null
            })
          };
        }

        if (table === "currency_info") {
          return {
            select: async () => ({
              data: [{ symbol: "KRW", is_base_currency: true }],
              error: null
            })
          };
        }

        return {
          insert: async () => ({ error: null })
        };
      }
    });

    (fetchCoinPaprikaTickers as jest.Mock).mockResolvedValue([]);
    (fetchFrankfurterRates as jest.Mock).mockResolvedValue([
      {
        symbol: "KRW",
        exchange_rate: 1,
        last_updated: "2026-03-16T00:00:00.000Z"
      }
    ]);

    await expect(syncMarketData()).rejects.toThrow("Missing coin market data for: BTC");
  });
});
