import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorDisplay } from "./error-display";

describe("ErrorDisplay", () => {
  it("renders default error message", () => {
    render(<ErrorDisplay />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("renders custom message", () => {
    render(<ErrorDisplay message="Failed to load" />);
    expect(screen.getByText("Failed to load")).toBeInTheDocument();
  });

  it("renders retry button and calls onRetry", async () => {
    const onRetry = vi.fn();
    render(<ErrorDisplay onRetry={onRetry} />);
    const button = screen.getByText("Try again");
    await userEvent.click(button);
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
