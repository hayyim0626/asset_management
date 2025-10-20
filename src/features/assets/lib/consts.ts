import type { AssetType } from "@/entities/assets/types";
import type { FormState } from "@/shared/types";

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

export const INITIAL_STATE: FormState = {
  success: false,
  error: null,
  message: null
};
