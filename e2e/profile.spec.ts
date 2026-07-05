import { test, expect } from "./fixtures";

test.describe("Profile", () => {
  test("loads profile page with user info", async ({ adminPage }) => {
    await adminPage.goto("/profile");
    await expect(
      adminPage.getByRole("heading", { name: /profile/i }),
    ).toBeVisible();

    const nameInput = adminPage.getByLabel(/^name$/i);
    await expect(nameInput).toHaveValue("System Admin");
    await expect(adminPage.getByText("system@example.com")).toBeVisible();
  });

  test("can update name", async ({ adminPage }) => {
    await adminPage.goto("/profile");
    const nameInput = adminPage.getByLabel(/^name$/i);
    await nameInput.clear();
    await nameInput.fill("Updated Admin");

    await adminPage.getByRole("button", { name: /save|сохранить/i }).click();

    await expect(
      adminPage.getByText(/updated|обновлено|saved|сохранено/i),
    ).toBeVisible();
  });

  test("can change password", async ({ adminPage }) => {
    await adminPage.goto("/profile");

    // Fill change password form
    await adminPage
      .getByLabel(/current password|текущий пароль/i)
      .fill("System123!");
    await adminPage
      .getByLabel(/^new password|новый пароль$/i)
      .fill("NewPass123!");
    await adminPage
      .getByLabel(/confirm password|подтвердите пароль/i)
      .fill("NewPass123!");

    await adminPage
      .getByRole("button", { name: /change password|изменить пароль/i })
      .click();

    await expect(
      adminPage.getByText(/updated|обновлено|changed|изменен/i),
    ).toBeVisible();
  });
});
