import { NextRequest, NextResponse } from "next/server";
import { searchStocks } from "@/entities/stocks/api";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";

  try {
    const data = await searchStocks(query);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "종목 검색에 실패했습니다.",
        data: []
      },
      { status: 500 }
    );
  }
}
