import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { sections, pages } from "@/drizzle/schema";
import { eq, like, and, count, asc, isNull } from "drizzle-orm";
import type { CreateSectionDTO, UpdateSectionDTO } from "@/schemas/section";

export const sectionService = {
  async list(
    params: { page?: number; pageSize?: number; search?: string } = {},
  ) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 50;
    const offset = (page - 1) * pageSize;

    const where = params.search
      ? like(sections.name, `%${params.search}%`)
      : undefined;

    const [totalResult] = await db
      .select({ count: count() })
      .from(sections)
      .where(where);

    const total = totalResult.count;
    const totalPages = Math.ceil(total / pageSize);

    const items = await db
      .select()
      .from(sections)
      .where(where)
      .orderBy(asc(sections.sortOrder))
      .limit(pageSize)
      .offset(offset);

    const itemsWithPageCount = await Promise.all(
      items.map(async (section) => {
        const [pageCount] = await db
          .select({ count: count() })
          .from(pages)
          .where(and(eq(pages.sectionId, section.id), isNull(pages.deletedAt)));
        return { ...section, pageCount: pageCount.count };
      }),
    );

    return { items: itemsWithPageCount, total, page, pageSize, totalPages };
  },

  async listPublished() {
    return db
      .select()
      .from(sections)
      .where(eq(sections.isPublished, true))
      .orderBy(asc(sections.sortOrder))
      .all();
  },

  async getById(id: string) {
    const [section] = await db
      .select()
      .from(sections)
      .where(eq(sections.id, id))
      .limit(1);
    return section || null;
  },

  async getBySlug(slug: string) {
    const [section] = await db
      .select()
      .from(sections)
      .where(eq(sections.slug, slug))
      .limit(1);
    return section || null;
  },

  async create(data: CreateSectionDTO) {
    const id = randomUUID();
    const now = new Date().toISOString();

    const existing = await this.getBySlug(data.slug);
    if (existing) return null;

    await db
      .insert(sections)
      .values({
        id,
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        content: data.content ?? null,
        metaTitle: data.metaTitle ?? null,
        metaDescription: data.metaDescription ?? null,
        sortOrder: data.sortOrder ?? 0,
        isPublished: data.isPublished ?? true,
        createdAt: now,
        updatedAt: now,
      })
      .run();

    return this.getById(id);
  },

  async update(id: string, data: UpdateSectionDTO) {
    const now = new Date().toISOString();

    if (data.slug) {
      const existing = await this.getBySlug(data.slug);
      if (existing && existing.id !== id) return null;
    }

    const updateData: Record<string, unknown> = { updatedAt: now };
    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.metaTitle !== undefined) updateData.metaTitle = data.metaTitle;
    if (data.metaDescription !== undefined)
      updateData.metaDescription = data.metaDescription;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
    if (data.isPublished !== undefined)
      updateData.isPublished = data.isPublished;

    if (Object.keys(updateData).length > 1) {
      db.update(sections).set(updateData).where(eq(sections.id, id)).run();
    }

    return this.getById(id);
  },

  async hasPages(id: string): Promise<boolean> {
    const [result] = await db
      .select({ count: count() })
      .from(pages)
      .where(and(eq(pages.sectionId, id), isNull(pages.deletedAt)));
    return result.count > 0;
  },

  async delete(id: string) {
    const hasChildren = await this.hasPages(id);
    if (hasChildren) return false;

    db.delete(sections).where(eq(sections.id, id)).run();
    return true;
  },
};
