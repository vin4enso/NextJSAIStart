import { test, expect } from "./fixtures";
import { createPageViaApi, fillPageForm } from "./helpers/pages";

const NEW_PAGE = {
  title: `E2E-Page-${Date.now()}`,
  slug: `e2e-page-${Date.now()}`,
};

test.describe("Pages CRUD", () => {
  test("table renders with seeded pages", async ({ adminPage }) => {
    await adminPage.goto("/admin/pages");
    await expect(adminPage.getByText(/pages|страницы/i)).toBeVisible();
    await expect(
      adminPage.getByTestId("page-title").filter({ hasText: "Home" }),
    ).toBeVisible();
  });

  test("can create a page", async ({ adminPage }) => {
    await adminPage.goto("/admin/pages");

    await adminPage.getByTestId("page-create-btn").click();

    await adminPage.waitForSelector("role=dialog");
    await fillPageForm(adminPage, NEW_PAGE);

    await adminPage.getByTestId("page-form-submit").click();

    await expect(
      adminPage.getByTestId("page-title").filter({ hasText: NEW_PAGE.title }),
    ).toBeVisible();
  });

  test("can edit a page", async ({ adminPage }) => {
    const pageName = `E2E-Edit-${Date.now()}`;
    const pageSlug = `e2e-edit-${Date.now()}`;
    await createPageViaApi(adminPage, {
      title: pageName,
      slug: pageSlug,
    });

    await adminPage.goto("/admin/pages");

    const pageRow = adminPage
      .getByTestId("page-title")
      .filter({ hasText: pageName })
      .locator("xpath=../..");
    await pageRow.getByTestId("page-actions-trigger").click();
    await adminPage.getByTestId("page-action-edit").click();

    await adminPage.waitForSelector("role=dialog");
    const nameInput = adminPage.getByTestId("page-form-title");
    await nameInput.clear();
    await nameInput.fill("Updated Page");

    await adminPage.getByTestId("page-form-submit").click();

    await expect(
      adminPage.getByTestId("page-title").filter({ hasText: "Updated Page" }),
    ).toBeVisible();
  });

  test("can delete a non-home page", async ({ adminPage }) => {
    const pageName = `E2E-Delete-${Date.now()}`;
    const pageSlug = `e2e-delete-${Date.now()}`;
    await createPageViaApi(adminPage, { title: pageName, slug: pageSlug });

    await adminPage.goto("/admin/pages");

    const pageRow = adminPage
      .getByTestId("page-title")
      .filter({ hasText: pageName })
      .locator("xpath=../..");
    await pageRow.getByTestId("page-actions-trigger").click();
    await adminPage.getByTestId("page-action-delete").click();

    await adminPage.getByTestId("confirm-delete").click();

    await expect(
      adminPage.getByTestId("page-title").filter({ hasText: pageName }),
    ).not.toBeVisible();
  });

  test("cannot delete Home page", async ({ adminPage }) => {
    await adminPage.goto("/admin/pages");

    const homeRow = adminPage
      .getByTestId("page-title")
      .filter({ hasText: "Home" })
      .locator("xpath=../..");
    await homeRow.getByTestId("page-actions-trigger").click();

    await expect(adminPage.getByTestId("page-action-delete")).toHaveCount(0);
  });
});
