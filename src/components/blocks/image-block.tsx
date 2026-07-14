import type { PageBlock } from "@/schemas/page-block";

type BlockWithChildren = PageBlock & { children?: PageBlock[] };

interface ImageBlockProps {
  block: BlockWithChildren;
}

export function ImageBlock({ block }: ImageBlockProps) {
  const config = block.config as Record<string, unknown>;
  return (
    <figure>
      <img
        src={config.src as string}
        alt={config.alt as string}
        className={
          config.sizing ? `object-${config.sizing as string}` : undefined
        }
      />
      {config.caption ? (
        <figcaption>{config.caption as string}</figcaption>
      ) : null}
    </figure>
  );
}
