import type { AssetType } from "@/entities/assets/types";
import type { AssetItem } from "@/entities/assets/api/types";

export const categoryNamePlaceholder = ({
  assetType,
  selectedCategory
}: {
  assetType: AssetType | null;
  selectedCategory: string;
}) => {
  switch (assetType) {
    case "cash":
      switch (selectedCategory) {
        case "house_deposit":
          return "부동산/내 월세 집";
        case "stock_account":
          return "삼성증권";
        case "crypto_account":
          return "업비트";
        default:
          return "국민은행";
      }
    case "crypto":
      switch (selectedCategory) {
        case "exchange":
          return "업비트";
        case "personal_wallet":
          return "메타마스크";
        case "hardware_wallet":
          return "JADE";
        case "crypto_account":
          return "업비트";
        case "defi":
          return "유니스왑";
        default:
          return "기타";
      }
    case "stocks":
      return "기타";
  }
};

export const descAssetItemByTotalKrw = (item: AssetItem[]) => {
  return item.sort((a, b) => b.value.krw - a.value.krw);
};
