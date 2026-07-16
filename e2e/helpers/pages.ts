import { Page } from "@playwright/test";

export interface CreatePageData {
  title: string;
  slug: string;
  sectionId?: string | null;
  isPublished?: boolean;
  isHome?: boolean;
}

export async function createPageViaApi(
  page: Page,
  data: CreatePageData,
): Promise<{ id: string }> {
  const response = await page.request.post("/api/pages", {
    data: {
      title: data.title,
      slug: data.slug,
      sectionId: data.sectionId ?? null,
      isPublished: data.isPublished ?? true,
      isHome: data.isHome ?? false,
    },
  });
  const json = await response.json();
  return json.data;
}

export async function fillPageForm(page: Page, data: Partial<CreatePageData>) {
  if (data.title) {
    await page.getByTestId("page-form-title").fill(data.title);
  }
  if (data.slug) {
    await page.getByTestId("page-form-slug").fill(data.slug);
  }
}
