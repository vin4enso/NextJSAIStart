import { test, expect } from "./fixtures";

test.describe("Error pages", () => {
  test("403 page is accessible", async ({ page }) => {
    await page.goto("/403");
    await expect(page.locator("h1")).toContainText("403");
    await expect(
      page.getByText(/do not have permission|forbidden/i),
    ).toBeVisible();
  });

  test("navigating to unknown route shows 404", async ({ page }) => {
    await page.goto("/nonexistent-route");
    await expect(page.locator("h1")).toContainText("404");
  });
});
