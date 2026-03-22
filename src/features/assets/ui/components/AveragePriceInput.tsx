"use client";

import { useEffect, useRef, useState } from "react";
import { Tooltip } from "@/shared/ui";
import { formatUsd } from "@/shared/lib/functions";

type InputMode = "DIRECT" | "TOTAL";
type DisplayCurrency = "KRW" | "USD";

export function getAveragePriceInputFractionDigits(currency: DisplayCurrency) {
  return currency === "USD" ? 2 : 0;
}

function roundAveragePriceInputValue(value: number, currency: DisplayCurrency) {
  if (!Number.isFinite(value)) return 0;

  const fractionDigits = getAveragePriceInputFractionDigits(currency);
  const multiplier = 10 ** fractionDigits;

  return Math.round((value + Number.EPSILON) * multiplier) / multiplier;
}

export function formatAveragePriceInputValue(value: number, currency: DisplayCurrency) {
  if (!Number.isFinite(value) || value <= 0) return "";

  const fractionDigits = getAveragePriceInputFractionDigits(currency);
  const roundedValue = roundAveragePriceInputValue(value, currency);

  if (fractionDigits === 0) {
    return String(Math.round(roundedValue));
  }

  return roundedValue.toFixed(fractionDigits).replace(/\.?0+$/, "");
}

function formatAveragePricePreviewValue(value: number, currency: DisplayCurrency) {
  if (!Number.isFinite(value) || value <= 0) return "0";

  const roundedValue = roundAveragePriceInputValue(value, currency);

  if (currency === "KRW") {
    return new Intl.NumberFormat("ko-KR", {
      maximumFractionDigits: 0
    }).format(roundedValue);
  }

  return formatUsd(roundedValue, getAveragePriceInputFractionDigits(currency));
}

export function sanitizeAveragePriceInputValue(rawValue: string, currency: DisplayCurrency) {
  if (rawValue === "") return "";

  const normalizedValue = rawValue.replace(",", ".");
  const cleanedValue = normalizedValue.replace(/[^\d.]/g, "");
  const dotIndex = cleanedValue.indexOf(".");
  const normalizedDotValue =
    dotIndex === -1
      ? cleanedValue
      : `${cleanedValue.slice(0, dotIndex + 1)}${cleanedValue.slice(dotIndex + 1).replace(/\./g, "")}`;

  const [integerPart = "", fractionPart] = normalizedDotValue.split(".");
  const fractionDigits = getAveragePriceInputFractionDigits(currency);

  if (fractionDigits === 0) {
    return integerPart;
  }

  if (fractionPart === undefined) {
    return normalizedDotValue.endsWith(".") && integerPart ? `${integerPart}.` : integerPart;
  }

  return `${integerPart}.${fractionPart.slice(0, fractionDigits)}`;
}

function getAveragePriceInputStep(currency: DisplayCurrency) {
  return currency === "USD" ? "0.01" : "1";
}

interface PropType {
  amount: number;
  defaultValue?: number;
  averagePriceName?: string;
  totalAmountName?: string;
  pricingInputModeName?: string;
  currencyCode?: "KRW" | "USD";
  directModeLabel?: string;
  totalModeLabel?: string;
  averagePriceLabel?: string;
  averagePricePlaceholder?: string;
  totalAmountPlaceholder?: string;
  helperText?: string;
  storageCurrency?: "KRW" | "USD";
  availableCurrencies?: DisplayCurrency[];
  exchangeRate?: number | null;
  pricingCurrencyName?: string;
}

export function AveragePriceInput({
  amount,
  defaultValue,
  averagePriceName = "averagePrice",
  totalAmountName = "totalAmount",
  pricingInputModeName = "pricingInputMode",
  currencyCode = "KRW",
  directModeLabel = "1개당 가격",
  totalModeLabel = "총액으로 계산",
  averagePriceLabel = "평균 매수 단가",
  averagePricePlaceholder,
  totalAmountPlaceholder,
  helperText = "평균 매수 단가를 입력하지 않으면 손익이 표시되지 않아요.",
  storageCurrency = currencyCode,
  availableCurrencies = [currencyCode],
  exchangeRate = null,
  pricingCurrencyName = "pricingCurrency"
}: PropType) {
  const [mode, setMode] = useState<InputMode>("DIRECT");
  const [selectedCurrency, setSelectedCurrency] = useState<DisplayCurrency>(currencyCode);
  const [directValue, setDirectValue] = useState("");
  const [totalValue, setTotalValue] = useState("");
  const selectedCurrencyRef = useRef<DisplayCurrency>(selectedCurrency);

  const hasCurrencySwitch = availableCurrencies.length > 1;

  const convertValue = (
    value: number,
    fromCurrency: DisplayCurrency,
    toCurrency: DisplayCurrency
  ) => {
    if (!Number.isFinite(value)) return 0;
    if (fromCurrency === toCurrency) return value;
    if (!exchangeRate || exchangeRate <= 0) return value;

    if (fromCurrency === "USD" && toCurrency === "KRW") {
      return value * exchangeRate;
    }

    if (fromCurrency === "KRW" && toCurrency === "USD") {
      return value / exchangeRate;
    }

    return value;
  };

  const toStorageValue = (value: number, sourceCurrency: DisplayCurrency) => {
    return convertValue(value, sourceCurrency, storageCurrency);
  };

  const displayAveragePrice =
    mode === "DIRECT"
      ? roundAveragePriceInputValue(parseFloat(directValue) || 0, selectedCurrency)
      : amount > 0
        ? roundAveragePriceInputValue((parseFloat(totalValue) || 0) / amount, selectedCurrency)
        : 0;
  const displayTotalAmount =
    mode === "TOTAL"
      ? roundAveragePriceInputValue(parseFloat(totalValue) || 0, selectedCurrency)
      : amount > 0
        ? roundAveragePriceInputValue((parseFloat(directValue) || 0) * amount, selectedCurrency)
        : 0;
  const avgPrice = toStorageValue(displayAveragePrice, selectedCurrency);
  const totalAmount = toStorageValue(displayTotalAmount, selectedCurrency);

  useEffect(() => {
    selectedCurrencyRef.current = selectedCurrency;
  }, [selectedCurrency]);

  useEffect(() => {
    if (defaultValue == null || defaultValue <= 0) return;

    let convertedAverage = defaultValue;

    if (storageCurrency !== selectedCurrencyRef.current && exchangeRate && exchangeRate > 0) {
      if (storageCurrency === "USD" && selectedCurrencyRef.current === "KRW") {
        convertedAverage = defaultValue * exchangeRate;
      } else if (storageCurrency === "KRW" && selectedCurrencyRef.current === "USD") {
        convertedAverage = defaultValue / exchangeRate;
      }
    }

    setDirectValue(formatAveragePriceInputValue(convertedAverage, selectedCurrencyRef.current));
    if (amount > 0) {
      setTotalValue(
        formatAveragePriceInputValue(convertedAverage * amount, selectedCurrencyRef.current)
      );
    }
  }, [defaultValue, amount, exchangeRate, storageCurrency]);

  const handleModeChange = (newMode: InputMode) => {
    if (newMode === mode) return;
    if (newMode === "TOTAL" && directValue) {
      setTotalValue(
        formatAveragePriceInputValue((parseFloat(directValue) || 0) * (amount || 0), selectedCurrency)
      );
    } else if (newMode === "DIRECT" && totalValue && amount > 0) {
      setDirectValue(
        formatAveragePriceInputValue((parseFloat(totalValue) || 0) / amount, selectedCurrency)
      );
    }
    setMode(newMode);
  };

  const handleCurrencyChange = (newCurrency: DisplayCurrency) => {
    if (newCurrency === selectedCurrency) return;

    const currentDirect = parseFloat(directValue) || 0;
    const currentTotal = parseFloat(totalValue) || 0;

    setDirectValue(
      currentDirect
        ? formatAveragePriceInputValue(
            convertValue(currentDirect, selectedCurrency, newCurrency),
            newCurrency
          )
        : ""
    );
    setTotalValue(
      currentTotal
        ? formatAveragePriceInputValue(
            convertValue(currentTotal, selectedCurrency, newCurrency),
            newCurrency
          )
        : ""
    );
    setSelectedCurrency(newCurrency);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-1">
          <label className="text-sm font-medium text-slate-300">
            {averagePriceLabel} ({selectedCurrency})
          </label>
          <Tooltip
            content={
              <>
                <p>
                  <strong className="text-white">{directModeLabel}</strong> : 단위 자산 기준 평균
                  매수 가격을 직접 입력하는 방식이에요.
                </p>
                <p>
                  <strong className="text-white">{totalModeLabel}</strong> : 총 매수금액을 입력하면
                  수량으로 나눠 평균 단가를 자동 계산해요.
                </p>
              </>
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0ZM8.94 6.94a.75.75 0 1 1-1.061-1.061 3 3 0 1 1 2.871 5.026v.345a.75.75 0 0 1-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 1 0 8.94 6.94ZM10 15a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                clipRule="evenodd"
              />
            </svg>
          </Tooltip>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {hasCurrencySwitch && (
            <div className="inline-flex rounded-lg bg-slate-800/80 border border-slate-700 p-1">
              {availableCurrencies.map((currency) => {
                const isSelected = selectedCurrency === currency;
                return (
                  <button
                    key={currency}
                    type="button"
                    onClick={() => handleCurrencyChange(currency)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      isSelected ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {currency}
                  </button>
                );
              })}
            </div>
          )}
          <div className="inline-flex rounded-lg bg-slate-800/80 border border-slate-700 p-1">
            <button
              type="button"
              onClick={() => handleModeChange("DIRECT")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                mode === "DIRECT" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {directModeLabel}
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("TOTAL")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                mode === "TOTAL" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {totalModeLabel}
            </button>
          </div>
        </div>
      </div>
      {mode === "DIRECT" ? (
        <input
          type="number"
          step={getAveragePriceInputStep(selectedCurrency)}
          placeholder={averagePricePlaceholder ?? `단위당 평균 매수 가격 (${selectedCurrency})`}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
          value={directValue}
          onChange={(e) =>
            setDirectValue(sanitizeAveragePriceInputValue(e.target.value, selectedCurrency))
          }
        />
      ) : (
        <>
          <input
            type="number"
            step={getAveragePriceInputStep(selectedCurrency)}
            placeholder={totalAmountPlaceholder ?? `총 매수금액 (${selectedCurrency})`}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
            value={totalValue}
            onChange={(e) =>
              setTotalValue(sanitizeAveragePriceInputValue(e.target.value, selectedCurrency))
            }
          />
          {amount > 0 && parseFloat(totalValue) > 0 && (
            <p className="text-xs text-slate-400 mt-1">
              1주 ≈{" "}
              {formatAveragePricePreviewValue((parseFloat(totalValue) || 0) / amount, selectedCurrency)}{" "}
              {selectedCurrency}
            </p>
          )}
        </>
      )}
      <input type="hidden" name={averagePriceName} value={avgPrice || ""} />
      <input type="hidden" name={totalAmountName} value={totalAmount || ""} />
      <input type="hidden" name={pricingInputModeName} value={mode} />
      <input type="hidden" name={pricingCurrencyName} value={selectedCurrency} />
      <p className="text-xs text-slate-500 mt-1">{helperText}</p>
    </div>
  );
}
