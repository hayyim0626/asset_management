import { getCoins } from "./getCoins";

describe("getCoins functional test", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("성공 응답을 반환한다", async () => {
    const payload = {
      success: true,
      data: [{ id: "bitcoin", symbol: "btc", name: "Bitcoin" }],
      error: null
    };

    jest.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      })
    );

    const result = await getCoins();

    expect(result).toEqual(payload);
  });

  it("HTTP 오류를 실패 응답으로 변환한다", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: "Server error" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
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
