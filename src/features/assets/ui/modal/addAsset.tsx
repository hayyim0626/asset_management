"use client";

import type { CategoryList, CoinlistType, CurrencyType } from "@/entities/assets/api/types";
import type { AssetType } from "@/entities/assets/types";
import {
  buildAddAssetHiddenFields,
  useAddAssetDraft,
  useAddAssetSubmission,
  useStockPicker,
  type AddAssetDependencies
} from "@/features/assets/model/add-asset";
import { AddAssetModalShell } from "./addAsset/AddAssetModalShell";
import { AddAssetTypePicker } from "./addAsset/AddAssetTypePicker";
import {
  AddCashAssetForm,
  AddCryptoAssetForm,
  AddStockAssetForm,
  StockSearchModal
} from "./addAsset/forms";

interface PropType {
  isOpen: boolean;
  onClose: () => void;
  isFirstAdd: boolean;
  assetType: AssetType | null;
  setAssetType: (type: AssetType | null) => void;
  currencyOptions: CurrencyType[];
  coinOptions: CoinlistType[];
  usdKrwRate: number | null;
  categoryList: CategoryList[];
  dependencies: AddAssetDependencies;
}

export function AddAssetModal({
  isOpen,
  onClose,
  isFirstAdd,
  assetType,
  setAssetType,
  currencyOptions,
  coinOptions,
  usdKrwRate,
  categoryList,
  dependencies
}: PropType) {
  const { state, dispatch, selectors } = useAddAssetDraft(isOpen, assetType);
  const { formAction, isPending } = useAddAssetSubmission({
    submitAction: dependencies.submitAction,
    onClose,
    notifySuccess: dependencies.notifySuccess,
    notifyError: dependencies.notifyError
  });
  const { results: stockResults, isLoading: isStockLoading } = useStockPicker({
    enabled: state.assetType === "stocks" && state.stocks.isSearchOpen,
    query: state.stocks.searchQuery,
    searchStocks: dependencies.searchStocks
  });
  const hiddenFields = buildAddAssetHiddenFields(state);

  return (
    <>
      <AddAssetModalShell
        isOpen={isOpen && !state.stocks.isSearchOpen}
        onClose={onClose}
        formAction={formAction}
        hiddenFields={hiddenFields}
        isPending={isPending}
        isSubmitDisabled={selectors.isSubmitBlocked}
      >
        <div className="p-6 space-y-6">
          {isFirstAdd && (
            <AddAssetTypePicker
              assetType={state.assetType}
              onSelect={(type) => setAssetType(type)}
            />
          )}

          {state.assetType === "cash" && (
            <AddCashAssetForm
              currencyOptions={currencyOptions}
              categoryList={categoryList}
              selectedSymbol={state.cash.symbol}
              selectedCategory={state.cash.category}
              categoryName={state.cash.categoryName}
              amount={state.cash.amount}
              onSelectSymbol={(symbol) => dispatch({ type: "set_cash_symbol", symbol })}
              onSelectCategory={(category) => dispatch({ type: "set_cash_category", category })}
              onChangeCategoryName={(categoryName) =>
                dispatch({ type: "set_cash_category_name", categoryName })
              }
              onChangeAmount={(amount) => dispatch({ type: "set_cash_amount", amount })}
            />
          )}

          {state.assetType === "crypto" && (
            <AddCryptoAssetForm
              coinOptions={coinOptions}
              categoryList={categoryList}
              selectedSymbol={state.crypto.symbol}
              selectedCategory={state.crypto.category}
              categoryName={state.crypto.categoryName}
              amount={state.crypto.amount}
              onSelectSymbol={(symbol) => dispatch({ type: "set_crypto_symbol", symbol })}
              onSelectCategory={(category) => dispatch({ type: "set_crypto_category", category })}
              onChangeCategoryName={(categoryName) =>
                dispatch({ type: "set_crypto_category_name", categoryName })
              }
              onChangeAmount={(amount) => dispatch({ type: "set_crypto_amount", amount })}
            />
          )}

          {state.assetType === "stocks" && (
            <AddStockAssetForm
              selectedStock={state.stocks.selectedStock}
              stockCategoryName={selectors.stockCategoryName}
              amount={state.stocks.amount}
              eventDate={state.stocks.eventDate}
              usdKrwRate={usdKrwRate}
              onOpenSearch={() => dispatch({ type: "open_stock_search" })}
              onChangeAmount={(amount) => dispatch({ type: "set_stock_amount", amount })}
              onChangeEventDate={(eventDate) => dispatch({ type: "set_stock_event_date", eventDate })}
            />
          )}
        </div>
      </AddAssetModalShell>

      <StockSearchModal
        isOpen={isOpen && state.stocks.isSearchOpen}
        query={state.stocks.searchQuery}
        results={stockResults}
        isLoading={isStockLoading}
        onClose={() => dispatch({ type: "close_stock_search" })}
        onChangeQuery={(query) => dispatch({ type: "set_stock_search_query", query })}
        onSelectStock={(stock) => dispatch({ type: "select_stock", stock })}
      />
    </>
  );
}
