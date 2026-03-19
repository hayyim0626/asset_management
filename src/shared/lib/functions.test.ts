import { formatKrw, formatUsd, wait } from "./functions";

describe("formatKrw", () => {
  it("숫자를 '원' 접미사와 함께 표현", () => {
    expect(formatKrw(1000)).toBe("1,000원");
  });

  it("세자리 단위로 쉼표 구분", () => {
    expect(formatKrw(1234567)).toBe("1,234,567원");
  });

  it("소수점을 반올림하여 정수로 만들기", () => {
    expect(formatKrw(1234.567)).toBe("1,235원");
  });

  it("0 처리", () => {
    expect(formatKrw(0)).toBe("0원");
  });

  it("음수 처리", () => {
    expect(formatKrw(-5000)).toBe("-5,000원");
  });
});

describe("formatUsd", () => {
  it("기본 최대 2자리 소수점", () => {
    expect(formatUsd(1234.56789012)).toBe("1,234.57");
  });

  it("사용자 지정 최대 소수점 자리수로 숫자 포맷", () => {
    expect(formatUsd(1234.56789, 2)).toBe("1,234.57");
  });

  it("소수점 없는 정수 처리", () => {
    expect(formatUsd(1000)).toBe("1,000");
  });

  it("maxDigits를 기반으로 초과 소수점 자르기", () => {
    expect(formatUsd(0.123456789, 5)).toBe("0.12346");
  });

  it("0 처리", () => {
    expect(formatUsd(0)).toBe("0");
  });

  it("음수 처리", () => {
    expect(formatUsd(-1234.56, 2)).toBe("-1,234.56");
  });

  it("매우 작은 숫자 처리", () => {
    expect(formatUsd(0.00000001, 8)).toBe("0.00000001");
  });
});

describe("wait", () => {
  it("지정된 타임아웃 후 resolve되어야 함", async () => {
    const startTime = Date.now();
    await wait(100);
    const endTime = Date.now();
    const elapsed = endTime - startTime;

    expect(elapsed).toBeGreaterThanOrEqual(98);
    expect(elapsed).toBeLessThan(103);
  });

  it("Promise 반환", () => {
    const result = wait(0);
    expect(result).toBeInstanceOf(Promise);
  });

  it("타임아웃이 0일 때 즉시 resolve 처리", async () => {
    const startTime = Date.now();
    await wait(0);
    const endTime = Date.now();
    const elapsed = endTime - startTime;

    expect(elapsed).toBeLessThan(10);
  });

  it("Promise.all", async () => {
    const startTime = Date.now();
    await Promise.all([wait(50), wait(50), wait(50)]);
    const endTime = Date.now();
    const elapsed = endTime - startTime;

    expect(elapsed).toBeGreaterThanOrEqual(45);
    expect(elapsed).toBeLessThan(68);
  });
});
