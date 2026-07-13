import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "@/lib/db";
import { sections } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { sectionService } from "@/services/section.service";

describe("sectionService", () => {
  beforeAll(async () => {
    const { main } = await import("@/drizzle/seed");
    await main();
  });

  const testIds: string[] = [];

  afterAll(() => {
    for (const id of testIds) {
      db.delete(sections).where(eq(sections.id, id)).run();
    }
  });

  describe("create", () => {
    it("creates a section and returns it", async () => {
      const slug = `test-section-${Date.now()}`;
      const section = await sectionService.create({
        name: "Test Section",
        slug,
      });

      expect(section).not.toBeNull();
      expect(section!.name).toBe("Test Section");
      expect(section!.slug).toBe(slug);
      expect(section!.sortOrder).toBe(0);
      expect(section!.isPublished).toBe(true);

      testIds.push(section!.id);
    });

    it("returns null when slug already exists", async () => {
      const slug = `test-section-dupe-${Date.now()}`;
      await sectionService.create({ name: "First", slug });
      const second = await sectionService.create({ name: "Second", slug });

      expect(second).toBeNull();
    });

    it("creates with all optional fields", async () => {
      const slug = `test-section-full-${Date.now()}`;
      const section = await sectionService.create({
        name: "Full Section",
        slug,
        description: "Description text",
        content: "<p>Content</p>",
        metaTitle: "Meta Title",
        metaDescription: "Meta Desc",
        sortOrder: 5,
        isPublished: false,
      });

      expect(section).not.toBeNull();
      expect(section!.description).toBe("Description text");
      expect(section!.content).toBe("<p>Content</p>");
      expect(section!.metaTitle).toBe("Meta Title");
      expect(section!.metaDescription).toBe("Meta Desc");
      expect(section!.sortOrder).toBe(5);
      expect(section!.isPublished).toBe(false);

      testIds.push(section!.id);
    });
  });

  describe("getById", () => {
    it("returns a section by id", async () => {
      const slug = `test-getbyid-${Date.now()}`;
      const created = await sectionService.create({ name: "Get By ID", slug });
      expect(created).not.toBeNull();

      const section = await sectionService.getById(created!.id);
      expect(section).not.toBeNull();
      expect(section!.id).toBe(created!.id);

      testIds.push(created!.id);
    });

    it("returns null for non-existent id", async () => {
      const section = await sectionService.getById("non-existent-id");
      expect(section).toBeNull();
    });
  });

  describe("getBySlug", () => {
    it("returns a section by slug", async () => {
      const slug = `test-getbyslug-${Date.now()}`;
      const created = await sectionService.create({
        name: "Get By Slug",
        slug,
      });
      expect(created).not.toBeNull();

      const section = await sectionService.getBySlug(slug);
      expect(section).not.toBeNull();
      expect(section!.id).toBe(created!.id);

      testIds.push(created!.id);
    });

    it("returns null for non-existent slug", async () => {
      const section = await sectionService.getBySlug("non-existent-slug");
      expect(section).toBeNull();
    });
  });

  describe("list", () => {
    it("returns paginated sections", async () => {
      const result = await sectionService.list({ page: 1, pageSize: 10 });
      expect(result.items.length).toBeGreaterThan(0);
      expect(result.total).toBeGreaterThan(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
    });

    it("includes pageCount for each section", async () => {
      const slug = `test-list-pages-${Date.now()}`;
      const section = await sectionService.create({ name: "List Pages", slug });
      expect(section).not.toBeNull();

      const result = await sectionService.list({ page: 1, pageSize: 100 });

      const found = result.items.find((s) => s.id === section!.id);
      expect(found).toBeDefined();
      expect(found!.pageCount).toBe(0);

      testIds.push(section!.id);
    });

    it("filters by search", async () => {
      const slug = `test-search-${Date.now()}`;
      await sectionService.create({ name: `SearchTarget-${slug}`, slug });
      testIds.push(slug);

      const result = await sectionService.list({ search: `SearchTarget` });
      expect(result.items.length).toBeGreaterThan(0);
    });

    it("returns empty list for search with no match", async () => {
      const result = await sectionService.list({
        search: `zzz-no-match-${Date.now()}`,
      });
      expect(result.items.length).toBe(0);
      expect(result.total).toBe(0);
    });
  });

  describe("listPublished", () => {
    it("returns only published sections", async () => {
      const sections = await sectionService.listPublished();
      for (const section of sections) {
        expect(section.isPublished).toBe(true);
      }
    });
  });

  describe("update", () => {
    it("updates section fields", async () => {
      const slug = `test-update-${Date.now()}`;
      const created = await sectionService.create({ name: "Before", slug });
      expect(created).not.toBeNull();

      const updated = await sectionService.update(created!.id, {
        name: "After",
      });

      expect(updated).not.toBeNull();
      expect(updated!.name).toBe("After");
      expect(updated!.slug).toBe(slug);

      testIds.push(created!.id);
    });

    it("returns null when new slug conflicts", async () => {
      const slug1 = `test-update-conflict1-${Date.now()}`;
      const slug2 = `test-update-conflict2-${Date.now()}`;
      await sectionService.create({ name: "Conflict 1", slug: slug1 });
      const created2 = await sectionService.create({
        name: "Conflict 2",
        slug: slug2,
      });

      const result = await sectionService.update(created2!.id, {
        slug: slug1,
      });

      expect(result).toBeNull();

      testIds.push(created2!.id);
    });
  });

  describe("hasPages", () => {
    it("returns true when section has pages", async () => {
      const slug = `test-haspages-${Date.now()}`;
      const section = await sectionService.create({
        name: "Has Pages",
        slug,
      });
      expect(section).not.toBeNull();

      const result = await sectionService.hasPages(section!.id);
      expect(result).toBe(false);

      const sectionWithPages = await sectionService.getBySlug("about");
      if (sectionWithPages) {
        const aboutResult = await sectionService.hasPages(sectionWithPages.id);
        expect(aboutResult).toBe(true);
      }

      testIds.push(section!.id);
    });
  });

  describe("delete", () => {
    it("returns false when section has pages", async () => {
      const aboutSection = await sectionService.getBySlug("about");
      if (aboutSection) {
        const result = await sectionService.delete(aboutSection.id);
        expect(result).toBe(false);
      }
    });

    it("deletes a section without pages", async () => {
      const slug = `test-delete-empty-${Date.now()}`;
      const section = await sectionService.create({
        name: "Delete Me",
        slug,
      });
      expect(section).not.toBeNull();

      const result = await sectionService.delete(section!.id);
      expect(result).toBe(true);

      const check = await sectionService.getById(section!.id);
      expect(check).toBeNull();
    });
  });
});
