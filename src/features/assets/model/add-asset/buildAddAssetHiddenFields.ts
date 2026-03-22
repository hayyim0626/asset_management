import type { AddAssetDraftState, AddAssetHiddenField } from "./types";

export function buildAddAssetHiddenFields(state: AddAssetDraftState): AddAssetHiddenField[] {
  if (!state.assetType) return [];

  const fields: AddAssetHiddenField[] = [{ name: "assetType", value: state.assetType }];

  if (state.assetType === "cash") {
    if (state.cash.symbol) fields.push({ name: "symbol", value: state.cash.symbol });
    if (state.cash.category) fields.push({ name: "category", value: state.cash.category });
    if (state.cash.categoryName) {
      fields.push({ name: "categoryName", value: state.cash.categoryName });
    }
    return fields;
  }

  if (state.assetType === "crypto") {
    if (state.crypto.symbol) fields.push({ name: "symbol", value: state.crypto.symbol });
    if (state.crypto.category) fields.push({ name: "category", value: state.crypto.category });
    if (state.crypto.categoryName) {
      fields.push({ name: "categoryName", value: state.crypto.categoryName });
    }
    return fields;
  }

  if (state.stocks.selectedStock) {
    fields.push({ name: "symbol", value: state.stocks.selectedStock.symbol });
    fields.push({ name: "name", value: state.stocks.selectedStock.name });
    fields.push({ name: "assetSubType", value: state.stocks.selectedStock.assetKind });
    fields.push({ name: "category", value: state.stocks.category });
    fields.push({ name: "categoryName", value: state.stocks.selectedStock.symbol });
  }

  return fields;
}
