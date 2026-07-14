import type { PageBlock } from "@/schemas/page-block";

type BlockWithChildren = PageBlock & { children?: PageBlock[] };

interface ParagraphBlockProps {
  block: BlockWithChildren;
}

export function ParagraphBlock({ block }: ParagraphBlockProps) {
  const config = block.config as Record<string, unknown>;
  return (
    <div
      className={
        config.alignment ? `text-${config.alignment as string}` : undefined
      }
      dangerouslySetInnerHTML={{ __html: config.html as string }}
    />
  );
}
