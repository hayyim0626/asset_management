export const formatKrw = (amount: number) => {
  return (
    new Intl.NumberFormat("ko-KR", {
      maximumFractionDigits: 0
    }).format(amount) + "원"
  );
};
