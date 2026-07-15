import { render, screen } from "@testing-library/react";
import { SectionBlock } from "./section-block";

describe("SectionBlock", () => {
  it("renders title and subtitle", () => {
    render(<SectionBlock title="Section" subtitle="Subtext" />);
    expect(screen.getByText("Section")).toBeInTheDocument();
    expect(screen.getByText("Subtext")).toBeInTheDocument();
  });

  it("renders children", () => {
    render(
      <SectionBlock title="Section">
        <p>Child content</p>
      </SectionBlock>,
    );
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("renders without title and subtitle", () => {
    const { container } = render(
      <SectionBlock>
        <p>Only child</p>
      </SectionBlock>,
    );
    expect(container.querySelector("section")).toBeInTheDocument();
    expect(screen.getByText("Only child")).toBeInTheDocument();
  });
});
