import { Page } from "@playwright/test";

export interface CreateUserData {
  name: string;
  email: string;
  password?: string;
  isActive?: boolean;
  roleIds?: string[];
}

export async function createUserViaApi(
  page: Page,
  data: CreateUserData,
): Promise<{ id: string }> {
  const response = await page.request.post("/api/users", {
    data: {
      name: data.name,
      email: data.email,
      password: data.password ?? "TestPass123!",
      isActive: data.isActive ?? true,
      roleIds: data.roleIds ?? [],
    },
  });
  const json = await response.json();
  return json.data;
}

export async function fillUserForm(page: Page, data: Partial<CreateUserData>) {
  if (data.name) {
    await page.getByLabel(/^name$/i).fill(data.name);
  }
  if (data.email) {
    await page.getByLabel(/^email$/i).fill(data.email);
  }
  if (data.password) {
    await page.getByLabel(/^password$/i).fill(data.password);
  }
}
