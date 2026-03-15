import { default_url } from "@/shared/api/consts";
import { env } from "@/shared/config/env";

interface EditAvgPriceData {
  categoryId: string;
  averagePrice: number | null;
}

export const editAveragePrice = async (data: EditAvgPriceData, accessToken: string) => {
  try {
    const res = await fetch(`${default_url}/update_average_price`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: env.SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        p_category_id: data.categoryId,
        p_average_price: data.averagePrice
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
