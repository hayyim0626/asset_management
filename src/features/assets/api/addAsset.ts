import { default_url } from "@/shared/api/consts";
import { env } from "@/shared/config/env";

interface FormData {
  assetType: string;
  symbol: string;
  name?: string;
  amount: number;
  averagePrice?: number;
  currentPrice?: number;
  category?: string;
  categoryName?: string;
}

export const addAsset = async (formData: FormData, accessToken: string) => {
  try {
    const res = await fetch(`${default_url}/add_asset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: env.SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${accessToken}`,
        "Content-Profile": "public"
      },
      body: JSON.stringify({
        p_asset_type: formData.assetType,
        p_symbol: formData.symbol,
        p_amount: formData.amount,
        p_name: formData.name || null,
        p_average_price: formData.averagePrice || null,
        p_current_price: formData.currentPrice || 0,
        p_category: formData.category || "other",
        p_category_name: formData.categoryName || "기타"
      })
    });
    if (!res.ok) {
      const errorData = await res.json();
      return {
        success: false,
        error: errorData.message || `HTTP Error: ${res.status}`,
        data: null
      };
    }

    const result = await res.json();
    return result;
  } catch (e) {
    return {
      success: false,
      error: "네트워크 오류가 발생했습니다.",
      data: null
    };
  }
};
