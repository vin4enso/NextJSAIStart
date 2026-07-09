import { test, expect } from "./fixtures";
import { login } from "./helpers/auth";

const TEST_EMAIL = `test-${Date.now()}@example.com`;
const TEST_PASSWORD = "TestPass123!";
const TEST_NAME = "Test User";

test.describe("Authentication flow", () => {
  test("register page is accessible", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByTestId("register-form")).toBeVisible();
  });

  test("login page is accessible", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByTestId("login-form")).toBeVisible();
  });

  test("user can register and is redirected to dashboard", async ({ page }) => {
    await page.goto("/register");
    await page.getByTestId("register-name").fill(TEST_NAME);
    await page.getByTestId("register-email").fill(TEST_EMAIL);
    await page.getByTestId("register-password").fill(TEST_PASSWORD);
    await page.getByTestId("register-submit").click();

    await page.waitForURL("/dashboard", { timeout: 10000 });
    await expect(page).toHaveURL("/dashboard");
  });

  test("register with existing email shows error", async ({ page }) => {
    await page.goto("/register");
    await page.getByTestId("register-name").fill("Duplicate");
    await page.getByTestId("register-email").fill("system@example.com");
    await page.getByTestId("register-password").fill(TEST_PASSWORD);
    await page.getByTestId("register-submit").click();

    await expect(page.getByTestId("register-error")).toBeVisible();
  });

  test("login with invalid credentials shows error", async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("login-email").fill("wrong@example.com");
    await page.getByTestId("login-password").fill("WrongPass123!");
    await page.getByTestId("login-submit").click();

    await expect(page.getByTestId("login-error")).toBeVisible();
  });

  test("user can login, logout, and login again", async ({ page }) => {
    await login(page, "system@example.com", "System123!");
    await expect(page).toHaveURL("/dashboard");

    await page.getByTestId("user-menu-trigger").click();

    await page.getByTestId("sign-out").click();

    await page.waitForURL("/login", { timeout: 10000 });

    await login(page, "system@example.com", "System123!");
    await expect(page).toHaveURL("/dashboard");
  });

  test("forgot password page is accessible", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.getByTestId("forgot-password-form")).toBeVisible();
  });
});
