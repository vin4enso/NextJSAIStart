import { render, screen } from "@testing-library/react";
import { DataToolbar } from "./data-toolbar";

describe("DataToolbar", () => {
  it("renders children", () => {
    render(
      <DataToolbar>
        <input placeholder="Search..." />
        <button>Create</button>
      </DataToolbar>,
    );
    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
    expect(screen.getByText("Create")).toBeInTheDocument();
  });
});
