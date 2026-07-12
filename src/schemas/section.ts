import { z } from "zod";

export const SectionSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Required"),
  slug: z
    .string()
    .min(1, "Required")
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  content: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  sortOrder: z.number().default(0),
  isPublished: z.boolean().default(true),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateSectionSchema = SectionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateSectionSchema = CreateSectionSchema.partial();

export type Section = z.infer<typeof SectionSchema>;
export type CreateSectionDTO = z.infer<typeof CreateSectionSchema>;
export type UpdateSectionDTO = z.infer<typeof UpdateSectionSchema>;
