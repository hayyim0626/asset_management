export const formatKrw = (amount: number) => {
  return (
    new Intl.NumberFormat("ko-KR", {
      maximumFractionDigits: 0
    }).format(amount) + "원"
  );
};

export const formatUsd = (amount: number, maxDigits: number = 8) => {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: maxDigits
  }).format(amount);
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
