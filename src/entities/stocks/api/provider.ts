import "server-only";

import { env } from "@/shared/config/env";
import { SeedStockMarketProvider } from "./seedProvider";
import type { StockMarketProvider } from "./types";

export const getStockMarketProvider = (): StockMarketProvider => {
  switch (env.STOCK_PROVIDER) {
    case "seed":
    default:
      return new SeedStockMarketProvider();
  }
};
