import { test, expect } from "./fixtures";
import { createSectionViaApi, fillSectionForm } from "./helpers/sections";

const NEW_SECTION = {
  name: `E2E-Section-${Date.now()}`,
  slug: `e2e-section-${Date.now()}`,
};

function actionsButton(row: any) {
  return row.locator("button").last();
}

test.describe("Sections CRUD", () => {
  test("table renders with seeded sections", async ({ adminPage }) => {
    await adminPage.goto("/admin/sections");
    await expect(adminPage.getByText(/sections|разделы/i)).toBeVisible();
    await expect(adminPage.getByText("About")).toBeVisible();
  });

  test("can create a section", async ({ adminPage }) => {
    await adminPage.goto("/admin/sections");

    await adminPage
      .getByRole("button", { name: /create section|создать раздел/i })
      .click();

    await adminPage.waitForSelector("role=dialog");
    await fillSectionForm(adminPage, NEW_SECTION);

    await adminPage.getByRole("button", { name: /save|сохранить/i }).click();

    await expect(adminPage.getByText(NEW_SECTION.name)).toBeVisible();
  });

  test("can edit a section", async ({ adminPage }) => {
    const sectionName = `E2E-Edit-${Date.now()}`;
    const sectionSlug = `e2e-edit-${Date.now()}`;
    await createSectionViaApi(adminPage, {
      name: sectionName,
      slug: sectionSlug,
    });

    await adminPage.goto("/admin/sections");

    const sectionRow = adminPage.getByText(sectionName).locator("xpath=../..");
    await actionsButton(sectionRow).click();
    await adminPage
      .getByRole("menuitem", { name: /edit|редактировать/i })
      .click();

    await adminPage.waitForSelector("role=dialog");
    const nameInput = adminPage.getByLabel(/^(name|название)$/i);
    await nameInput.clear();
    await nameInput.fill("Updated Section");

    await adminPage.getByRole("button", { name: /save|сохранить/i }).click();

    await expect(adminPage.getByText("Updated Section")).toBeVisible();
  });

  test("cannot delete a section with existing pages", async ({ adminPage }) => {
    await adminPage.goto("/admin/sections");

    const aboutSection = adminPage.getByText("About").locator("xpath=../..");
    await actionsButton(aboutSection).click();
    await adminPage.getByRole("menuitem", { name: /delete|удалить/i }).click();

    await adminPage
      .getByRole("button", { name: /confirm|подтвердить/i })
      .click();

    await expect(adminPage.getByText("About")).toBeVisible();
  });

  test("can delete a section without pages", async ({ adminPage }) => {
    const sectionName = `E2E-Delete-${Date.now()}`;
    const sectionSlug = `e2e-delete-${Date.now()}`;
    await createSectionViaApi(adminPage, {
      name: sectionName,
      slug: sectionSlug,
    });

    await adminPage.goto("/admin/sections");

    const sectionRow = adminPage.getByText(sectionName).locator("xpath=../..");
    await actionsButton(sectionRow).click();
    await adminPage.getByRole("menuitem", { name: /delete|удалить/i }).click();

    await adminPage
      .getByRole("button", { name: /confirm|подтвердить/i })
      .click();

    await expect(adminPage.getByText(sectionName)).not.toBeVisible();
  });
});
