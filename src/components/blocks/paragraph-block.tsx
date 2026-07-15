interface ParagraphBlockProps {
  html: string;
  alignment?: "left" | "center" | "right";
}

export function ParagraphBlock({ html, alignment }: ParagraphBlockProps) {
  return (
    <div
      className={alignment ? `text-${alignment}` : undefined}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
