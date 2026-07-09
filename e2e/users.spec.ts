import { test, expect } from "./fixtures";
import { createUserViaApi, fillUserForm } from "./helpers/users";

const NEW_USER = {
  name: "E2E Test User",
  email: `e2e-user-${Date.now()}@example.com`,
  password: "TestPass123!",
};

function actionsButton(row: any) {
  return row.locator("button").last();
}

test.describe("Users CRUD", () => {
  test("table renders with seeded users", async ({ adminPage }) => {
    await adminPage.goto("/admin/users");
    await expect(adminPage.getByText(/пользователи|users/i)).toBeVisible();
    await expect(adminPage.getByText("System Admin")).toBeVisible();
  });

  test("can create a user", async ({ adminPage }) => {
    await adminPage.goto("/admin/users");

    await adminPage
      .getByRole("button", { name: /создать пользователя|create user/i })
      .click();

    await adminPage.waitForSelector("role=dialog");
    await fillUserForm(adminPage, NEW_USER);

    await adminPage.getByRole("button", { name: /сохранить|save/i }).click();

    await expect(adminPage.getByText(NEW_USER.name)).toBeVisible();
  });

  test("can edit a user", async ({ adminPage }) => {
    const uniqueEmail = `e2e-edit-${Date.now()}@example.com`;
    await createUserViaApi(adminPage, {
      ...NEW_USER,
      email: uniqueEmail,
    });

    await adminPage.goto("/admin/users");

    const userRow = adminPage.getByText(uniqueEmail).locator("xpath=../..");
    await actionsButton(userRow).click();
    await adminPage
      .getByRole("menuitem", { name: /редактировать|edit/i })
      .click();

    await adminPage.waitForSelector("role=dialog");
    const nameInput = adminPage.getByLabel(/^(name|имя)$/i);
    await nameInput.clear();
    await nameInput.fill("Updated User");

    await adminPage.getByRole("button", { name: /сохранить|save/i }).click();

    await expect(adminPage.getByText("Updated User")).toBeVisible();
  });

  test("can delete a user", async ({ adminPage }) => {
    const uniqueEmail = `e2e-delete-${Date.now()}@example.com`;
    await createUserViaApi(adminPage, {
      ...NEW_USER,
      email: uniqueEmail,
    });

    await adminPage.goto("/admin/users");

    const userRow = adminPage.getByText(uniqueEmail).locator("xpath=../..");
    await actionsButton(userRow).click();
    await adminPage.getByRole("menuitem", { name: /удалить|delete/i }).click();

    await adminPage
      .getByRole("button", { name: /подтвердить|confirm/i })
      .click();

    await expect(adminPage.getByText(uniqueEmail)).not.toBeVisible();
  });
});
