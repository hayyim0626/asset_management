export const formatKrw = (amount: number) => {
  return (
    new Intl.NumberFormat("ko-KR", {
      maximumFractionDigits: 0
    }).format(amount) + "원"
  );
};

export const formatUsd = (amount: number, maxDigits: number = 2) => {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: maxDigits
  }).format(amount);
};

export const formatUsdCurrency = (amount: number, maxDigits: number = 2) => {
  return `$${formatUsd(amount, maxDigits)}`;
};

export const formatDateTimeKorean = (value: string | null | undefined) => {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("ko-KR", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
};

export const wait = (timeout: number) => {
  return new Promise((resolve) => setTimeout(resolve, timeout));
};

export const formatProfitLossPercent = (percent: number): string => {
  const sign = percent > 0 ? "+" : "";
  return `${sign}${percent.toFixed(2)}%`;
};

export const formatProfitLossKrw = (amount: number): string => {
  const sign = amount > 0 ? "+" : "";
  const formatted = new Intl.NumberFormat("ko-KR", {
    maximumFractionDigits: 0
  }).format(amount);
  return `${sign}${formatted}원`;
};

export const formatProfitLossUsd = (amount: number): string => {
  const sign = amount > 0 ? "+" : amount < 0 ? "-" : "";
  return `${sign}$${formatUsd(Math.abs(amount), 2)}`;
};
