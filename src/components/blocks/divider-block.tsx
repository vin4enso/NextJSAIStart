import type { PageBlock } from "@/schemas/page-block";

type BlockWithChildren = PageBlock & { children?: PageBlock[] };

interface DividerBlockProps {
  block: BlockWithChildren;
}

export function DividerBlock({ block }: DividerBlockProps) {
  const config = block.config as Record<string, unknown>;
  return (
    <hr
      style={{
        borderStyle: (config.style as string) ?? "solid",
        borderColor: (config.color as string) ?? undefined,
        borderWidth: config.thickness
          ? `${config.thickness as number}px`
          : undefined,
      }}
    />
  );
}
