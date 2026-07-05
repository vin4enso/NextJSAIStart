import { test, expect } from "./fixtures";
import { createRoleViaApi, fillRoleForm } from "./helpers/roles";

const NEW_ROLE = {
  name: `E2E-Role-${Date.now()}`,
  description: "E2E test role",
};

test.describe("Roles CRUD", () => {
  test("table renders with seeded roles", async ({ adminPage }) => {
    await adminPage.goto("/admin/roles");
    await expect(
      adminPage.getByRole("heading", { name: /roles|роли/i }),
    ).toBeVisible();
    await expect(adminPage.getByText("System")).toBeVisible();
  });

  test("can create a role", async ({ adminPage }) => {
    await adminPage.goto("/admin/roles");

    await adminPage
      .getByRole("button", { name: /create role|создать/i })
      .click();

    await adminPage.waitForSelector("role=dialog");
    await fillRoleForm(adminPage, NEW_ROLE);

    await adminPage.getByRole("button", { name: /save|сохранить/i }).click();

    await expect(adminPage.getByText(NEW_ROLE.name)).toBeVisible();
  });

  test("can edit a role", async ({ adminPage }) => {
    const roleName = `E2E-Edit-${Date.now()}`;
    await createRoleViaApi(adminPage, {
      name: roleName,
      description: "Before edit",
    });

    await adminPage.goto("/admin/roles");

    const roleRow = adminPage.getByText(roleName).locator("xpath=../..");
    await roleRow.getByRole("button", { name: /more|open menu/i }).click();
    await adminPage.getByRole("menuitem", { name: /edit/i }).click();

    await adminPage.waitForSelector("role=dialog");
    const nameInput = adminPage.getByLabel(/^name$/i);
    await nameInput.clear();
    await nameInput.fill("Updated Role");

    await adminPage.getByRole("button", { name: /save|сохранить/i }).click();

    await expect(adminPage.getByText("Updated Role")).toBeVisible();
  });

  test("can delete a non-system role", async ({ adminPage }) => {
    const roleName = `E2E-Delete-${Date.now()}`;
    await createRoleViaApi(adminPage, { name: roleName });

    await adminPage.goto("/admin/roles");

    const roleRow = adminPage.getByText(roleName).locator("xpath=../..");
    await roleRow.getByRole("button", { name: /more|open menu/i }).click();
    await adminPage.getByRole("menuitem", { name: /delete/i }).click();

    await adminPage.getByRole("button", { name: /confirm/i }).click();

    await expect(adminPage.getByText(roleName)).not.toBeVisible();
  });

  test("cannot delete System role", async ({ adminPage }) => {
    await adminPage.goto("/admin/roles");

    const systemRow = adminPage.getByText("System").locator("xpath=../..");
    await systemRow.getByRole("button", { name: /more|open menu/i }).click();

    const deleteItem = adminPage.getByRole("menuitem", { name: /delete/i });
    await expect(deleteItem).toBeDisabled();
  });
});
