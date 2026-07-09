import { test, expect } from "./fixtures";
import { createRoleViaApi, fillRoleForm } from "./helpers/roles";

const NEW_ROLE = {
  name: `E2E-Role-${Date.now()}`,
  description: "E2E test role",
};

function actionsButton(row: any) {
  return row.locator("button").last();
}

test.describe("Roles CRUD", () => {
  test("table renders with seeded roles", async ({ adminPage }) => {
    await adminPage.goto("/admin/roles");
    await expect(adminPage.getByText(/роли|roles/i)).toBeVisible();
    await expect(adminPage.getByText(/системная|system/i)).toBeVisible();
  });

  test("can create a role", async ({ adminPage }) => {
    await adminPage.goto("/admin/roles");

    await adminPage
      .getByRole("button", { name: /создать роль|create role/i })
      .click();

    await adminPage.waitForSelector("role=dialog");
    await fillRoleForm(adminPage, NEW_ROLE);

    await adminPage.getByRole("button", { name: /сохранить|save/i }).click();

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
    await actionsButton(roleRow).click();
    await adminPage
      .getByRole("menuitem", { name: /редактировать|edit/i })
      .click();

    await adminPage.waitForSelector("role=dialog");
    const nameInput = adminPage.getByLabel(/^(name|название)$/i);
    await nameInput.clear();
    await nameInput.fill("Updated Role");

    await adminPage.getByRole("button", { name: /сохранить|save/i }).click();

    await expect(adminPage.getByText("Updated Role")).toBeVisible();
  });

  test("can delete a non-system role", async ({ adminPage }) => {
    const roleName = `E2E-Delete-${Date.now()}`;
    await createRoleViaApi(adminPage, { name: roleName });

    await adminPage.goto("/admin/roles");

    const roleRow = adminPage.getByText(roleName).locator("xpath=../..");
    await actionsButton(roleRow).click();
    await adminPage.getByRole("menuitem", { name: /удалить|delete/i }).click();

    await adminPage
      .getByRole("button", { name: /подтвердить|confirm/i })
      .click();

    await expect(adminPage.getByText(roleName)).not.toBeVisible();
  });

  test("cannot delete System role", async ({ adminPage }) => {
    await adminPage.goto("/admin/roles");

    const systemRow = adminPage
      .getByText(/системная|system/i)
      .locator("xpath=../..");
    await actionsButton(systemRow).click();

    const deleteItem = adminPage.getByRole("menuitem", {
      name: /удалить|delete/i,
    });
    await expect(deleteItem).toBeDisabled();
  });
});
