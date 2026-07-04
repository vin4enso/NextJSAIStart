import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmDelete } from "./confirm-delete";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, string>) => {
    const translations: Record<string, string> = {
      confirmDelete: "Confirm Deletion",
      deleteWarning: `Are you sure you want to delete ${params?.name ?? ""}? This action cannot be undone.`,
      cancel: "Cancel",
      delete: "Delete",
    };
    if (key === "deleteWarning" && params?.name) {
      return `Are you sure you want to delete ${params.name}? This action cannot be undone.`;
    }
    return translations[key] ?? key;
  },
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));

describe("ConfirmDelete", () => {
  const defaultProps = {
    open: true,
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
    entityName: "User",
  };

  it("renders dialog with entity name", () => {
    render(<ConfirmDelete {...defaultProps} />);
    expect(screen.getByText("Confirm Deletion")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Are you sure you want to delete User? This action cannot be undone.",
      ),
    ).toBeInTheDocument();
  });

  it("calls onConfirm when delete button is clicked", async () => {
    const onConfirm = vi.fn();
    render(<ConfirmDelete {...defaultProps} onConfirm={onConfirm} />);
    await userEvent.click(screen.getByText("Delete"));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("calls onCancel when cancel button is clicked", async () => {
    const onCancel = vi.fn();
    render(<ConfirmDelete {...defaultProps} onCancel={onCancel} />);
    await userEvent.click(screen.getByText("Cancel"));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("disables buttons when isLoading", () => {
    render(<ConfirmDelete {...defaultProps} isLoading />);
    expect(screen.getByText("Delete")).toBeDisabled();
    expect(screen.getByText("Cancel")).toBeDisabled();
  });
});
