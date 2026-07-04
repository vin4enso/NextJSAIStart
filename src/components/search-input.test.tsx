import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchInput } from "./search-input";

vi.mock("next-intl", () => ({
  useTranslations: () => () => "Search...",
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));

describe("SearchInput", () => {
  it("renders input with placeholder", () => {
    render(<SearchInput placeholder="Search..." />);
    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
  });

  it("calls onChange after debounce", async () => {
    const onChange = vi.fn();
    render(<SearchInput onChange={onChange} debounceMs={0} />);
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "test");
    expect(onChange).toHaveBeenCalledWith("test");
  });
});
