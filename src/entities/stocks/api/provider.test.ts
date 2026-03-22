/** @jest-environment node */

import { SeedStockMarketProvider } from "./seedProvider";

describe("SeedStockMarketProvider", () => {
  it("심볼과 이름으로 미국 주식/ETF 후보를 검색한다", async () => {
    const provider = new SeedStockMarketProvider();

    await expect(provider.searchSymbols("apple")).resolves.toEqual([
      expect.objectContaining({
        symbol: "AAPL",
        name: "Apple Inc.",
        assetKind: "US_STOCK"
      })
    ]);

    await expect(provider.searchSymbols("qqq")).resolves.toEqual([
      expect.objectContaining({
        symbol: "QQQ",
        assetKind: "US_ETF"
      })
    ]);
  });

  it("시드 quote를 fresh 상태로 반환한다", async () => {
    const provider = new SeedStockMarketProvider();
    const result = await provider.getQuotes(["AAPL", "VOO"]);

    expect(result).toEqual([
      expect.objectContaining({
        symbol: "AAPL",
        providerStatus: "fresh"
      }),
      expect.objectContaining({
        symbol: "VOO",
        providerStatus: "fresh"
      })
    ]);
  });
});
