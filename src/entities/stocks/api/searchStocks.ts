import "server-only";

import { searchStocks as searchStocksFromRpc } from "./rpc";

export const searchStocks = async (query: string) => {
  return searchStocksFromRpc(query);
};
