import { test, expect } from "./fixtures";

test.describe("Permissions", () => {
  test("loads and displays grouped permissions", async ({ adminPage }) => {
    await adminPage.goto("/admin/permissions");
    await expect(
      adminPage.getByRole("heading", { name: /разрешения|permissions/i }),
    ).toBeVisible();

    await expect(adminPage.getByText(/users|пользователи/i)).toBeVisible();
    await expect(adminPage.getByText(/roles|роли/i)).toBeVisible();
    await expect(adminPage.getByText(/admin|админ/i)).toBeVisible();
    await expect(adminPage.getByText(/profile|профиль/i)).toBeVisible();
  });
});
