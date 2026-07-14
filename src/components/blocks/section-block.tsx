import { BlockRenderer } from "./block-renderer";
import type { PageBlock } from "@/schemas/page-block";

type BlockWithChildren = PageBlock & { children?: PageBlock[] };

interface SectionBlockProps {
  block: BlockWithChildren;
}

export function SectionBlock({ block }: SectionBlockProps) {
  const config = block.config as Record<string, unknown>;
  return (
    <section>
      {config.title ? <h2>{config.title as string}</h2> : null}
      {config.subtitle ? <p>{config.subtitle as string}</p> : null}
      {block.children && block.children.length > 0 && (
        <BlockRenderer blocks={block.children} />
      )}
    </section>
  );
}
