import { describe, it, expect } from "vitest";
import {
  PageBlockSchema,
  CreateBlockDTOSchema,
  UpdateBlockDTOSchema,
  BlockConfigSchema,
} from "@/schemas/page-block";

const validBlock = {
  id: "block-1",
  pageId: "page-1",
  parentId: null,
  blockType: "heading",
  sortOrder: 0,
  config: {
    blockType: "heading",
    text: "Hello",
    level: 2,
    alignment: "center",
  },
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

describe("PageBlockSchema", () => {
  it("accepts a valid block with parentId", () => {
    const result = PageBlockSchema.safeParse({
      ...validBlock,
      parentId: "parent-1",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a root block (parentId null)", () => {
    const result = PageBlockSchema.safeParse(validBlock);
    expect(result.success).toBe(true);
  });

  it("rejects missing pageId", () => {
    const result = PageBlockSchema.safeParse({
      ...validBlock,
      pageId: undefined,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid blockType", () => {
    const result = PageBlockSchema.safeParse({
      ...validBlock,
      blockType: "invalid",
      config: { blockType: "invalid" },
    });
    expect(result.success).toBe(false);
  });

  it("defaults sortOrder to 0", () => {
    const result = PageBlockSchema.safeParse({
      ...validBlock,
      sortOrder: undefined,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sortOrder).toBe(0);
    }
  });
});

describe("CreateBlockDTOSchema", () => {
  it("accepts minimal valid input", () => {
    const result = CreateBlockDTOSchema.safeParse({
      pageId: "page-1",
      blockType: "heading",
      config: { blockType: "heading", text: "Hi", level: 1 },
    });
    expect(result.success).toBe(true);
  });

  it("accepts full input with parentId and sortOrder", () => {
    const result = CreateBlockDTOSchema.safeParse({
      pageId: "page-1",
      parentId: "parent-1",
      blockType: "section",
      sortOrder: 1,
      config: { blockType: "section", title: "Hero" },
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing blockType", () => {
    const result = CreateBlockDTOSchema.safeParse({
      pageId: "page-1",
      config: { blockType: "heading", text: "Hi", level: 1 },
    });
    expect(result.success).toBe(false);
  });

  it("defaults sortOrder to 0", () => {
    const result = CreateBlockDTOSchema.safeParse({
      pageId: "page-1",
      blockType: "heading",
      config: { blockType: "heading", text: "Hi", level: 1 },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sortOrder).toBe(0);
    }
  });
});

describe("UpdateBlockDTOSchema", () => {
  it("accepts partial config update", () => {
    const result = UpdateBlockDTOSchema.safeParse({
      config: { blockType: "heading", text: "Updated", level: 3 },
    });
    expect(result.success).toBe(true);
  });

  it("accepts sortOrder update only", () => {
    const result = UpdateBlockDTOSchema.safeParse({ sortOrder: 5 });
    expect(result.success).toBe(true);
  });

  it("accepts parentId update", () => {
    const result = UpdateBlockDTOSchema.safeParse({ parentId: "new-parent" });
    expect(result.success).toBe(true);
  });

  it("accepts empty object", () => {
    const result = UpdateBlockDTOSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe("BlockConfigSchema", () => {
  describe("section", () => {
    it("accepts minimal config", () => {
      const result = BlockConfigSchema.safeParse({ blockType: "section" });
      expect(result.success).toBe(true);
    });

    it("accepts full config with optional fields", () => {
      const result = BlockConfigSchema.safeParse({
        blockType: "section",
        paddingTop: 40,
        paddingBottom: 40,
        backgroundColor: "#f5f5f5",
        title: "Hero Section",
        subtitle: "Welcome",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("heading", () => {
    it("accepts valid heading", () => {
      const result = BlockConfigSchema.safeParse({
        blockType: "heading",
        text: "Hello World",
        level: 1,
        alignment: "center",
      });
      expect(result.success).toBe(true);
    });

    it("accepts heading without alignment", () => {
      const result = BlockConfigSchema.safeParse({
        blockType: "heading",
        text: "Hello",
        level: 2,
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid level", () => {
      const result = BlockConfigSchema.safeParse({
        blockType: "heading",
        text: "Hello",
        level: 5,
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing text", () => {
      const result = BlockConfigSchema.safeParse({
        blockType: "heading",
        level: 1,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("paragraph", () => {
    it("accepts valid paragraph", () => {
      const result = BlockConfigSchema.safeParse({
        blockType: "paragraph",
        html: "<p>Hello</p>",
        alignment: "left",
      });
      expect(result.success).toBe(true);
    });

    it("rejects missing html", () => {
      const result = BlockConfigSchema.safeParse({
        blockType: "paragraph",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("image", () => {
    it("accepts valid image", () => {
      const result = BlockConfigSchema.safeParse({
        blockType: "image",
        src: "/uploads/photo.jpg",
        alt: "Photo",
        caption: "Nice view",
        sizing: "cover",
      });
      expect(result.success).toBe(true);
    });

    it("rejects missing src", () => {
      const result = BlockConfigSchema.safeParse({
        blockType: "image",
        alt: "Photo",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("cta", () => {
    it("accepts valid cta", () => {
      const result = BlockConfigSchema.safeParse({
        blockType: "cta",
        title: "Act Now",
        description: "Limited offer",
        buttonText: "Get Started",
        buttonUrl: "/signup",
        buttonVariant: "primary",
      });
      expect(result.success).toBe(true);
    });

    it("accepts cta without optional fields", () => {
      const result = BlockConfigSchema.safeParse({
        blockType: "cta",
        buttonText: "Click",
        buttonUrl: "/go",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("columns", () => {
    it("accepts valid columns", () => {
      const result = BlockConfigSchema.safeParse({
        blockType: "columns",
        columnsCount: 3,
      });
      expect(result.success).toBe(true);
    });

    it("rejects columnsCount < 1", () => {
      const result = BlockConfigSchema.safeParse({
        blockType: "columns",
        columnsCount: 0,
      });
      expect(result.success).toBe(false);
    });

    it("rejects columnsCount > 4", () => {
      const result = BlockConfigSchema.safeParse({
        blockType: "columns",
        columnsCount: 5,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("column", () => {
    it("accepts valid column", () => {
      const result = BlockConfigSchema.safeParse({ blockType: "column" });
      expect(result.success).toBe(true);
    });
  });

  describe("faq", () => {
    it("accepts valid faq with items", () => {
      const result = BlockConfigSchema.safeParse({
        blockType: "faq",
        items: [
          { question: "Q1", answer: "A1" },
          { question: "Q2", answer: "A2" },
        ],
      });
      expect(result.success).toBe(true);
    });

    it("rejects faq with empty items", () => {
      const result = BlockConfigSchema.safeParse({
        blockType: "faq",
        items: [],
      });
      expect(result.success).toBe(false);
    });
  });

  describe("divider", () => {
    it("accepts valid divider", () => {
      const result = BlockConfigSchema.safeParse({
        blockType: "divider",
        style: "dashed",
        color: "#ccc",
        thickness: 2,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("video", () => {
    it("accepts valid video", () => {
      const result = BlockConfigSchema.safeParse({
        blockType: "video",
        url: "https://youtube.com/watch?v=abc123",
        autoplay: false,
        controls: true,
      });
      expect(result.success).toBe(true);
    });

    it("rejects missing url", () => {
      const result = BlockConfigSchema.safeParse({
        blockType: "video",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("gallery", () => {
    it("accepts valid gallery", () => {
      const result = BlockConfigSchema.safeParse({
        blockType: "gallery",
        images: [
          { src: "/img1.jpg", alt: "One" },
          { src: "/img2.jpg", alt: "Two" },
        ],
        layout: "grid",
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty images", () => {
      const result = BlockConfigSchema.safeParse({
        blockType: "gallery",
        images: [],
      });
      expect(result.success).toBe(false);
    });
  });

  describe("pricing", () => {
    it("accepts valid pricing", () => {
      const result = BlockConfigSchema.safeParse({
        blockType: "pricing",
        plans: [
          {
            name: "Basic",
            price: 9.99,
            currency: "USD",
            period: "month",
            features: ["Feature 1", "Feature 2"],
            cta: { text: "Buy", url: "/buy/basic" },
          },
        ],
      });
      expect(result.success).toBe(true);
    });

    it("rejects pricing with empty plans", () => {
      const result = BlockConfigSchema.safeParse({
        blockType: "pricing",
        plans: [],
      });
      expect(result.success).toBe(false);
    });
  });

  describe("form", () => {
    it("accepts valid form", () => {
      const result = BlockConfigSchema.safeParse({
        blockType: "form",
        submitLabel: "Send",
        fields: [
          {
            type: "text",
            label: "Name",
            placeholder: "Your name",
            required: true,
          },
          { type: "email", label: "Email", required: true },
          { type: "textarea", label: "Message" },
          {
            type: "select",
            label: "Subject",
            options: ["Support", "Sales"],
          },
          { type: "checkbox", label: "I agree" },
        ],
      });
      expect(result.success).toBe(true);
    });

    it("rejects form with empty fields", () => {
      const result = BlockConfigSchema.safeParse({
        blockType: "form",
        fields: [],
      });
      expect(result.success).toBe(false);
    });

    it("rejects form with invalid field type", () => {
      const result = BlockConfigSchema.safeParse({
        blockType: "form",
        fields: [{ type: "invalid", label: "Test" }],
      });
      expect(result.success).toBe(false);
    });
  });

  it("rejects unknown blockType", () => {
    const result = BlockConfigSchema.safeParse({
      blockType: "unknown",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing blockType", () => {
    const result = BlockConfigSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
