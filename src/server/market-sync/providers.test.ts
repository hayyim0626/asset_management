/** @jest-environment node */

import { fetchCoinPaprikaTickers, fetchFrankfurterRates } from "./providers";

describe("market sync providers", () => {
  it("CoinPaprika 응답을 coin price row 후보로 정규화한다", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: "btc-bitcoin",
          name: "Bitcoin",
          symbol: "btc",
          rank: 1,
          last_updated: "2026-03-16T00:00:00Z",
          quotes: {
            USD: {
              price: 90000.12,
              market_cap: 1700000000000,
              volume_24h: 51000000000
            },
            KRW: {
              price: 130000000
            }
          }
        }
      ]
    });

    await expect(fetchCoinPaprikaTickers(fetchMock as unknown as typeof fetch)).resolves.toEqual([
      {
        symbol: "BTC",
        provider_id: "btc-bitcoin",
        name: "Bitcoin",
        image: "https://static.coinpaprika.com/coin/btc-bitcoin/logo.png",
        current_price_usd: 90000.12,
        current_price_krw: 130000000,
        market_cap_usd: 1700000000000,
        volume_24h_usd: 51000000000,
        rank: 1,
        last_updated: "2026-03-16T00:00:00.000Z"
      }
    ]);
  });

  it("CoinPaprika의 동일 심볼 중복은 rank가 높은 row 하나만 유지한다", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: "btc-bitcoin",
          name: "Bitcoin",
          symbol: "btc",
          rank: 1,
          last_updated: "2026-03-16T00:00:00Z",
          quotes: {
            USD: {
              price: 90000.12
            },
            KRW: {
              price: 130000000
            }
          }
        },
        {
          id: "btc-bad-duplicate",
          name: "Bitcoin Duplicate",
          symbol: "btc",
          rank: 50,
          last_updated: "2026-03-16T01:00:00Z",
          quotes: {
            USD: {
              price: 1
            },
            KRW: {
              price: 2
            }
          }
        }
      ]
    });

    await expect(fetchCoinPaprikaTickers(fetchMock as unknown as typeof fetch)).resolves.toEqual([
      {
        symbol: "BTC",
        provider_id: "btc-bitcoin",
        name: "Bitcoin",
        image: "https://static.coinpaprika.com/coin/btc-bitcoin/logo.png",
        current_price_usd: 90000.12,
        current_price_krw: 130000000,
        market_cap_usd: null,
        volume_24h_usd: null,
        rank: 1,
        last_updated: "2026-03-16T00:00:00.000Z"
      }
    ]);
  });

  it("Frankfurter 응답을 추적 통화 목록으로 정규화한다", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        date: "2026-03-16",
        rates: {
          USD: 0.00075,
          EUR: 0.00069,
          JPY: 0.111
        }
      })
    });

    const result = await fetchFrankfurterRates(
      ["KRW", "USD", "EUR", "JPY"],
      "KRW",
      fetchMock as unknown as typeof fetch
    );

    expect(result[0]).toEqual({
      symbol: "KRW",
      exchange_rate: 1,
      last_updated: "2026-03-16T00:00:00.000Z",
      provider_date: "2026-03-16"
    });
    expect(result.find((item) => item.symbol === "USD")?.exchange_rate).toBeCloseTo(1333.333333, 6);
    expect(result.find((item) => item.symbol === "USD")?.provider_date).toBe("2026-03-16");
    expect(result).toHaveLength(4);
  });

  it("기준 통화만 추적하면 외부 요청 없이 1을 반환한다", async () => {
    const fetchMock = jest.fn();

    await expect(fetchFrankfurterRates(["KRW"], "KRW", fetchMock as unknown as typeof fetch)).resolves.toEqual([
      {
        symbol: "KRW",
        exchange_rate: 1,
        last_updated: expect.any(String),
        provider_date: expect.any(String)
      }
    ]);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
