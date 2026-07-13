import { describe, it, expect } from "vitest";
import {
  CreateSectionSchema,
  UpdateSectionSchema,
  SectionSchema,
} from "@/schemas/section";

describe("SectionSchema", () => {
  it("accepts a valid full section", () => {
    const result = SectionSchema.safeParse({
      id: "1",
      name: "About",
      slug: "about",
      description: "About us",
      content: "<p>Content</p>",
      metaTitle: "Meta",
      metaDescription: "Desc",
      sortOrder: 0,
      isPublished: true,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });

  it("rejects slug with uppercase letters", () => {
    const result = SectionSchema.safeParse({
      id: "1",
      name: "Bad",
      slug: "Bad-Slug",
      isPublished: true,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = SectionSchema.safeParse({
      id: "1",
      name: "",
      slug: "test",
      isPublished: true,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    });
    expect(result.success).toBe(false);
  });
});

describe("CreateSectionSchema", () => {
  it("accepts minimal valid input", () => {
    const result = CreateSectionSchema.safeParse({
      name: "New Section",
      slug: "new-section",
    });
    expect(result.success).toBe(true);
  });

  it("accepts full input with all fields", () => {
    const result = CreateSectionSchema.safeParse({
      name: "Full Section",
      slug: "full-section",
      description: "Description",
      content: "<p>Content</p>",
      metaTitle: "Meta Title",
      metaDescription: "Meta Desc",
      sortOrder: 5,
      isPublished: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = CreateSectionSchema.safeParse({
      name: "",
      slug: "new-section",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty slug", () => {
    const result = CreateSectionSchema.safeParse({
      name: "New Section",
      slug: "",
    });
    expect(result.success).toBe(false);
  });

  it("defaults sortOrder to 0", () => {
    const result = CreateSectionSchema.safeParse({
      name: "New Section",
      slug: "new-section",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sortOrder).toBe(0);
    }
  });

  it("defaults isPublished to true", () => {
    const result = CreateSectionSchema.safeParse({
      name: "New Section",
      slug: "new-section",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isPublished).toBe(true);
    }
  });
});

describe("UpdateSectionSchema", () => {
  it("accepts partial update", () => {
    const result = UpdateSectionSchema.safeParse({ name: "Updated" });
    expect(result.success).toBe(true);
  });

  it("accepts empty object", () => {
    const result = UpdateSectionSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});
