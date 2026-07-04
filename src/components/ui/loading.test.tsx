import { render, screen } from "@testing-library/react";
import { Loading, TableSkeleton } from "./loading";

describe("Loading", () => {
  it("renders spinner by default", () => {
    const { container } = render(<Loading />);
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("renders text when provided", () => {
    render(<Loading text="Loading data..." />);
    expect(screen.getByText("Loading data...")).toBeInTheDocument();
  });
});

describe("TableSkeleton", () => {
  it("renders correct number of rows", () => {
    const { container } = render(<TableSkeleton rows={3} cols={4} />);
    const rows = container.querySelectorAll(".flex.gap-4");
    expect(rows).toHaveLength(3);
  });

  it("renders correct number of columns per row", () => {
    const { container } = render(<TableSkeleton rows={1} cols={5} />);
    const columns = container.querySelectorAll(".flex.gap-4 > div");
    expect(columns).toHaveLength(5);
  });
});
