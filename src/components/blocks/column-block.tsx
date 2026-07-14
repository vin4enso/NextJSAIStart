import { BlockRenderer } from "./block-renderer";
import type { PageBlock } from "@/schemas/page-block";

type BlockWithChildren = PageBlock & { children?: PageBlock[] };

interface ColumnBlockProps {
  block: BlockWithChildren;
}

export function ColumnBlock({ block }: ColumnBlockProps) {
  return (
    <div>
      {block.children && block.children.length > 0 ? (
        <BlockRenderer blocks={block.children} />
      ) : null}
    </div>
  );
}
