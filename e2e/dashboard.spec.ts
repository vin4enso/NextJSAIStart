import { test, expect } from "./fixtures";

test.describe("Dashboard", () => {
  test("loads with welcome message and stats", async ({ adminPage }) => {
    await adminPage.goto("/dashboard");
    await expect(adminPage.getByText(/дашборд|dashboard/i)).toBeVisible();

    await expect(adminPage.getByText(/system admin/i)).toBeVisible();

    const statCards = adminPage.locator("main .grid > div");
    await expect(statCards.first()).toBeVisible();

    await expect(
      adminPage.getByText(/быстрые ссылки|quick links/i),
    ).toBeVisible();
  });
});
