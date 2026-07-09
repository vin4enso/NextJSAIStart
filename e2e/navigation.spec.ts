import { test, expect } from "./fixtures";

test.describe("Navigation", () => {
  test("sidebar links navigate to correct pages", async ({ adminPage }) => {
    await adminPage.goto("/dashboard");

    await adminPage
      .getByRole("link", { name: /^дашборд$|^dashboard$/i })
      .click();
    await expect(adminPage).toHaveURL("/dashboard");

    await adminPage.getByRole("link", { name: /^профиль$|^profile$/i }).click();
    await expect(adminPage).toHaveURL("/profile");

    await adminPage.getByRole("link", { name: /пользователи|users/i }).click();
    await expect(adminPage).toHaveURL(/\/admin\/users/);

    await adminPage.getByRole("link", { name: /^роли$|^roles$/i }).click();
    await expect(adminPage).toHaveURL(/\/admin\/roles/);

    await adminPage
      .getByRole("link", { name: /разрешения|permissions/i })
      .click();
    await expect(adminPage).toHaveURL(/\/admin\/permissions/);
  });
});
