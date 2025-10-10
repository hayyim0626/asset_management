import type { AssetType } from "@/entities/assets/types";

export const ASSET_LIST: {
  name: string;
  emoji: string;
  value: AssetType;
}[] = [
  {
    name: "코인",
    emoji: "₿",
    value: "crypto"
  },
  {
    name: "주식",
    emoji: "📈",
    value: "stocks"
  },
  {
    name: "현금",
    emoji: "💰",
    value: "cash"
  }
];
