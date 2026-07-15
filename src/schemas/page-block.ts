export type BlockType =
  | "heading"
  | "paragraph"
  | "image"
  | "section"
  | "cta"
  | "columns"
  | "column"
  | "faq"
  | "divider"
  | "video"
  | "gallery"
  | "pricing"
  | "form";

export type BlockConfig = Record<string, unknown>;

export interface PageBlock {
  id: string;
  pageId: string;
  parentId: string | null;
  blockType: BlockType;
  sortOrder: number;
  config: BlockConfig;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBlockDTO {
  pageId: string;
  parentId?: string | null;
  blockType: BlockType;
  sortOrder?: number;
  config: BlockConfig;
}

export interface UpdateBlockDTO {
  parentId?: string | null;
  sortOrder?: number;
  config?: BlockConfig;
}
