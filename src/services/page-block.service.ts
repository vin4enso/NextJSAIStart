import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { pageBlocks } from "@/drizzle/schema";
import { eq, asc, and, inArray, isNull, type SQL } from "drizzle-orm";
import type {
  CreateBlockDTO,
  UpdateBlockDTO,
  PageBlock,
  BlockConfig,
} from "@/schemas/page-block";
import type { InferSelectModel } from "drizzle-orm";

type PageBlockRow = InferSelectModel<typeof pageBlocks>;

type PageBlockWithChildren = PageBlock & {
  children: PageBlockWithChildren[];
};

function toPageBlock(row: PageBlockRow): PageBlock {
  const config =
    typeof row.config === "string"
      ? (JSON.parse(row.config) as BlockConfig)
      : (row.config as BlockConfig);

  return {
    id: row.id,
    pageId: row.pageId,
    parentId: row.parentId,
    blockType: row.blockType as PageBlock["blockType"],
    sortOrder: row.sortOrder,
    config,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function buildTree(blocks: PageBlockRow[]): PageBlockWithChildren[] {
  const map = new Map<string, PageBlockWithChildren>();
  const roots: PageBlockWithChildren[] = [];

  for (const block of blocks) {
    map.set(block.id, {
      ...toPageBlock(block),
      children: [],
    });
  }

  for (const block of blocks) {
    const node = map.get(block.id)!;
    if (block.parentId && map.has(block.parentId)) {
      map.get(block.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export const pageBlockService = {
  async getTree(pageId: string): Promise<PageBlockWithChildren[]> {
    const blocks = db
      .select()
      .from(pageBlocks)
      .where(eq(pageBlocks.pageId, pageId))
      .orderBy(asc(pageBlocks.sortOrder))
      .all() as PageBlockRow[];

    return buildTree(blocks);
  },

  async create(data: CreateBlockDTO): Promise<PageBlock | null> {
    const id = randomUUID();
    const now = new Date().toISOString();

    const conditions = [eq(pageBlocks.pageId, data.pageId)];
    if (data.parentId) {
      conditions.push(eq(pageBlocks.parentId, data.parentId));
    } else {
      conditions.push(isNull(pageBlocks.parentId));
    }

    const [maxOrder] = db
      .select({ max: pageBlocks.sortOrder })
      .from(pageBlocks)
      .where(and(...(conditions as [SQL])))
      .all() as unknown as { max: number | null }[];

    const sortOrder = data.sortOrder ?? (maxOrder?.max ?? -1) + 1;

    db.insert(pageBlocks)
      .values({
        id,
        pageId: data.pageId,
        parentId: data.parentId ?? null,
        blockType: data.blockType,
        sortOrder,
        config: data.config,
        createdAt: now,
        updatedAt: now,
      })
      .run();

    const [block] = db
      .select()
      .from(pageBlocks)
      .where(eq(pageBlocks.id, id))
      .limit(1)
      .all() as PageBlockRow[];

    return toPageBlock(block);
  },

  async update(id: string, data: UpdateBlockDTO): Promise<PageBlock | null> {
    const now = new Date().toISOString();
    const [existing] = db
      .select()
      .from(pageBlocks)
      .where(eq(pageBlocks.id, id))
      .limit(1)
      .all() as PageBlockRow[];
    if (!existing) return null;

    const updateData: Record<string, unknown> = { updatedAt: now };

    if (data.sortOrder !== undefined) {
      updateData.sortOrder = data.sortOrder;
    }
    if (data.parentId !== undefined) {
      updateData.parentId = data.parentId;
    }
    if (data.config !== undefined) {
      updateData.config = data.config;
    }

    if (Object.keys(updateData).length > 1) {
      db.update(pageBlocks).set(updateData).where(eq(pageBlocks.id, id)).run();
    }

    const [block] = db
      .select()
      .from(pageBlocks)
      .where(eq(pageBlocks.id, id))
      .limit(1)
      .all() as PageBlockRow[];

    return toPageBlock(block);
  },

  async delete(id: string): Promise<boolean> {
    const [existing] = db
      .select({ id: pageBlocks.id })
      .from(pageBlocks)
      .where(eq(pageBlocks.id, id))
      .limit(1)
      .all();
    if (!existing) return false;

    const idsToDelete = [id];
    const children = db
      .select({ id: pageBlocks.id })
      .from(pageBlocks)
      .where(eq(pageBlocks.parentId, id))
      .all() as { id: string }[];

    for (const child of children) {
      idsToDelete.push(child.id);
      const grandChildren = db
        .select({ id: pageBlocks.id })
        .from(pageBlocks)
        .where(eq(pageBlocks.parentId, child.id))
        .all() as { id: string }[];

      for (const gc of grandChildren) {
        idsToDelete.push(gc.id);
      }
    }

    db.delete(pageBlocks).where(inArray(pageBlocks.id, idsToDelete)).run();

    return true;
  },

  async reorder(pageId: string, blockIds: string[]): Promise<boolean> {
    for (let i = 0; i < blockIds.length; i++) {
      db.update(pageBlocks)
        .set({ sortOrder: i, updatedAt: new Date().toISOString() })
        .where(
          and(eq(pageBlocks.id, blockIds[i]), eq(pageBlocks.pageId, pageId)),
        )
        .run();
    }
    return true;
  },
};
