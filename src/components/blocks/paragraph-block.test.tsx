import { render, screen } from "@testing-library/react";
import { ParagraphBlock } from "./paragraph-block";

describe("ParagraphBlock", () => {
  it("renders HTML content", () => {
    render(<ParagraphBlock html="<strong>Bold</strong> text" />);
    expect(screen.getByText("Bold")).toBeInTheDocument();
    expect(screen.getByText("text")).toBeInTheDocument();
  });

  it("applies alignment class", () => {
    const { container } = render(
      <ParagraphBlock html="Aligned text" alignment="center" />,
    );
    expect(container.firstChild).toHaveClass("text-center");
  });

  it("renders without alignment class when not set", () => {
    const { container } = render(<ParagraphBlock html="Plain text" />);
    expect(container.firstChild).not.toHaveClass("text-center");
  });
});
