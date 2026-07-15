const headingTags = {
  1: "h1",
  2: "h2",
  3: "h3",
  4: "h4",
} as const;

interface HeadingBlockProps {
  text: string;
  level?: number;
  alignment?: "left" | "center" | "right";
}

export function HeadingBlock({ text, level, alignment }: HeadingBlockProps) {
  const Tag = headingTags[(level as keyof typeof headingTags) ?? 2] ?? "h2";
  return (
    <Tag className={alignment ? `text-${alignment}` : undefined}>{text}</Tag>
  );
}
