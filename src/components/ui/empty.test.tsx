import { render, screen } from "@testing-library/react";
import { Empty } from "./empty";

describe("Empty", () => {
  it("renders default title", () => {
    render(<Empty />);
    expect(screen.getByText("No data")).toBeInTheDocument();
  });

  it("renders custom title", () => {
    render(<Empty title="No users found" />);
    expect(screen.getByText("No users found")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(<Empty title="Empty" description="Nothing to show here" />);
    expect(screen.getByText("Nothing to show here")).toBeInTheDocument();
  });
});
