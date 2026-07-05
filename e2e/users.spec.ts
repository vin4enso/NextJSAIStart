import { test, expect } from "./fixtures";
import { createUserViaApi, fillUserForm } from "./helpers/users";

const NEW_USER = {
  name: "E2E Test User",
  email: `e2e-user-${Date.now()}@example.com`,
  password: "TestPass123!",
};

test.describe("Users CRUD", () => {
  test("table renders with seeded users", async ({ adminPage }) => {
    await adminPage.goto("/admin/users");
    await expect(
      adminPage.getByRole("heading", { name: /users|пользователи/i }),
    ).toBeVisible();
    // System Admin should be visible in the table
    await expect(adminPage.getByText("System Admin")).toBeVisible();
  });

  test("can create a user", async ({ adminPage }) => {
    await adminPage.goto("/admin/users");

    // Click create button
    await adminPage
      .getByRole("button", { name: /create user|создать/i })
      .click();

    // Fill form — wait for dialog to appear
    await adminPage.waitForSelector("role=dialog");
    await fillUserForm(adminPage, NEW_USER);

    // Submit
    await adminPage.getByRole("button", { name: /save|сохранить/i }).click();

    // Verify user appears in table
    await expect(adminPage.getByText(NEW_USER.name)).toBeVisible();
  });

  test("can edit a user", async ({ adminPage }) => {
    // Create user first via API
    const uniqueEmail = `e2e-edit-${Date.now()}@example.com`;
    await createUserViaApi(adminPage, {
      ...NEW_USER,
      email: uniqueEmail,
    });

    await adminPage.goto("/admin/users");

    // Open dropdown menu for the created user
    const userRow = adminPage.getByText(uniqueEmail).locator("xpath=../..");
    await userRow.getByRole("button", { name: /more|open menu/i }).click();
    await adminPage.getByRole("menuitem", { name: /edit/i }).click();

    // Update name
    await adminPage.waitForSelector("role=dialog");
    const nameInput = adminPage.getByLabel(/^name$/i);
    await nameInput.clear();
    await nameInput.fill("Updated User");

    await adminPage.getByRole("button", { name: /save|сохранить/i }).click();

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
    await userRow.getByRole("button", { name: /more|open menu/i }).click();
    await adminPage.getByRole("menuitem", { name: /delete/i }).click();

    // Confirm deletion
    await adminPage.getByRole("button", { name: /confirm/i }).click();

    await expect(adminPage.getByText(uniqueEmail)).not.toBeVisible();
  });
});
