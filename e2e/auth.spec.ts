import { test, expect } from "./fixtures";
import { login } from "./helpers/auth";

const TEST_EMAIL = `test-${Date.now()}@example.com`;
const TEST_PASSWORD = "TestPass123!";
const TEST_NAME = "Test User";

test.describe("Authentication flow", () => {
  test("register page is accessible", async ({ page }) => {
    await page.goto("/register");
    await expect(
      page.getByRole("heading", { name: /sign up|регистрация|register/i }),
    ).toBeVisible();
  });

  test("login page is accessible", async ({ page }) => {
    await page.goto("/login");
    await expect(
      page.getByRole("heading", { name: /sign in|вход|login/i }),
    ).toBeVisible();
  });

  test("user can register and is redirected to dashboard", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel(/name|имя/i).fill(TEST_NAME);
    await page.getByLabel(/^email$/i).fill(TEST_EMAIL);
    await page.getByLabel(/^password$/i).fill(TEST_PASSWORD);
    await page
      .getByRole("button", { name: /create account|создать аккаунт|register/i })
      .click();

    await page.waitForURL("/dashboard", { timeout: 10000 });
    await expect(page).toHaveURL("/dashboard");
  });

  test("register with existing email shows error", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel(/name|имя/i).fill("Duplicate");
    await page.getByLabel(/^email$/i).fill("system@example.com");
    await page.getByLabel(/^password$/i).fill(TEST_PASSWORD);
    await page
      .getByRole("button", { name: /create account|создать аккаунт|register/i })
      .click();

    await expect(
      page.getByText(/already exists|уже существует/i),
    ).toBeVisible();
  });

  test("login with invalid credentials shows error", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/^email$/i).fill("wrong@example.com");
    await page.getByLabel(/^password$/i).fill("WrongPass123!");
    await page.getByRole("button", { name: /sign in|войти|login/i }).click();

    await expect(page.getByText(/invalid|неверн/i)).toBeVisible();
  });

  test("user can login, logout, and login again", async ({ page }) => {
    await login(page, "system@example.com", "System123!");
    await expect(page).toHaveURL("/dashboard");

    // Find and click the user dropdown in the header
    const headerAvatar = page.getByRole("button", { name: /system admin/i });
    if (await headerAvatar.isVisible()) {
      await headerAvatar.click();
    }

    // Try to find the sign out button
    const signOutButton = page.getByRole("menuitem", {
      name: /sign out|выйти/i,
    });
    if (await signOutButton.isVisible()) {
      await signOutButton.click();
    }

    await page.waitForURL("/login", { timeout: 10000 });

    // Login again
    await login(page, "system@example.com", "System123!");
    await expect(page).toHaveURL("/dashboard");
  });

  test("forgot password page is accessible", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(
      page.getByRole("heading", {
        name: /forgot password|забыли пароль/i,
      }),
    ).toBeVisible();
  });
});
