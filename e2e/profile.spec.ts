import { test, expect } from "./fixtures";

test.describe("Profile", () => {
  test("loads profile page with user info", async ({ adminPage }) => {
    await adminPage.goto("/profile");
    await expect(adminPage.getByText(/профиль|profile/i)).toBeVisible();

    const nameInput = adminPage.getByLabel(/^(name|имя)$/i);
    await expect(nameInput).toHaveValue("System Admin");
    await expect(adminPage.getByText("system@example.com")).toBeVisible();
  });

  test("can update name", async ({ adminPage }) => {
    await adminPage.goto("/profile");
    const nameInput = adminPage.getByLabel(/^(name|имя)$/i);
    await nameInput.clear();
    await nameInput.fill("Updated Admin");

    await adminPage.getByRole("button", { name: /сохранить|save/i }).click();

    await expect(
      adminPage.getByText(/обновлено|updated|сохранено|saved/i),
    ).toBeVisible();
  });

  test("can change password", async ({ adminPage }) => {
    await adminPage.goto("/profile");

    await adminPage
      .getByLabel(/текущий пароль|current password/i)
      .fill("System123!");
    await adminPage
      .getByLabel(/^(new password|новый пароль)$/i)
      .fill("NewPass123!");
    await adminPage
      .getByLabel(/confirm password|подтвердите пароль/i)
      .fill("NewPass123!");

    await adminPage
      .getByRole("button", { name: /сменить пароль|change password/i })
      .click();

    await expect(
      adminPage.getByText(/обновлено|изменен|updated|changed|изменён/i),
    ).toBeVisible();
  });
});
