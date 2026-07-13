import { z } from "zod";

export const BLOCK_TYPES = [
  "section",
  "heading",
  "paragraph",
  "image",
  "cta",
  "columns",
  "column",
  "faq",
  "divider",
  "video",
  "gallery",
  "pricing",
  "form",
] as const;

export const BlockTypeEnum = z.enum(BLOCK_TYPES);

const BaseBlockConfig = z.object({
  paddingTop: z.number().optional(),
  paddingBottom: z.number().optional(),
  backgroundColor: z.string().optional(),
});

const SectionBlockConfig = BaseBlockConfig.extend({
  blockType: z.literal("section"),
  title: z.string().optional(),
  subtitle: z.string().optional(),
});

const HeadingBlockConfig = BaseBlockConfig.extend({
  blockType: z.literal("heading"),
  text: z.string().min(1, "Required"),
  level: z.number().int().min(1).max(4),
  alignment: z.enum(["left", "center", "right"]).optional(),
});

const ParagraphBlockConfig = BaseBlockConfig.extend({
  blockType: z.literal("paragraph"),
  html: z.string().min(1, "Required"),
  alignment: z.enum(["left", "center", "right"]).optional(),
});

const ImageBlockConfig = BaseBlockConfig.extend({
  blockType: z.literal("image"),
  src: z.string().min(1, "Required"),
  alt: z.string().min(1, "Required"),
  caption: z.string().optional(),
  sizing: z.enum(["cover", "contain", "fill"]).optional(),
});

const CtaBlockConfig = BaseBlockConfig.extend({
  blockType: z.literal("cta"),
  title: z.string().optional(),
  description: z.string().optional(),
  buttonText: z.string().min(1, "Required"),
  buttonUrl: z.string().min(1, "Required"),
  buttonVariant: z.enum(["primary", "secondary", "outline"]).optional(),
});

const ColumnsBlockConfig = BaseBlockConfig.extend({
  blockType: z.literal("columns"),
  columnsCount: z.number().int().min(1).max(4),
});

const ColumnBlockConfig = BaseBlockConfig.extend({
  blockType: z.literal("column"),
  width: z.number().min(1).optional(),
});

const FaqBlockConfig = BaseBlockConfig.extend({
  blockType: z.literal("faq"),
  items: z
    .array(
      z.object({
        question: z.string().min(1, "Required"),
        answer: z.string().min(1, "Required"),
      }),
    )
    .min(1, "At least one item required"),
});

const DividerBlockConfig = BaseBlockConfig.extend({
  blockType: z.literal("divider"),
  style: z.enum(["solid", "dashed", "dotted"]).optional(),
  color: z.string().optional(),
  thickness: z.number().min(1).optional(),
});

const VideoBlockConfig = BaseBlockConfig.extend({
  blockType: z.literal("video"),
  url: z.string().min(1, "Required"),
  autoplay: z.boolean().optional(),
  controls: z.boolean().optional(),
});

const GalleryBlockConfig = BaseBlockConfig.extend({
  blockType: z.literal("gallery"),
  images: z
    .array(
      z.object({
        src: z.string().min(1, "Required"),
        alt: z.string().min(1, "Required"),
      }),
    )
    .min(1, "At least one image required"),
  layout: z.enum(["grid", "masonry", "carousel"]).optional(),
});

const PricingBlockConfig = BaseBlockConfig.extend({
  blockType: z.literal("pricing"),
  plans: z
    .array(
      z.object({
        name: z.string().min(1, "Required"),
        price: z.number().min(0),
        currency: z.string().optional(),
        period: z.string().optional(),
        features: z.array(z.string()).default([]),
        cta: z
          .object({
            text: z.string().min(1, "Required"),
            url: z.string().min(1, "Required"),
          })
          .optional(),
      }),
    )
    .min(1, "At least one plan required"),
});

const FormBlockConfig = BaseBlockConfig.extend({
  blockType: z.literal("form"),
  fields: z
    .array(
      z.object({
        type: z.enum(["text", "email", "textarea", "select", "checkbox"]),
        label: z.string().min(1, "Required"),
        placeholder: z.string().optional(),
        required: z.boolean().optional(),
        options: z.array(z.string()).optional(),
      }),
    )
    .min(1, "At least one field required"),
  submitLabel: z.string().optional(),
});

export const BlockConfigSchema = z.discriminatedUnion("blockType", [
  SectionBlockConfig,
  HeadingBlockConfig,
  ParagraphBlockConfig,
  ImageBlockConfig,
  CtaBlockConfig,
  ColumnsBlockConfig,
  ColumnBlockConfig,
  FaqBlockConfig,
  DividerBlockConfig,
  VideoBlockConfig,
  GalleryBlockConfig,
  PricingBlockConfig,
  FormBlockConfig,
]);

export const PageBlockSchema = z.object({
  id: z.string(),
  pageId: z.string(),
  parentId: z.string().nullable().optional(),
  blockType: BlockTypeEnum,
  sortOrder: z.number().default(0),
  config: BlockConfigSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateBlockDTOSchema = z.object({
  pageId: z.string(),
  parentId: z.string().nullable().optional(),
  blockType: BlockTypeEnum,
  sortOrder: z.number().default(0),
  config: BlockConfigSchema,
});

export const UpdateBlockDTOSchema = z.object({
  parentId: z.string().nullable().optional(),
  sortOrder: z.number().optional(),
  config: BlockConfigSchema.optional(),
});

export type PageBlock = z.infer<typeof PageBlockSchema>;
export type CreateBlockDTO = z.infer<typeof CreateBlockDTOSchema>;
export type UpdateBlockDTO = z.infer<typeof UpdateBlockDTOSchema>;
export type BlockConfig = z.infer<typeof BlockConfigSchema>;
export type BlockType = z.infer<typeof BlockTypeEnum>;
