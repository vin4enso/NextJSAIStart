import type { PageBlock } from "@/schemas/page-block";

type BlockWithChildren = PageBlock & { children?: PageBlock[] };

interface CtaBlockProps {
  block: BlockWithChildren;
}

export function CtaBlock({ block }: CtaBlockProps) {
  const config = block.config as Record<string, unknown>;
  return (
    <div>
      {config.title ? <h3>{config.title as string}</h3> : null}
      {config.description ? <p>{config.description as string}</p> : null}
      <a href={config.buttonUrl as string}>{config.buttonText as string}</a>
    </div>
  );
}
