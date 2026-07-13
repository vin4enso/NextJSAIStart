import { test, expect } from "./fixtures";
import { createPageViaApi, fillPageForm } from "./helpers/pages";

const NEW_PAGE = {
  title: `E2E-Page-${Date.now()}`,
  slug: `e2e-page-${Date.now()}`,
};

function actionsButton(row: any) {
  return row.locator("button").last();
}

test.describe("Pages CRUD", () => {
  test("table renders with seeded pages", async ({ adminPage }) => {
    await adminPage.goto("/admin/pages");
    await expect(adminPage.getByText(/pages|страницы/i)).toBeVisible();
    await expect(adminPage.getByText("Home")).toBeVisible();
  });

  test("can create a page", async ({ adminPage }) => {
    await adminPage.goto("/admin/pages");

    await adminPage
      .getByRole("button", { name: /create page|создать страницу/i })
      .click();

    await adminPage.waitForSelector("role=dialog");
    await fillPageForm(adminPage, NEW_PAGE);

    await adminPage.getByRole("button", { name: /save|сохранить/i }).click();

    await expect(adminPage.getByText(NEW_PAGE.title)).toBeVisible();
  });

  test("can edit a page", async ({ adminPage }) => {
    const pageName = `E2E-Edit-${Date.now()}`;
    const pageSlug = `e2e-edit-${Date.now()}`;
    await createPageViaApi(adminPage, {
      title: pageName,
      slug: pageSlug,
    });

    await adminPage.goto("/admin/pages");

    const pageRow = adminPage.getByText(pageName).locator("xpath=../..");
    await actionsButton(pageRow).click();
    await adminPage
      .getByRole("menuitem", { name: /edit|редактировать/i })
      .click();

    await adminPage.waitForSelector("role=dialog");
    const nameInput = adminPage.getByLabel(/^(title|название)$/i);
    await nameInput.clear();
    await nameInput.fill("Updated Page");

    await adminPage.getByRole("button", { name: /save|сохранить/i }).click();

    await expect(adminPage.getByText("Updated Page")).toBeVisible();
  });

  test("can delete a non-home page", async ({ adminPage }) => {
    const pageName = `E2E-Delete-${Date.now()}`;
    const pageSlug = `e2e-delete-${Date.now()}`;
    await createPageViaApi(adminPage, { title: pageName, slug: pageSlug });

    await adminPage.goto("/admin/pages");

    const pageRow = adminPage.getByText(pageName).locator("xpath=../..");
    await actionsButton(pageRow).click();
    await adminPage.getByRole("menuitem", { name: /delete|удалить/i }).click();

    await adminPage
      .getByRole("button", { name: /confirm|подтвердить/i })
      .click();

    await expect(adminPage.getByText(pageName)).not.toBeVisible();
  });

  test("cannot delete Home page", async ({ adminPage }) => {
    await adminPage.goto("/admin/pages");

    const homeRow = adminPage.getByText("Home").locator("xpath=../..");
    await actionsButton(homeRow).click();

    const deleteItem = adminPage.getByRole("menuitem", {
      name: /delete|удалить/i,
    });
    await expect(deleteItem).toBeDisabled();
  });
});
