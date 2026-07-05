import { test, expect } from "./fixtures";

test.describe("Permissions", () => {
  test("loads and displays grouped permissions", async ({ adminPage }) => {
    await adminPage.goto("/admin/permissions");
    await expect(
      adminPage.getByRole("heading", { name: /permissions|разрешения/i }),
    ).toBeVisible();

    // Check that permission groups are rendered
    await expect(adminPage.getByText(/users/i)).toBeVisible();
    await expect(adminPage.getByText(/roles/i)).toBeVisible();
    await expect(adminPage.getByText(/admin/i)).toBeVisible();
    await expect(adminPage.getByText(/profile/i)).toBeVisible();
  });
});
