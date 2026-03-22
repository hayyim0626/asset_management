import type { CoinlistType, CurrencyType } from "@/entities/assets/api/types";
import type { AssetType } from "@/entities/assets/types";
import type { StockSearchResult } from "@/entities/stocks/api/types";
import type { FormState } from "@/shared/types";

export type AddAssetSubmitAction = (
  prevState: FormState,
  formData: FormData
) => Promise<FormState>;

export type AddAssetNotifier = (message: string) => void;

export type SearchStocksFn = (
  query: string,
  signal?: AbortSignal
) => Promise<StockSearchResult[]>;

export type CashDraft = {
  symbol: string;
  category: string;
  categoryName: string;
  amount: string;
};

export type CryptoDraft = {
  symbol: string;
  category: string;
  categoryName: string;
  amount: string;
};

export type StockDraft = {
  selectedStock: StockSearchResult | null;
  category: "" | "individual_stock" | "etf";
  amount: string;
  eventDate: string;
  searchQuery: string;
  isSearchOpen: boolean;
};

export type AddAssetDraftState = {
  assetType: AssetType | null;
  cash: CashDraft;
  crypto: CryptoDraft;
  stocks: StockDraft;
};

export type AddAssetHiddenField = {
  name: string;
  value: string;
};

export type AddAssetDependencies = {
  submitAction: AddAssetSubmitAction;
  searchStocks: SearchStocksFn;
  notifySuccess: AddAssetNotifier;
  notifyError: AddAssetNotifier;
};

export type AddAssetOptionData = {
  currencyOptions: CurrencyType[];
  coinOptions: CoinlistType[];
  usdKrwRate: number | null;
};
