import { test, expect } from "./fixtures";

test.describe("Navigation", () => {
  test("sidebar links navigate to correct pages", async ({ adminPage }) => {
    // Start from dashboard
    await adminPage.goto("/dashboard");

    // Click Dashboard link
    await adminPage.getByRole("link", { name: /^dashboard$/i }).click();
    await expect(adminPage).toHaveURL("/dashboard");

    // Click Profile link
    await adminPage.getByRole("link", { name: /^profile$/i }).click();
    await expect(adminPage).toHaveURL("/profile");

    // Expand Administration section if collapsed, then click Users
    await adminPage.getByRole("link", { name: /users/i }).click();
    await expect(adminPage).toHaveURL(/\/admin\/users/);

    // Click Roles
    await adminPage.getByRole("link", { name: /^roles$/i }).click();
    await expect(adminPage).toHaveURL(/\/admin\/roles/);

    // Click Permissions
    await adminPage.getByRole("link", { name: /permissions/i }).click();
    await expect(adminPage).toHaveURL(/\/admin\/permissions/);
  });
});
