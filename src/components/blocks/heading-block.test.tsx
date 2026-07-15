import { render, screen } from "@testing-library/react";
import { HeadingBlock } from "./heading-block";

describe("HeadingBlock", () => {
  it("renders heading with given text, level, and alignment", () => {
    render(<HeadingBlock text="Hello World" level={1} alignment="center" />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Hello World");
    expect(heading.className).toContain("text-center");
  });

  it("renders with default level 2 when level is not provided", () => {
    render(<HeadingBlock text="Default Level" />);
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
  });

  it("renders without alignment class when alignment is not set", () => {
    render(<HeadingBlock text="No Alignment" />);
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading.className).toBeFalsy();
  });
});
