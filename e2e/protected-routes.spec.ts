import { test, expect } from "@playwright/test";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/profile",
  "/admin",
  "/admin/users",
  "/admin/roles",
  "/admin/permissions",
  "/admin/sections",
  "/admin/pages",
];

test.describe("Protected routes redirect to login", () => {
  for (const route of PROTECTED_ROUTES) {
    test(`redirects ${route} to /login with callbackUrl`, async ({ page }) => {
      await page.goto(route);

      await page.waitForURL(/\/login/, { timeout: 10000 });
      expect(page.url()).toContain("/login");
      expect(page.url()).toContain(`callbackUrl=${encodeURIComponent(route)}`);
    });
  }
});
