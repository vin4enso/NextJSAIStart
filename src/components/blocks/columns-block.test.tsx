import { render, screen } from "@testing-library/react";
import { ColumnsBlock } from "./columns-block";

describe("ColumnsBlock", () => {
  it("renders with given columnsCount", () => {
    const { container } = render(<ColumnsBlock columnsCount={3} />);
    const div = container.firstChild as HTMLElement;
    expect(div).toBeInTheDocument();
    expect(div.style.gridTemplateColumns).toBe("repeat(3, 1fr)");
  });

  it("renders children", () => {
    render(
      <ColumnsBlock columnsCount={2}>
        <div>Col 1</div>
        <div>Col 2</div>
      </ColumnsBlock>,
    );
    expect(screen.getByText("Col 1")).toBeInTheDocument();
    expect(screen.getByText("Col 2")).toBeInTheDocument();
  });
});
