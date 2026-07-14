import { BlockRenderer } from "./block-renderer";
import type { PageBlock } from "@/schemas/page-block";

type BlockWithChildren = PageBlock & { children?: BlockWithChildren[] };

interface ColumnsBlockProps {
  block: BlockWithChildren;
}

export function ColumnsBlock({ block }: ColumnsBlockProps) {
  const config = block.config as Record<string, unknown>;
  const columnsCount = (config.columnsCount as number) ?? 2;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columnsCount}, 1fr)`,
        gap: "1rem",
      }}
    >
      {block.children && block.children.length > 0 ? (
        <BlockRenderer blocks={block.children} />
      ) : (
        Array.from({ length: columnsCount }, (_, i) => <div key={i} />)
      )}
    </div>
  );
}
