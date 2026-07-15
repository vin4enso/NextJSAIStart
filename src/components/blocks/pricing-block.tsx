interface PricingPlan {
  name: string;
  price: number;
  currency?: string;
  period?: string;
  features: string;
  ctaText?: string;
  ctaUrl?: string;
}

interface PricingBlockProps {
  plans: PricingPlan[];
}

export function PricingBlock({ plans }: PricingBlockProps) {
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
          {plan.features ? (
            <ul>
              {plan.features.split("\n").map((f, j) => (
                <li key={j}>{f}</li>
              ))}
            </ul>
          ) : null}
          {plan.ctaText && plan.ctaUrl ? (
            <a href={plan.ctaUrl}>{plan.ctaText}</a>
          ) : null}
        </div>
      ))}
    </div>
  );
}
