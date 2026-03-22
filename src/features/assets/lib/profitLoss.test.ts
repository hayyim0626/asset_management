import {
  calcAssetProfitLoss,
  calcProfitLossPercent,
  calcProfitLossKrw,
  calcProfitLossUsd,
  calcWeightedAvgPrice,
  calcAvgPriceFromTotal,
  calcTotalProfitLoss
} from "./profitLoss";
import type { AssetItem } from "@/entities/assets/api/types";

describe("calcProfitLossPercent", () => {
  it("수익률 계산 (양수)", () => {
    expect(calcProfitLossPercent(112340, 100000)).toBeCloseTo(12.34, 2);
  });

  it("수익률 계산 (음수)", () => {
    expect(calcProfitLossPercent(94330, 100000)).toBeCloseTo(-5.67, 2);
  });

  it("avgPrice가 undefined일 때 null 반환", () => {
    expect(calcProfitLossPercent(100, undefined)).toBeNull();
  });

  it("avgPrice가 null일 때 null 반환", () => {
    expect(calcProfitLossPercent(100, null)).toBeNull();
  });

  it("avgPrice가 0일 때 null 반환", () => {
    expect(calcProfitLossPercent(100, 0)).toBeNull();
  });

  it("현재가와 평단가가 같으면 0%", () => {
    expect(calcProfitLossPercent(100, 100)).toBe(0);
  });
});

describe("calcProfitLossKrw", () => {
  it("KRW 손익 계산 (양수)", () => {
    expect(calcProfitLossKrw(150000, 100000, 2)).toBe(100000);
  });

  it("KRW 손익 계산 (음수)", () => {
    expect(calcProfitLossKrw(80000, 100000, 3)).toBe(-60000);
  });

  it("avgPrice가 null이면 null 반환", () => {
    expect(calcProfitLossKrw(100, null, 1)).toBeNull();
  });

  it("avgPrice가 0이면 null 반환", () => {
    expect(calcProfitLossKrw(100, 0, 1)).toBeNull();
  });

  it("amount가 0이면 null 반환", () => {
    expect(calcProfitLossKrw(100, 50, 0)).toBeNull();
  });
});

describe("calcProfitLossUsd", () => {
  it("KRW를 USD로 변환", () => {
    expect(calcProfitLossUsd(1350000, 1350)).toBeCloseTo(1000, 2);
  });

  it("profitLossKrw가 null이면 null 반환", () => {
    expect(calcProfitLossUsd(null, 1350)).toBeNull();
  });

  it("exchangeRate가 0이면 null 반환", () => {
    expect(calcProfitLossUsd(1000, 0)).toBeNull();
  });
});

describe("calcWeightedAvgPrice", () => {
  it("가중 평균 계산", () => {
    // 기존: 평단가 100, 수량 10 / 신규: 가격 200, 수량 10
    // (100*10 + 200*10) / 20 = 150
    expect(calcWeightedAvgPrice(100, 10, 200, 10)).toBe(150);
  });

  it("총 수량이 0이면 0 반환", () => {
    expect(calcWeightedAvgPrice(100, 0, 200, 0)).toBe(0);
  });

  it("기존 수량 0이면 신규 가격 반환", () => {
    expect(calcWeightedAvgPrice(0, 0, 200, 5)).toBe(200);
  });
});

describe("calcAvgPriceFromTotal", () => {
  it("총 투자금액에서 평단가 역산", () => {
    expect(calcAvgPriceFromTotal(1000000, 10)).toBe(100000);
  });

  it("amount가 0이면 null 반환", () => {
    expect(calcAvgPriceFromTotal(1000000, 0)).toBeNull();
  });
});

describe("calcTotalProfitLoss", () => {
  const makeAsset = (
    currentPriceKrw: number,
    categories: {
      amount: number;
      averagePrice?: number;
      averagePriceUsd?: number;
      averagePriceKrw?: number;
    }[]
  ): AssetItem => ({
    amount: categories.reduce((sum, c) => sum + c.amount, 0),
    symbol: "BTC",
    categories: categories.map((c, i) => ({
      amount: c.amount,
      category: "exchange",
      category_name: "test",
      id: String(i),
      averagePrice: c.averagePrice,
      averagePriceUsd: c.averagePriceUsd,
      averagePriceKrw: c.averagePriceKrw
    })),
    currentPrice: { krw: currentPriceKrw, usd: currentPriceKrw / 1350 },
    id: "1",
    image: "",
    name: "Bitcoin",
    value: {
      krw: currentPriceKrw * categories.reduce((sum, c) => sum + c.amount, 0),
      usd: (currentPriceKrw / 1350) * categories.reduce((sum, c) => sum + c.amount, 0)
    }
  });

  it("전체 합산 손익 계산", () => {
    const assets = [makeAsset(150000, [{ amount: 2, averagePrice: 100000 }])];
    const result = calcTotalProfitLoss(assets);
    expect(result).not.toBeNull();
    expect(result!.totalKrw).toBe(100000); // (150000 - 100000) * 2
    expect(result!.totalInvestmentKrw).toBe(200000);
    expect(result!.totalValueKrw).toBe(300000);
  });

  it("평단가 없는 자산만 있으면 null 반환", () => {
    const assets = [makeAsset(150000, [{ amount: 2 }])];
    expect(calcTotalProfitLoss(assets)).toBeNull();
  });

  it("빈 배열이면 null 반환", () => {
    expect(calcTotalProfitLoss([])).toBeNull();
  });

  it("혼합: 평단가 있는 카테고리만 합산", () => {
    const assets = [
      makeAsset(150000, [
        { amount: 2, averagePrice: 100000 },
        { amount: 3 } // averagePrice 없음 — 무시
      ])
    ];
    const result = calcTotalProfitLoss(assets);
    expect(result).not.toBeNull();
    expect(result!.totalKrw).toBe(100000); // (150000-100000)*2
    expect(result!.totalInvestmentKrw).toBe(200000);
  });

  it("주식 손익도 USD 기준으로 계산할 수 있다", () => {
    const stockAsset = makeAsset(270000, [{ amount: 2, averagePriceUsd: 180 }]);
    stockAsset.symbol = "AAPL";
    stockAsset.currentPrice = { krw: 270000, usd: 200 };
    stockAsset.value = { krw: 540000, usd: 400 };

    const result = calcAssetProfitLoss(stockAsset, "stocks");

    expect(result).not.toBeNull();
    expect(result?.percent).toBeCloseTo(11.111111, 5);
    expect(result?.amountKrw).toBe(54000);
    expect(result?.amountUsd).toBe(40);
  });
});
