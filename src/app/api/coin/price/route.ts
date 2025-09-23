import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/shared/config/env";

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbols = searchParams.get("symbols");

    let query = supabase
      .from("coin_price")
      .select("*")
      .order("updated_at", { ascending: false });

    if (symbols) {
      const symbolList = symbols.split(",").map((s) => s.trim().toUpperCase());
      query = query.in("symbol", symbolList);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch crypto prices" },
        { status: 500 }
      );
    }

    // 데이터를 심볼을 키로 하는 객체로 변환
    const pricesMap = data?.reduce((acc, coin) => {
      acc[coin.symbol] = {
        symbol: coin.symbol,
        name: coin.name,
        price: parseFloat(coin.price),
        updatedAt: coin.updated_at
      };
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      success: true,
      data: pricesMap,
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to fetch coin price" },
      { status: 500 }
    );
  }
}
