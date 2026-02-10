import { expect, test } from "@playwright/test";

test("비로그인 사용자는 랜딩 페이지를 본다", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("button", { name: "구글 로그인" }).first()).toBeVisible();
  await expect(page.getByText("지금 무료로 시작해보세요!")).toBeVisible();
});
