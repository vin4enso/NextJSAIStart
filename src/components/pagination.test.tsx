import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Pagination } from "./pagination";

vi.mock("next-intl", () => ({
  useTranslations: () => () => "",
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));

describe("Pagination", () => {
  it("renders nothing when totalPages <= 1", () => {
    const { container } = render(
      <Pagination page={1} totalPages={1} onPageChange={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders page buttons", () => {
    render(<Pagination page={1} totalPages={3} onPageChange={vi.fn()} />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("calls onPageChange when clicking a page", async () => {
    const onPageChange = vi.fn();
    render(<Pagination page={1} totalPages={3} onPageChange={onPageChange} />);
    await userEvent.click(screen.getByText("2"));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("disables prev button on first page", () => {
    render(<Pagination page={1} totalPages={3} onPageChange={vi.fn()} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons[0]).toBeDisabled();
  });

  it("disables next button on last page", () => {
    render(<Pagination page={3} totalPages={3} onPageChange={vi.fn()} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons[buttons.length - 1]).toBeDisabled();
  });
});
