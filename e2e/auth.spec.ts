import { test, expect } from "./fixtures";
import { login } from "./helpers/auth";

const TEST_EMAIL = `test-${Date.now()}@example.com`;
const TEST_PASSWORD = "TestPass123!";
const TEST_NAME = "Test User";

test.describe("Authentication flow", () => {
  test("register page is accessible", async ({ page }) => {
    await page.goto("/register");
    await expect(
      page.getByRole("heading", { name: /регистрация|sign up|register/i }),
    ).toBeVisible();
  });

  test("login page is accessible", async ({ page }) => {
    await page.goto("/login");
    await expect(
      page.getByRole("heading", { name: /вход|sign in|login/i }),
    ).toBeVisible();
  });

  test("user can register and is redirected to dashboard", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel(/имя|name/i).fill(TEST_NAME);
    await page.getByLabel(/^email$/i).fill(TEST_EMAIL);
    await page.getByLabel(/^(password|пароль)$/i).fill(TEST_PASSWORD);
    await page
      .getByRole("button", {
        name: /создать аккаунт|create account|регистрация|register/i,
      })
      .click();

    await page.waitForURL("/dashboard", { timeout: 10000 });
    await expect(page).toHaveURL("/dashboard");
  });

  test("register with existing email shows error", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel(/имя|name/i).fill("Duplicate");
    await page.getByLabel(/^email$/i).fill("system@example.com");
    await page.getByLabel(/^(password|пароль)$/i).fill(TEST_PASSWORD);
    await page
      .getByRole("button", {
        name: /создать аккаунт|create account|регистрация|register/i,
      })
      .click();

    await expect(
      page.getByText(/already exists|уже существует/i),
    ).toBeVisible();
  });

  test("login with invalid credentials shows error", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/^email$/i).fill("wrong@example.com");
    await page.getByLabel(/^(password|пароль)$/i).fill("WrongPass123!");
    await page.getByRole("button", { name: /войти|sign in|login/i }).click();

    await expect(page.getByText(/неверн|invalid/i)).toBeVisible();
  });

  test("user can login, logout, and login again", async ({ page }) => {
    await login(page, "system@example.com", "System123!");
    await expect(page).toHaveURL("/dashboard");

    const headerAvatar = page.getByRole("button", { name: /system admin/i });
    if (await headerAvatar.isVisible()) {
      await headerAvatar.click();
    }

    const signOutButton = page.getByRole("menuitem", {
      name: /выйти|sign out/i,
    });
    if (await signOutButton.isVisible()) {
      await signOutButton.click();
    }

    await page.waitForURL("/login", { timeout: 10000 });

    await login(page, "system@example.com", "System123!");
    await expect(page).toHaveURL("/dashboard");
  });

  test("forgot password page is accessible", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(
      page.getByRole("heading", {
        name: /забыли пароль|forgot password/i,
      }),
    ).toBeVisible();
  });
});
