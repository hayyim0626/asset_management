import { default_url } from "@/shared/api/consts";
import { env } from "@/shared/config/env";

export const getCoins = async () => {
  try {
    const res = await fetch(`${default_url}/coins`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        apikey: env.SUPABASE_ANON_KEY!
      }
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
