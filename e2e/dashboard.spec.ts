import { test, expect } from "./fixtures";

test.describe("Dashboard", () => {
  test("loads with welcome message and stats", async ({ adminPage }) => {
    await adminPage.goto("/dashboard");
    await expect(
      adminPage.getByRole("heading", { name: /dashboard/i }),
    ).toBeVisible();

    // Verify greeting includes user name
    await expect(adminPage.getByText(/system admin/i)).toBeVisible();

    // Check stat cards are visible in the grid
    const statCards = adminPage.locator("main .grid > div");
    await expect(statCards.first()).toBeVisible();

    // Admin user should see quick links section
    await expect(
      adminPage.getByText(/quick links|быстрые ссылки/i),
    ).toBeVisible();
  });
});
