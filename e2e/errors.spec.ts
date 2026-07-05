import { test, expect } from "./fixtures";

test.describe("Error pages", () => {
  test("403 page is accessible", async ({ page }) => {
    await page.goto("/403");
    await expect(page.getByText("403")).toBeVisible();
    await expect(
      page.getByText(/доступ запрещён|do not have permission|forbidden/i),
    ).toBeVisible();
  });

  test("navigating to unknown route shows 404", async ({ page }) => {
    await page.goto("/nonexistent-route");
    await expect(page.getByText("404")).toBeVisible();
  });
});
