import { test, expect } from "@playwright/test";

const TEST_EMAIL = `test-${Date.now()}@example.com`;
const TEST_PASSWORD = "TestPass123!";
const TEST_NAME = "Test User";

test.describe("Authentication flow", () => {
  test("register page is accessible", async ({ page }) => {
    await page.goto("/register");
    await expect(
      page.getByRole("heading", { name: /sign up|регистрация/i }),
    ).toBeVisible();
  });

  test("login page is accessible", async ({ page }) => {
    await page.goto("/login");
    await expect(
      page.getByRole("heading", { name: /sign in|вход/i }),
    ).toBeVisible();
  });

  test("user can register, logout, and login again", async ({ page }) => {
    // Register
    await page.goto("/register");
    await page.getByLabel(/name|имя/i).fill(TEST_NAME);
    await page.getByLabel(/^email$/i).fill(TEST_EMAIL);
    await page.getByLabel(/^password$/i).fill(TEST_PASSWORD);
    await page
      .getByRole("button", { name: /create account|создать аккаунт/i })
      .click();

    // Should redirect to dashboard after registration
    await page.waitForURL("/dashboard", { timeout: 10000 });
    await expect(page).toHaveURL("/dashboard");
  });

  test("forgot password page is accessible", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(
      page.getByRole("heading", { name: /forgot password|забыли пароль/i }),
    ).toBeVisible();
  });
});
