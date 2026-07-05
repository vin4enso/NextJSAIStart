import { Page } from "@playwright/test";

export interface CreateRoleData {
  name: string;
  description?: string;
  permissionIds?: string[];
}

export async function createRoleViaApi(
  page: Page,
  data: CreateRoleData,
): Promise<{ id: string }> {
  const response = await page.request.post("/api/roles", {
    data: {
      name: data.name,
      description: data.description ?? "",
      permissionIds: data.permissionIds ?? [],
    },
  });
  const json = await response.json();
  return json.data;
}

export async function fillRoleForm(page: Page, data: Partial<CreateRoleData>) {
  if (data.name) {
    await page.getByLabel(/^name$/i).fill(data.name);
  }
  if (data.description !== undefined) {
    await page.getByLabel(/^description$/i).fill(data.description);
  }
}
