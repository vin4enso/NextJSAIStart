import type { PageBlock } from "@/schemas/page-block";

type BlockWithChildren = PageBlock & { children?: PageBlock[] };

interface HeadingBlockProps {
  block: BlockWithChildren;
}

const headingTags = {
  1: "h1",
  2: "h2",
  3: "h3",
  4: "h4",
  5: "h5",
  6: "h6",
} as const;

export function HeadingBlock({ block }: HeadingBlockProps) {
  const config = block.config as Record<string, unknown>;
  const level = (config.level as number) ?? 2;
  const Tag = headingTags[level as keyof typeof headingTags] ?? "h2";
  const alignment = config.alignment as string | undefined;
  return (
    <Tag className={alignment ? `text-${alignment}` : undefined}>
      {config.text as string}
    </Tag>
  );
}
