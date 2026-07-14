import type { PageBlock } from "@/schemas/page-block";

type BlockWithChildren = PageBlock & { children?: PageBlock[] };

interface FaqBlockProps {
  block: BlockWithChildren;
}

export function FaqBlock({ block }: FaqBlockProps) {
  const config = block.config as Record<string, unknown>;
  const items = config.items as
    Array<{ question: string; answer: string }> | undefined;
  return (
    <dl>
      {items?.map((item, i) => (
        <div key={i}>
          <dt>{item.question}</dt>
          <dd>{item.answer}</dd>
        </div>
      ))}
    </dl>
  );
}
