import type { PageBlock } from "@/schemas/page-block";

type BlockWithChildren = PageBlock & { children?: PageBlock[] };

interface PricingBlockProps {
  block: BlockWithChildren;
}

export function PricingBlock({ block }: PricingBlockProps) {
  const config = block.config as Record<string, unknown>;
  const plans = config.plans as
    | Array<{
        name: string;
        price: number;
        currency?: string;
        period?: string;
        features?: string[];
      }>
    | undefined;
  return (
    <div className="grid grid-cols-3 gap-4">
      {plans?.map((plan, i) => (
        <div key={i} className="rounded-lg border p-4">
          <h3>{plan.name}</h3>
          <p>
            {plan.currency ?? "$"}
            {plan.price}
            {plan.period ? `/${plan.period}` : ""}
          </p>
          {plan.features && (
            <ul>
              {plan.features.map((f, j) => (
                <li key={j}>{f}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
