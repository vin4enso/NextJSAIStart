import { render, screen } from "@testing-library/react";
import { ImageBlock } from "./image-block";

describe("ImageBlock", () => {
  it("renders image with src and alt", () => {
    render(<ImageBlock src="/test.jpg" alt="Test image" />);
    const img = screen.getByAltText("Test image") as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toContain("/test.jpg");
  });

  it("renders caption when provided", () => {
    render(<ImageBlock src="/test.jpg" alt="Test" caption="A caption" />);
    expect(screen.getByText("A caption")).toBeInTheDocument();
  });

  it("does not render caption when not provided", () => {
    const { container } = render(<ImageBlock src="/test.jpg" alt="Test" />);
    expect(container.querySelector("figcaption")).not.toBeInTheDocument();
  });
});
