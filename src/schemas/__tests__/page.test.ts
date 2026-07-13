import { describe, it, expect } from "vitest";
import { CreatePageSchema, UpdatePageSchema, PageSchema } from "@/schemas/page";

describe("PageSchema", () => {
  it("accepts a valid full page", () => {
    const result = PageSchema.safeParse({
      id: "1",
      title: "Test",
      slug: "test-page",
      content: "<p>Hello</p>",
      metaTitle: "Meta",
      metaDescription: "Desc",
      isPublished: true,
      isHome: false,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });

  it("rejects slug with uppercase letters", () => {
    const result = PageSchema.safeParse({
      id: "1",
      title: "Bad",
      slug: "Bad-Slug",
      isPublished: false,
      isHome: false,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty title", () => {
    const result = PageSchema.safeParse({
      id: "1",
      title: "",
      slug: "test",
      isPublished: false,
      isHome: false,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    });
    expect(result.success).toBe(false);
  });
});

describe("CreatePageSchema", () => {
  it("accepts minimal valid input", () => {
    const result = CreatePageSchema.safeParse({
      title: "New Page",
      slug: "new-page",
    });
    expect(result.success).toBe(true);
  });

  it("accepts full input with all fields", () => {
    const result = CreatePageSchema.safeParse({
      title: "Full Page",
      slug: "full-page",
      sectionId: "section-1",
      content: "<p>Content</p>",
      metaTitle: "Meta Title",
      metaDescription: "Meta Desc",
      isPublished: true,
      isHome: false,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty title", () => {
    const result = CreatePageSchema.safeParse({
      title: "",
      slug: "new-page",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty slug", () => {
    const result = CreatePageSchema.safeParse({
      title: "New Page",
      slug: "",
    });
    expect(result.success).toBe(false);
  });

  it("defaults isPublished to false", () => {
    const result = CreatePageSchema.safeParse({
      title: "New Page",
      slug: "new-page",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isPublished).toBe(false);
    }
  });

  it("defaults isHome to false", () => {
    const result = CreatePageSchema.safeParse({
      title: "New Page",
      slug: "new-page",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isHome).toBe(false);
    }
  });
});

describe("UpdatePageSchema", () => {
  it("accepts partial update", () => {
    const result = UpdatePageSchema.safeParse({ title: "Updated" });
    expect(result.success).toBe(true);
  });

  it("accepts empty object (no fields to update)", () => {
    const result = UpdatePageSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});
