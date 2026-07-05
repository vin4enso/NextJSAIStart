import { test, expect } from "./fixtures";
import { createUserViaApi } from "./helpers/users";

test.describe("Search and Sort", () => {
  test("search filters users table", async ({ adminPage }) => {
    const uniqueName = `Zebra-${Date.now()}`;
    await createUserViaApi(adminPage, {
      name: uniqueName,
      email: `${uniqueName.toLowerCase()}@example.com`,
    });

    await adminPage.goto("/admin/users");

    const searchInput = adminPage.getByPlaceholder(/search|поиск/i);
    await searchInput.fill(uniqueName);

    await expect(adminPage.getByText(uniqueName)).toBeVisible();
    await expect(adminPage.getByText("System Admin")).not.toBeVisible();
  });

  test("clearing search resets results", async ({ adminPage }) => {
    await adminPage.goto("/admin/users");

    const searchInput = adminPage.getByPlaceholder(/search|поиск/i);
    await searchInput.fill("NonexistentUserXYZ");

    await expect(
      adminPage.getByText(/no results|нет результатов/i),
    ).toBeVisible();

    await searchInput.clear();

    await expect(adminPage.getByText("System Admin")).toBeVisible();
  });
});
