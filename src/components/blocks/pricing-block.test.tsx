import { render, screen } from "@testing-library/react";
import { PricingBlock } from "./pricing-block";

describe("PricingBlock", () => {
  it("renders pricing plans", () => {
    render(
      <PricingBlock
        plans={[
          {
            name: "Basic",
            price: 10,
            currency: "$",
            period: "month",
            features: "",
          },
        ]}
      />,
    );
    expect(screen.getByText("Basic")).toBeInTheDocument();
    expect(screen.getByText(/10/)).toBeInTheDocument();
  });

  it("renders multiple plans", () => {
    render(
      <PricingBlock
        plans={[
          {
            name: "Free",
            price: 0,
            currency: "$",
            period: "month",
            features: "",
          },
          {
            name: "Pro",
            price: 29,
            currency: "$",
            period: "month",
            features: "",
          },
        ]}
      />,
    );
    expect(screen.getByText("Free")).toBeInTheDocument();
    expect(screen.getByText("Pro")).toBeInTheDocument();
  });
});
