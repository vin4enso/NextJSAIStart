import { Page } from "@playwright/test";

export interface CreateSectionData {
  name: string;
  slug: string;
  description?: string;
  isPublished?: boolean;
}

export async function createSectionViaApi(
  page: Page,
  data: CreateSectionData,
): Promise<{ id: string }> {
  const response = await page.request.post("/api/sections", {
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description ?? "",
      isPublished: data.isPublished ?? true,
    },
  });
  const json = await response.json();
  return json.data;
}

export async function fillSectionForm(
  page: Page,
  data: Partial<CreateSectionData>,
) {
  if (data.name) {
    await page.getByLabel(/^(name|название)$/i).fill(data.name);
  }
  if (data.slug) {
    await page.getByLabel(/^slug$/i).fill(data.slug);
  }
}
