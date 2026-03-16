import { NextRequest, NextResponse } from "next/server";
import { getServerEnv } from "@/shared/config/serverEnv";
import { syncMarketData } from "@/server/market-sync/sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const isAuthorized = (request: NextRequest) => {
  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${getServerEnv().CRON_SECRET}`;
};

const runSync = async (request: NextRequest) => {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await syncMarketData();

    return NextResponse.json({
      success: true,
      ...result
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Market sync failed"
      },
      { status: 500 }
    );
  }
};

export async function GET(request: NextRequest) {
  return runSync(request);
}

export async function POST(request: NextRequest) {
  return runSync(request);
}
