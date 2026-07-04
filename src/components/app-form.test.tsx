import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppForm } from "./app-form";

describe("AppForm", () => {
  it("renders children", () => {
    render(
      <AppForm>
        <input />
        <button type="submit">Submit</button>
      </AppForm>,
    );
    expect(screen.getByText("Submit")).toBeInTheDocument();
  });

  it("calls onSubmit when submitted", async () => {
    const onSubmit = vi.fn((e) => e.preventDefault());
    render(
      <AppForm onSubmit={onSubmit}>
        <button type="submit">Submit</button>
      </AppForm>,
    );
    await userEvent.click(screen.getByText("Submit"));
    expect(onSubmit).toHaveBeenCalledOnce();
  });
});
