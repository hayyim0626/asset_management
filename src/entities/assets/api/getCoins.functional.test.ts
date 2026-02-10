import { http, HttpResponse } from "msw";

import { default_url } from "@/shared/api/consts";
import { server } from "@/shared/test/msw/server";

import { getCoins } from "./getCoins";

describe("getCoins functional test", () => {
  it("성공 응답을 반환한다", async () => {
    const payload = {
      success: true,
      data: [{ id: "bitcoin", symbol: "btc", name: "Bitcoin" }],
      error: null
    };

    server.use(
      http.get(`${default_url}/coins`, () => {
        return HttpResponse.json(payload);
      })
    );

    const result = await getCoins();

    expect(result).toEqual(payload);
  });

  it("HTTP 오류를 실패 응답으로 변환한다", async () => {
    server.use(
      http.get(`${default_url}/coins`, () => {
        return HttpResponse.json({ message: "Server error" }, { status: 500 });
      })
    );

    const result = await getCoins();

    expect(result).toEqual({
      success: false,
      error: "Server error",
      data: null
    });
  });
});
