import type {
  AssetGroup,
  AssetItem,
  AssetSubType,
  FiatValue,
  ProfitLossValue,
  QuoteStatus,
  UserCategory,
  UserPortfolio
} from "@/entities/assets/api/types";

const EMPTY_FIAT_VALUE: FiatValue = { krw: 0, usd: 0 };

const toNumber = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
};

const toStringOrNull = (value: unknown) => {
  return typeof value === "string" && value.trim() !== "" ? value : null;
};

const hasValue = (value: unknown) => value != null && value !== "";

const toFiatValue = (value: unknown): FiatValue => {
  if (!value || typeof value !== "object") {
    return { ...EMPTY_FIAT_VALUE };
  }

  const input = value as Partial<FiatValue>;

  return {
    krw: toNumber(input.krw),
    usd: toNumber(input.usd)
  };
};

const toQuoteStatus = (value: unknown): QuoteStatus | undefined => {
  if (value === "fresh" || value === "stale" || value === "failed") {
    return value;
  }
  return undefined;
};

const toAssetSubType = (value: unknown): AssetSubType | undefined => {
  if (
    value === "US_STOCK" ||
    value === "US_ETF" ||
    value === "USD_CASH" ||
    value === "DIVIDEND" ||
    value === "DEPOSIT"
  ) {
    return value;
  }
  return undefined;
};

const toProfitLossValue = (value: unknown): ProfitLossValue | null => {
  if (!value || typeof value !== "object") return null;

  const input = value as Partial<ProfitLossValue>;
  const hasPercent = typeof input.percent === "number" || typeof input.percent === "string";
  const hasAmountKrw = typeof input.amountKrw === "number" || typeof input.amountKrw === "string";

  if (!hasPercent || !hasAmountKrw) {
    return null;
  }

  return {
    percent: toNumber(input.percent),
    amountKrw: toNumber(input.amountKrw),
    amountUsd:
      input.amountUsd == null
        ? null
        : Number.isFinite(Number(input.amountUsd))
          ? Number(input.amountUsd)
          : null
  };
};

const normalizeCategory = (value: unknown): UserCategory => {
  const input = value && typeof value === "object" ? (value as Partial<UserCategory>) : {};

  return {
    amount: toNumber(input.amount),
    category: typeof input.category === "string" ? input.category : "other",
    category_name: typeof input.category_name === "string" ? input.category_name : "기타",
    id: typeof input.id === "string" ? input.id : crypto.randomUUID(),
    averagePrice: hasValue(input.averagePrice) ? toNumber(input.averagePrice) : undefined,
    averagePriceUsd: hasValue(input.averagePriceUsd) ? toNumber(input.averagePriceUsd) : undefined,
    averagePriceKrw: hasValue(input.averagePriceKrw) ? toNumber(input.averagePriceKrw) : undefined,
    totalCostUsd: hasValue(input.totalCostUsd) ? toNumber(input.totalCostUsd) : undefined,
    totalCostKrw: hasValue(input.totalCostKrw) ? toNumber(input.totalCostKrw) : undefined,
    realizedLabel: toStringOrNull(input.realizedLabel) ?? undefined,
    assetSubType: toAssetSubType(input.assetSubType),
    eventDate: toStringOrNull(input.eventDate)
  };
};

const normalizeAsset = (value: unknown): AssetItem => {
  const input = value && typeof value === "object" ? (value as Partial<AssetItem>) : {};

  return {
    amount: toNumber(input.amount),
    symbol: typeof input.symbol === "string" ? input.symbol : "",
    categories: Array.isArray(input.categories) ? input.categories.map(normalizeCategory) : [],
    currentPrice: toFiatValue(input.currentPrice),
    id: typeof input.id === "string" ? input.id : crypto.randomUUID(),
    image: typeof input.image === "string" ? input.image : "",
    name: typeof input.name === "string" ? input.name : typeof input.symbol === "string" ? input.symbol : "",
    value: toFiatValue(input.value),
    lastUpdated: toStringOrNull(input.lastUpdated),
    quoteStatus: toQuoteStatus(input.quoteStatus),
    isStale: Boolean(input.isStale) || input.quoteStatus === "stale" || input.quoteStatus === "failed",
    staleReason: toStringOrNull(input.staleReason),
    lastSuccessfulFetchedAt: toStringOrNull(input.lastSuccessfulFetchedAt),
    profitLoss: toProfitLossValue(input.profitLoss),
    assetSubType: toAssetSubType(input.assetSubType),
    exchange: toStringOrNull(input.exchange),
    market: toStringOrNull(input.market)
  };
};

const normalizeGroup = (value: unknown): AssetGroup => {
  const input = value && typeof value === "object" ? (value as Partial<AssetGroup>) : {};

  return {
    totalValue: toFiatValue(input.totalValue),
    assets: Array.isArray(input.assets) ? input.assets.map(normalizeAsset) : []
  };
};

export const normalizePortfolio = (value: unknown): UserPortfolio => {
  const input = value && typeof value === "object" ? (value as Partial<UserPortfolio>) : {};

  return {
    totalValue: toFiatValue(input.totalValue),
    cash: normalizeGroup(input.cash),
    crypto: normalizeGroup(input.crypto),
    stocks: normalizeGroup(input.stocks)
  };
};
