import { render, screen } from "@testing-library/react";
import { FaqBlock } from "./faq-block";

describe("FaqBlock", () => {
  it("renders FAQ items", () => {
    render(
      <FaqBlock
        items={[
          { question: "Q1", answer: "A1" },
          { question: "Q2", answer: "A2" },
        ]}
      />,
    );
    expect(screen.getByText("Q1")).toBeInTheDocument();
    expect(screen.getByText("A1")).toBeInTheDocument();
    expect(screen.getByText("Q2")).toBeInTheDocument();
    expect(screen.getByText("A2")).toBeInTheDocument();
  });

  it("renders with empty items array", () => {
    const { container } = render(<FaqBlock items={[]} />);
    expect(container.querySelector("dl")).toBeEmptyDOMElement();
  });
});
