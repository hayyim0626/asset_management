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
