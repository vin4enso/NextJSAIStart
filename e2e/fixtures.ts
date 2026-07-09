import { test as base } from "@playwright/test";
import { login } from "./helpers/auth";

const SEED_EMAIL = "system@example.com";
const SEED_PASSWORD = "System123!";

export const test = base.extend<{
  adminPage: import("@playwright/test").Page;
}>({
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();
    await login(page, SEED_EMAIL, SEED_PASSWORD);
    await use(page);
    await context.close();
  },
});

export { expect } from "@playwright/test";
