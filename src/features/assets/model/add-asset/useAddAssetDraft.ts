"use client";

import { useEffect, useMemo, useReducer } from "react";
import type { AssetType } from "@/entities/assets/types";
import type { StockSearchResult } from "@/entities/stocks/api/types";
import type { AddAssetDraftState } from "./types";

const createInitialState = (assetType: AssetType | null): AddAssetDraftState => ({
  assetType,
  cash: {
    symbol: "",
    category: "",
    categoryName: "",
    amount: ""
  },
  crypto: {
    symbol: "",
    category: "",
    categoryName: "",
    amount: ""
  },
  stocks: {
    selectedStock: null,
    category: "",
    amount: "",
    eventDate: "",
    searchQuery: "",
    isSearchOpen: false
  }
});

type Action =
  | { type: "sync_asset_type"; assetType: AssetType | null }
  | { type: "reset"; assetType: AssetType | null }
  | { type: "set_cash_symbol"; symbol: string }
  | { type: "set_cash_category"; category: string }
  | { type: "set_cash_category_name"; categoryName: string }
  | { type: "set_cash_amount"; amount: string }
  | { type: "set_crypto_symbol"; symbol: string }
  | { type: "set_crypto_category"; category: string }
  | { type: "set_crypto_category_name"; categoryName: string }
  | { type: "set_crypto_amount"; amount: string }
  | { type: "set_stock_amount"; amount: string }
  | { type: "set_stock_event_date"; eventDate: string }
  | { type: "set_stock_search_query"; query: string }
  | { type: "open_stock_search" }
  | { type: "close_stock_search" }
  | { type: "select_stock"; stock: StockSearchResult };

const reducer = (state: AddAssetDraftState, action: Action): AddAssetDraftState => {
  switch (action.type) {
    case "sync_asset_type":
      return state.assetType === action.assetType
        ? state
        : {
            ...state,
            assetType: action.assetType,
            stocks: {
              ...state.stocks,
              isSearchOpen: action.assetType === "stocks" ? state.stocks.isSearchOpen : false
            }
          };
    case "reset":
      return createInitialState(action.assetType);
    case "set_cash_symbol":
      return { ...state, cash: { ...state.cash, symbol: action.symbol } };
    case "set_cash_category":
      return { ...state, cash: { ...state.cash, category: action.category } };
    case "set_cash_category_name":
      return { ...state, cash: { ...state.cash, categoryName: action.categoryName } };
    case "set_cash_amount":
      return { ...state, cash: { ...state.cash, amount: action.amount } };
    case "set_crypto_symbol":
      return { ...state, crypto: { ...state.crypto, symbol: action.symbol } };
    case "set_crypto_category":
      return { ...state, crypto: { ...state.crypto, category: action.category } };
    case "set_crypto_category_name":
      return { ...state, crypto: { ...state.crypto, categoryName: action.categoryName } };
    case "set_crypto_amount":
      return { ...state, crypto: { ...state.crypto, amount: action.amount } };
    case "set_stock_amount":
      return { ...state, stocks: { ...state.stocks, amount: action.amount } };
    case "set_stock_event_date":
      return { ...state, stocks: { ...state.stocks, eventDate: action.eventDate } };
    case "set_stock_search_query":
      return { ...state, stocks: { ...state.stocks, searchQuery: action.query } };
    case "open_stock_search":
      return {
        ...state,
        stocks: {
          ...state.stocks,
          isSearchOpen: true,
          searchQuery: state.stocks.selectedStock?.symbol ?? state.stocks.searchQuery
        }
      };
    case "close_stock_search":
      return {
        ...state,
        stocks: {
          ...state.stocks,
          isSearchOpen: false
        }
      };
    case "select_stock":
      return {
        ...state,
        stocks: {
          ...state.stocks,
          selectedStock: action.stock,
          category: action.stock.assetKind === "US_ETF" ? "etf" : "individual_stock",
          searchQuery: action.stock.symbol,
          isSearchOpen: false
        }
      };
    default:
      return state;
  }
};

export function useAddAssetDraft(isOpen: boolean, assetType: AssetType | null) {
  const [state, dispatch] = useReducer(reducer, createInitialState(assetType));

  useEffect(() => {
    dispatch({ type: "sync_asset_type", assetType });
  }, [assetType]);

  useEffect(() => {
    if (!isOpen) {
      dispatch({ type: "reset", assetType });
    }
  }, [isOpen, assetType]);

  const selectors = useMemo(() => {
    const stockCategoryName = state.stocks.selectedStock
      ? state.stocks.selectedStock.assetKind === "US_ETF"
        ? "ETF"
        : "개별주식"
      : "";

    const isSubmitBlocked = (() => {
      switch (state.assetType) {
        case "cash":
          return !state.cash.symbol || !state.cash.category || !state.cash.categoryName || !state.cash.amount;
        case "crypto":
          return (
            !state.crypto.symbol ||
            !state.crypto.category ||
            !state.crypto.categoryName ||
            !state.crypto.amount
          );
        case "stocks":
          return !state.stocks.selectedStock || !state.stocks.category || !state.stocks.amount;
        default:
          return true;
      }
    })();

    return {
      stockCategoryName,
      isSubmitBlocked
    };
  }, [state]);

  return {
    state,
    dispatch,
    selectors
  };
}
