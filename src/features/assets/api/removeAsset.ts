import { default_url } from "@/shared/api/consts";
import { env } from "@/shared/config/env";

interface FormData {
  assetType: string;
  symbol: string;
  amount: number;
}

export const removeAsset = async (formData: FormData, accessToken: string) => {
  try {
    const requestBody = {
      p_asset_type: formData.assetType,
      p_symbol: formData.symbol,
      p_amount: formData.amount
    };

    const res = await fetch(`${default_url}/remove_asset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: env.SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify(requestBody)
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
