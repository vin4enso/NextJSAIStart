import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { pages, sections } from "@/drizzle/schema";
import {
  eq,
  like,
  and,
  or,
  count,
  isNull,
  desc,
  ne,
  type SQL,
} from "drizzle-orm";
import type { CreatePageDTO, UpdatePageDTO } from "@/schemas/page";

export const pageService = {
  async list(
    params: {
      page?: number;
      pageSize?: number;
      search?: string;
      sectionId?: string;
    } = {},
  ) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;
    const offset = (page - 1) * pageSize;

    const conditions: (SQL | undefined)[] = [isNull(pages.deletedAt)];
    if (params.search) {
      conditions.push(
        or(
          like(pages.title, `%${params.search}%`),
          like(pages.slug, `%${params.search}%`),
        ),
      );
    }
    if (params.sectionId !== undefined) {
      conditions.push(eq(pages.sectionId, params.sectionId));
    }

    const [totalResult] = await db
      .select({ count: count() })
      .from(pages)
      .where(and(...(conditions.filter(Boolean) as SQL[])));

    const total = totalResult.count;
    const totalPages = Math.ceil(total / pageSize);

    const rows = await db
      .select()
      .from(pages)
      .where(and(...(conditions.filter(Boolean) as SQL[])))
      .orderBy(desc(pages.createdAt))
      .limit(pageSize)
      .offset(offset);

    const items = await Promise.all(
      rows.map(async (row) => {
        let sectionName: string | null = null;
        if (row.sectionId) {
          const [section] = await db
            .select({ name: sections.name })
            .from(sections)
            .where(eq(sections.id, row.sectionId))
            .limit(1);
          sectionName = section?.name ?? null;
        }
        return { ...row, sectionName };
      }),
    );

    return { items, total, page, pageSize, totalPages };
  },

  async getById(id: string) {
    const [row] = await db
      .select()
      .from(pages)
      .where(and(eq(pages.id, id), isNull(pages.deletedAt)))
      .limit(1);
    if (!row) return null;

    let sectionName: string | null = null;
    if (row.sectionId) {
      const [section] = await db
        .select({ name: sections.name })
        .from(sections)
        .where(eq(sections.id, row.sectionId))
        .limit(1);
      sectionName = section?.name ?? null;
    }

    return { ...row, sectionName };
  },

  async getBySlug(slug: string) {
    const [row] = await db
      .select()
      .from(pages)
      .where(
        and(
          eq(pages.slug, slug),
          isNull(pages.sectionId),
          isNull(pages.deletedAt),
        ),
      )
      .limit(1);
    return row || null;
  },

  async getBySectionAndSlug(sectionSlug: string, pageSlug: string) {
    const [section] = await db
      .select({ id: sections.id })
      .from(sections)
      .where(eq(sections.slug, sectionSlug))
      .limit(1);
    if (!section) return null;

    const [row] = await db
      .select()
      .from(pages)
      .where(
        and(
          eq(pages.sectionId, section.id),
          eq(pages.slug, pageSlug),
          isNull(pages.deletedAt),
        ),
      )
      .limit(1);
    return row || null;
  },

  async getHome() {
    const [row] = await db
      .select()
      .from(pages)
      .where(and(eq(pages.isHome, true), isNull(pages.deletedAt)))
      .limit(1);
    return row || null;
  },

  async create(data: CreatePageDTO) {
    const id = randomUUID();
    const now = new Date().toISOString();

    const slugExists = data.sectionId
      ? await this.checkSlugInSection(data.slug, data.sectionId)
      : await this.checkRootSlug(data.slug);
    if (slugExists) return null;

    if (data.isHome) {
      await db
        .update(pages)
        .set({ isHome: false })
        .where(eq(pages.isHome, true))
        .run();
    }

    await db
      .insert(pages)
      .values({
        id,
        sectionId: data.sectionId ?? null,
        title: data.title,
        slug: data.slug,
        content: data.content ?? null,
        metaTitle: data.metaTitle ?? null,
        metaDescription: data.metaDescription ?? null,
        isPublished: data.isPublished ?? false,
        isHome: data.isHome ?? false,
        publishedAt: data.isPublished ? now : null,
        createdAt: now,
        updatedAt: now,
      })
      .run();

    return this.getById(id);
  },

  async update(id: string, data: UpdatePageDTO) {
    const now = new Date().toISOString();
    const existing = await this.getById(id);
    if (!existing) return null;

    if (data.slug) {
      const slugExists = data.sectionId
        ? await this.checkSlugInSection(data.slug, data.sectionId, id)
        : await this.checkRootSlug(data.slug, id);
      if (slugExists) return null;
    }

    if (data.isHome) {
      await db
        .update(pages)
        .set({ isHome: false })
        .where(and(eq(pages.isHome, true), eq(pages.id, id)))
        .run();
    }

    const updateData: Record<string, unknown> = { updatedAt: now };
    if (data.title !== undefined) updateData.title = data.title;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.sectionId !== undefined) updateData.sectionId = data.sectionId;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.metaTitle !== undefined) updateData.metaTitle = data.metaTitle;
    if (data.metaDescription !== undefined)
      updateData.metaDescription = data.metaDescription;
    if (data.isPublished !== undefined) {
      updateData.isPublished = data.isPublished;
      if (data.isPublished && !existing.publishedAt) {
        updateData.publishedAt = now;
      }
    }
    if (data.isHome !== undefined) updateData.isHome = data.isHome;

    if (Object.keys(updateData).length > 1) {
      db.update(pages).set(updateData).where(eq(pages.id, id)).run();
    }

    return this.getById(id);
  },

  async delete(id: string) {
    const [row] = await db
      .select({ isHome: pages.isHome })
      .from(pages)
      .where(eq(pages.id, id))
      .limit(1);

    if (!row) return false;
    if (row.isHome) return false;

    const now = new Date().toISOString();
    db.update(pages)
      .set({ deletedAt: now, updatedAt: now })
      .where(eq(pages.id, id))
      .run();
    return true;
  },

  async checkSlugInSection(
    slug: string,
    sectionId: string,
    excludeId?: string,
  ) {
    const conditions = [
      eq(pages.slug, slug),
      eq(pages.sectionId, sectionId),
      isNull(pages.deletedAt),
    ];
    if (excludeId) conditions.push(ne(pages.id, excludeId));

    const [result] = await db
      .select({ count: count() })
      .from(pages)
      .where(and(...conditions));
    return result.count > 0;
  },

  async checkRootSlug(slug: string, excludeId?: string) {
    const conditions = [
      eq(pages.slug, slug),
      isNull(pages.sectionId),
      isNull(pages.deletedAt),
    ];
    if (excludeId) conditions.push(ne(pages.id, excludeId));

    const [result] = await db
      .select({ count: count() })
      .from(pages)
      .where(and(...conditions));
    return result.count > 0;
  },
};
