import { fireEvent, render, screen } from "@testing-library/react";
import {
  AveragePriceInput,
  formatAveragePriceInputValue,
  sanitizeAveragePriceInputValue
} from "./AveragePriceInput";

describe("AveragePriceInput", () => {
  it("총액 모드에서 1주당 가격 모드로 전환할 때 USD 값을 소수점 둘째 자리까지만 표시한다", () => {
    render(
      <AveragePriceInput
        amount={3}
        currencyCode="USD"
        storageCurrency="USD"
        availableCurrencies={["USD", "KRW"]}
        directModeLabel="1주당 가격"
        averagePricePlaceholder="1주당 평균 매수 가격"
        totalAmountPlaceholder="총 매수금액"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "총액으로 계산" }));
    fireEvent.change(screen.getByPlaceholderText("총 매수금액"), {
      target: { value: "100" }
    });
    fireEvent.click(screen.getByRole("button", { name: "1주당 가격" }));

    expect(screen.getByPlaceholderText("1주당 평균 매수 가격")).toHaveValue(33.33);
  });

  it("KRW 입력은 소수점 없이 유지한다", () => {
    render(<AveragePriceInput amount={1} currencyCode="KRW" totalAmountPlaceholder="총 투자금액" />);

    fireEvent.click(screen.getByRole("button", { name: "총액으로 계산" }));
    fireEvent.change(screen.getByPlaceholderText("총 투자금액"), {
      target: { value: "12345.67" }
    });

    expect(screen.getByPlaceholderText("총 투자금액")).toHaveValue(12345);
  });

  it("KRW 총액 미리보기에는 천 단위 구분자를 표시한다", () => {
    render(<AveragePriceInput amount={3} currencyCode="KRW" totalAmountPlaceholder="총 투자금액" />);

    fireEvent.click(screen.getByRole("button", { name: "총액으로 계산" }));
    fireEvent.change(screen.getByPlaceholderText("총 투자금액"), {
      target: { value: "82569" }
    });

    expect(screen.getByText("1주 ≈ 27,523 KRW")).toBeInTheDocument();
  });
});

describe("AveragePriceInput formatting helpers", () => {
  it("USD 계산값은 소수점 둘째 자리까지만 포맷한다", () => {
    expect(formatAveragePriceInputValue(33.3333333333333, "USD")).toBe("33.33");
  });

  it("입력값 sanitizing 시 KRW는 소수점을 제거하고 USD는 둘째 자리까지만 허용한다", () => {
    expect(sanitizeAveragePriceInputValue("12345.67", "KRW")).toBe("12345");
    expect(sanitizeAveragePriceInputValue("123.4567", "USD")).toBe("123.45");
  });
});
