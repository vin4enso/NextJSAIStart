import type { PageBlock } from "@/schemas/page-block";

type BlockWithChildren = PageBlock & { children?: PageBlock[] };

interface VideoBlockProps {
  block: BlockWithChildren;
}

export function VideoBlock({ block }: VideoBlockProps) {
  const config = block.config as Record<string, unknown>;
  return (
    <div>
      <iframe
        src={config.url as string}
        allow="autoplay; fullscreen"
        allowFullScreen={!!config.controls}
        className="aspect-video w-full"
      />
    </div>
  );
}
