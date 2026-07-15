import { describe, it, expect, beforeAll } from "vitest";
import { db } from "@/lib/db";
import { pages } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { pageService } from "@/services/page.service";
import { sectionService } from "@/services/section.service";

const mockPuckData = {
  content: [
    {
      type: "HeadingBlock",
      props: { id: "HeadingBlock-1", text: "Hello", level: 2 },
    },
  ],
  root: { props: { title: "Test Page" } },
};

describe("pageService", () => {
  beforeAll(async () => {
    const { main } = await import("@/drizzle/seed");
    await main();
  });

  let testSectionId: string;

  beforeAll(async () => {
    const slug = `test-section-for-pages-${Date.now()}`;
    const section = await sectionService.create({
      name: "Test Section for Pages",
      slug,
    });
    testSectionId = section!.id;
  });

  describe("create", () => {
    it("creates a page at root level", async () => {
      const slug = `test-root-page-${Date.now()}`;
      const page = await pageService.create({
        title: "Root Page",
        slug,
        isPublished: true,
      });

      expect(page).not.toBeNull();
      expect(page!.title).toBe("Root Page");
      expect(page!.slug).toBe(slug);
      expect(page!.sectionId).toBeNull();
      expect(page!.publishedAt).not.toBeNull();
    });

    it("creates a page within a section", async () => {
      const slug = `test-section-page-${Date.now()}`;
      const page = await pageService.create({
        title: "Section Page",
        slug,
        sectionId: testSectionId,
        isPublished: true,
      });

      expect(page).not.toBeNull();
      expect(page!.sectionId).toBe(testSectionId);
      expect(page!.sectionName).toBe("Test Section for Pages");
    });

    it("returns null when slug already exists in same scope", async () => {
      const slug = `test-dupe-page-${Date.now()}`;
      await pageService.create({ title: "First", slug });
      const second = await pageService.create({ title: "Second", slug });

      expect(second).toBeNull();
    });

    it("allows same slug in different scopes", async () => {
      const slug = `test-scope-dupe-${Date.now()}`;
      const root = await pageService.create({ title: "Root", slug });
      const inside = await pageService.create({
        title: "Inside Section",
        slug,
        sectionId: testSectionId,
      });

      expect(root).not.toBeNull();
      expect(inside).not.toBeNull();
      expect(inside!.sectionId).toBe(testSectionId);
    });

    it("resets previous home page when creating a new home page", async () => {
      const slug1 = `test-home1-${Date.now()}`;
      const slug2 = `test-home2-${Date.now()}`;

      const home1 = await pageService.create({
        title: "Home 1",
        slug: slug1,
        isHome: true,
      });
      expect(home1).not.toBeNull();
      expect(home1!.isHome).toBe(true);

      const home2 = await pageService.create({
        title: "Home 2",
        slug: slug2,
        isHome: true,
      });
      expect(home2).not.toBeNull();
      expect(home2!.isHome).toBe(true);

      const oldHome = await pageService.getById(home1!.id);
      expect(oldHome!.isHome).toBe(false);
    });
  });

  describe("getById", () => {
    it("returns a page by id", async () => {
      const slug = `test-getbyid-${Date.now()}`;
      const created = await pageService.create({ title: "Get By ID", slug });
      expect(created).not.toBeNull();

      const page = await pageService.getById(created!.id);
      expect(page).not.toBeNull();
      expect(page!.id).toBe(created!.id);
    });

    it("returns null for non-existent id", async () => {
      const page = await pageService.getById("non-existent-id");
      expect(page).toBeNull();
    });
  });

  describe("getBySlug", () => {
    it("returns a root page by slug", async () => {
      const slug = `test-getbyslug-${Date.now()}`;
      await pageService.create({
        title: "Get By Slug",
        slug,
        isPublished: true,
      });

      const page = await pageService.getBySlug(slug);
      expect(page).not.toBeNull();
      expect(page!.slug).toBe(slug);
    });

    it("does not return a page inside a section", async () => {
      const slug = `test-inside-section-${Date.now()}`;
      await pageService.create({
        title: "Inside Section",
        slug,
        sectionId: testSectionId,
      });

      const page = await pageService.getBySlug(slug);
      expect(page).toBeNull();
    });

    it("returns null for non-existent slug", async () => {
      const page = await pageService.getBySlug("non-existent-slug");
      expect(page).toBeNull();
    });
  });

  describe("getBySectionAndSlug", () => {
    it("returns a page by section slug and page slug", async () => {
      const slug = `test-section-child-${Date.now()}`;
      await pageService.create({
        title: "Section Child",
        slug,
        sectionId: testSectionId,
        isPublished: true,
      });

      const section = await sectionService.getById(testSectionId);
      const page = await pageService.getBySectionAndSlug(section!.slug, slug);
      expect(page).not.toBeNull();
      expect(page!.slug).toBe(slug);
    });

    it("returns null when section does not exist", async () => {
      const page = await pageService.getBySectionAndSlug(
        "non-existent-section",
        "any-page",
      );
      expect(page).toBeNull();
    });

    it("returns null when page does not exist in section", async () => {
      const section = await sectionService.getById(testSectionId);
      const page = await pageService.getBySectionAndSlug(
        section!.slug,
        "non-existent-page",
      );
      expect(page).toBeNull();
    });
  });

  describe("getHome", () => {
    it("returns the home page", async () => {
      const home = await pageService.getHome();
      expect(home).not.toBeNull();
      expect(home!.isHome).toBe(true);
    });
  });

  describe("list", () => {
    it("returns paginated pages", async () => {
      const result = await pageService.list({ page: 1, pageSize: 10 });
      expect(result.items.length).toBeGreaterThan(0);
      expect(result.total).toBeGreaterThan(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
    });

    it("filters by search", async () => {
      const slug = `test-list-search-${Date.now()}`;
      await pageService.create({ title: `SearchTargetPage-${slug}`, slug });

      const result = await pageService.list({ search: "SearchTargetPage" });
      expect(result.items.length).toBeGreaterThan(0);
    });

    it("filters by sectionId", async () => {
      const result = await pageService.list({ sectionId: testSectionId });
      for (const page of result.items) {
        expect(page.sectionId).toBe(testSectionId);
      }
    });

    it("does not include soft-deleted pages", async () => {
      const slug = `test-soft-delete-list-${Date.now()}`;
      const created = await pageService.create({ title: "Soft Delete", slug });
      expect(created).not.toBeNull();

      await pageService.delete(created!.id);

      const result = await pageService.list({ search: "Soft Delete" });
      const found = result.items.find((p) => p.id === created!.id);
      expect(found).toBeUndefined();
    });
  });

  describe("update", () => {
    it("updates page fields", async () => {
      const slug = `test-update-page-${Date.now()}`;
      const created = await pageService.create({ title: "Before", slug });
      expect(created).not.toBeNull();

      const updated = await pageService.update(created!.id, {
        title: "After",
      });

      expect(updated).not.toBeNull();
      expect(updated!.title).toBe("After");
    });

    it("returns null when slug conflicts", async () => {
      const slug1 = `test-update-conflict-p1-${Date.now()}`;
      const slug2 = `test-update-conflict-p2-${Date.now()}`;

      await pageService.create({ title: "Page 1", slug: slug1 });
      const page2 = await pageService.create({ title: "Page 2", slug: slug2 });

      const result = await pageService.update(page2!.id, { slug: slug1 });
      expect(result).toBeNull();
    });

    it("sets publishedAt when publishing for the first time", async () => {
      const slug = `test-publish-first-${Date.now()}`;
      const created = await pageService.create({
        title: "Unpublished",
        slug,
        isPublished: false,
      });
      expect(created).not.toBeNull();
      expect(created!.publishedAt).toBeNull();

      const updated = await pageService.update(created!.id, {
        isPublished: true,
      });
      expect(updated!.publishedAt).not.toBeNull();
    });
  });

  describe("delete", () => {
    it("soft-deletes a page", async () => {
      const slug = `test-soft-delete-${Date.now()}`;
      const created = await pageService.create({ title: "Delete Me", slug });
      expect(created).not.toBeNull();

      const result = await pageService.delete(created!.id);
      expect(result).toBe(true);

      const [row] = db
        .select({ deletedAt: pages.deletedAt })
        .from(pages)
        .where(eq(pages.id, created!.id))
        .all();

      expect(row.deletedAt).not.toBeNull();
    });

    it("returns false when trying to delete the home page", async () => {
      const slug = `test-delete-home-${Date.now()}`;
      const home = await pageService.create({
        title: "New Home",
        slug,
        isHome: true,
      });
      expect(home).not.toBeNull();

      const result = await pageService.delete(home!.id);
      expect(result).toBe(false);
    });

    it("returns false for non-existent page", async () => {
      const result = await pageService.delete("non-existent-id");
      expect(result).toBe(false);
    });
  });

  describe("checkSlugInSection", () => {
    it("returns true when slug exists in section", async () => {
      const slug = `test-check-section-${Date.now()}`;
      await pageService.create({
        title: "Check Section",
        slug,
        sectionId: testSectionId,
      });

      const exists = await pageService.checkSlugInSection(slug, testSectionId);
      expect(exists).toBe(true);
    });

    it("returns false when slug does not exist in section", async () => {
      const exists = await pageService.checkSlugInSection(
        "non-existent-in-section",
        testSectionId,
      );
      expect(exists).toBe(false);
    });
  });

  describe("checkRootSlug", () => {
    it("returns true when root slug exists", async () => {
      const slug = `test-check-root-${Date.now()}`;
      await pageService.create({ title: "Check Root", slug });

      const exists = await pageService.checkRootSlug(slug);
      expect(exists).toBe(true);
    });

    it("returns false when root slug does not exist", async () => {
      const exists = await pageService.checkRootSlug("non-existent-root-slug");
      expect(exists).toBe(false);
    });
  });

  describe("getContent", () => {
    it("returns parsed Puck data from existing page", async () => {
      const slug = `test-get-content-${Date.now()}`;
      const page = await pageService.create({
        title: "Content Page",
        slug,
        isPublished: true,
      });
      expect(page).not.toBeNull();

      await pageService.saveContent(page!.id, mockPuckData);

      const content = await pageService.getContent(page!.id);
      expect(content).toEqual(mockPuckData);
    });

    it("returns null when page has no content", async () => {
      const slug = `test-no-content-${Date.now()}`;
      const page = await pageService.create({
        title: "No Content",
        slug,
        isPublished: true,
      });
      expect(page).not.toBeNull();

      const content = await pageService.getContent(page!.id);
      expect(content).toBeNull();
    });

    it("returns null for non-existent page", async () => {
      const content = await pageService.getContent("non-existent-id");
      expect(content).toBeNull();
    });
  });

  describe("saveContent", () => {
    it("saves Puck data and returns the updated page", async () => {
      const slug = `test-save-content-${Date.now()}`;
      const page = await pageService.create({
        title: "Save Content",
        slug,
        isPublished: true,
      });
      expect(page).not.toBeNull();

      const updated = await pageService.saveContent(page!.id, mockPuckData);
      expect(updated).not.toBeNull();
      expect(updated!.id).toBe(page!.id);

      const saved = await pageService.getContent(page!.id);
      expect(saved).toEqual(mockPuckData);
    });

    it("overwrites existing content", async () => {
      const slug = `test-overwrite-content-${Date.now()}`;
      const page = await pageService.create({
        title: "Overwrite",
        slug,
        isPublished: true,
      });
      expect(page).not.toBeNull();

      const newData = {
        content: [
          {
            type: "ParagraphBlock" as const,
            props: { id: "pb-1", html: "<p>Updated</p>" },
          },
        ],
        root: { props: {} },
      };

      await pageService.saveContent(page!.id, mockPuckData);
      await pageService.saveContent(page!.id, newData);

      const content = await pageService.getContent(page!.id);
      expect(content).toEqual(newData);
    });
  });
});
