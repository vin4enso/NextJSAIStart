import { z } from "zod";

export const PageSchema = z.object({
  id: z.string(),
  sectionId: z.string().nullable().optional(),
  title: z.string().min(1, "Required"),
  slug: z
    .string()
    .min(1, "Required")
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
  content: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  isPublished: z.boolean().default(false),
  isHome: z.boolean().default(false),
  publishedAt: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable().optional(),
});

export const CreatePageSchema = PageSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  publishedAt: true,
});

export const UpdatePageSchema = CreatePageSchema.partial();

export type Page = z.infer<typeof PageSchema>;
export type CreatePageDTO = z.infer<typeof CreatePageSchema>;
export type UpdatePageDTO = z.infer<typeof UpdatePageSchema>;
