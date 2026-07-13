import { describe, it, expect, beforeAll } from "vitest";
import { pageService } from "@/services/page.service";
import { pageBlockService } from "@/services/page-block.service";

describe("pageBlockService", () => {
  let testPageId: string;

  beforeAll(async () => {
    const { main } = await import("@/drizzle/seed");
    await main();
  });

  beforeAll(async () => {
    const slug = `test-blocks-page-${Date.now()}`;
    const page = await pageService.create({ title: "Block Test Page", slug });
    testPageId = page!.id;
  });

  describe("create", () => {
    it("creates a heading block", async () => {
      const block = await pageBlockService.create({
        pageId: testPageId,
        blockType: "heading",
        config: { blockType: "heading", text: "Welcome", level: 1 },
      });

      expect(block).not.toBeNull();
      expect(block!.pageId).toBe(testPageId);
      expect(block!.blockType).toBe("heading");
      expect(block!.sortOrder).toBe(0);
    });

    it("creates nested blocks with parentId", async () => {
      const section = await pageBlockService.create({
        pageId: testPageId,
        blockType: "section",
        config: { blockType: "section", title: "Hero" },
      });

      const child = await pageBlockService.create({
        pageId: testPageId,
        parentId: section!.id,
        blockType: "heading",
        config: { blockType: "heading", text: "Inside Section", level: 2 },
      });

      expect(child).not.toBeNull();
      expect(child!.parentId).toBe(section!.id);
    });

    it("increments sortOrder for subsequent blocks", async () => {
      const slug = `test-increment-order-${Date.now()}`;
      const page = await pageService.create({ title: "SortOrder Test", slug });

      const block1 = await pageBlockService.create({
        pageId: page!.id,
        blockType: "paragraph",
        config: { blockType: "paragraph", html: "<p>First</p>" },
      });

      const block2 = await pageBlockService.create({
        pageId: page!.id,
        blockType: "paragraph",
        config: { blockType: "paragraph", html: "<p>Second</p>" },
      });

      expect(block1!.sortOrder).toBe(0);
      expect(block2!.sortOrder).toBe(1);
    });
  });

  describe("getTree", () => {
    it("returns flat list when no nesting", async () => {
      const slug = `test-tree-flat-${Date.now()}`;
      const page = await pageService.create({ title: "Tree Flat", slug });

      await pageBlockService.create({
        pageId: page!.id,
        blockType: "heading",
        config: { blockType: "heading", text: "H1", level: 1 },
      });

      const tree = await pageBlockService.getTree(page!.id);
      expect(tree.length).toBe(1);
    });

    it("returns nested tree structure", async () => {
      const slug = `test-tree-nested-${Date.now()}`;
      const page = await pageService.create({ title: "Tree Nested", slug });

      const section = await pageBlockService.create({
        pageId: page!.id,
        blockType: "section",
        config: { blockType: "section" },
      });

      await pageBlockService.create({
        pageId: page!.id,
        parentId: section!.id,
        blockType: "heading",
        config: { blockType: "heading", text: "Child", level: 2 },
      });

      const tree = await pageBlockService.getTree(page!.id);
      expect(tree.length).toBe(1);
      expect(tree[0].blockType).toBe("section");
      expect(tree[0].children?.length).toBe(1);
      expect(tree[0].children![0].blockType).toBe("heading");
    });

    it("orders blocks by sortOrder", async () => {
      const slug = `test-tree-order-${Date.now()}`;
      const page = await pageService.create({ title: "Tree Order", slug });

      const b2 = await pageBlockService.create({
        pageId: page!.id,
        blockType: "heading",
        sortOrder: 2,
        config: { blockType: "heading", text: "Second", level: 2 },
      });

      const b1 = await pageBlockService.create({
        pageId: page!.id,
        blockType: "heading",
        sortOrder: 1,
        config: { blockType: "heading", text: "First", level: 1 },
      });

      const tree = await pageBlockService.getTree(page!.id);
      expect(tree[0].id).toBe(b1!.id);
      expect(tree[1].id).toBe(b2!.id);
    });

    it("returns empty array for page with no blocks", async () => {
      const slug = `test-tree-empty-${Date.now()}`;
      const page = await pageService.create({ title: "Tree Empty", slug });

      const tree = await pageBlockService.getTree(page!.id);
      expect(tree).toEqual([]);
    });
  });

  describe("update", () => {
    it("updates block config", async () => {
      const block = await pageBlockService.create({
        pageId: testPageId,
        blockType: "heading",
        config: { blockType: "heading", text: "Before", level: 1 },
      });

      const updated = await pageBlockService.update(block!.id, {
        config: { blockType: "heading", text: "After", level: 2 },
      });

      expect(updated).not.toBeNull();
      expect(updated!.config?.text).toBe("After");
      expect(updated!.config?.level).toBe(2);
    });

    it("updates sortOrder", async () => {
      const block = await pageBlockService.create({
        pageId: testPageId,
        blockType: "heading",
        config: { blockType: "heading", text: "Reorder Me", level: 1 },
      });

      const updated = await pageBlockService.update(block!.id, {
        sortOrder: 99,
      });

      expect(updated!.sortOrder).toBe(99);
    });

    it("returns null for non-existent block", async () => {
      const result = await pageBlockService.update("non-existent", {
        config: { blockType: "heading", text: "Nope", level: 1 },
      });
      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("deletes a block", async () => {
      const block = await pageBlockService.create({
        pageId: testPageId,
        blockType: "divider",
        config: { blockType: "divider" },
      });

      const result = await pageBlockService.delete(block!.id);
      expect(result).toBe(true);

      const tree = await pageBlockService.getTree(testPageId);
      const found = tree.find((b) => b.id === block!.id);
      expect(found).toBeUndefined();
    });

    it("returns false for non-existent block", async () => {
      const result = await pageBlockService.delete("non-existent");
      expect(result).toBe(false);
    });

    it("deletes child blocks when parent is deleted", async () => {
      const section = await pageBlockService.create({
        pageId: testPageId,
        blockType: "section",
        config: { blockType: "section" },
      });

      const child = await pageBlockService.create({
        pageId: testPageId,
        parentId: section!.id,
        blockType: "heading",
        config: { blockType: "heading", text: "Child", level: 2 },
      });

      await pageBlockService.delete(section!.id);

      const tree = await pageBlockService.getTree(testPageId);
      expect(tree.find((b) => b.id === child!.id)).toBeUndefined();
    });
  });

  describe("reorder", () => {
    it("reorders blocks", async () => {
      const slug = `test-reorder-page-${Date.now()}`;
      const page = await pageService.create({ title: "Reorder", slug });

      const b1 = await pageBlockService.create({
        pageId: page!.id,
        blockType: "heading",
        sortOrder: 0,
        config: { blockType: "heading", text: "A", level: 1 },
      });

      const b2 = await pageBlockService.create({
        pageId: page!.id,
        blockType: "heading",
        sortOrder: 1,
        config: { blockType: "heading", text: "B", level: 2 },
      });

      await pageBlockService.reorder(page!.id, [b2!.id, b1!.id]);

      const tree = await pageBlockService.getTree(page!.id);
      expect(tree[0].id).toBe(b2!.id);
      expect(tree[1].id).toBe(b1!.id);
    });
  });
});
