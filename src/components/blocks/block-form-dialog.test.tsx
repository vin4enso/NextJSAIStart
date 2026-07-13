import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BlockFormDialog } from "./block-form-dialog";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      "blockForm.title": "Block Config",
      "blockForm.save": "Save",
      "blockForm.cancel": "Cancel",
    };
    return translations[key] ?? key;
  },
}));

vi.mock("./block-form", () => ({
  BlockForm: vi.fn(() => <div data-testid="block-form" />),
}));

describe("BlockFormDialog", () => {
  it("renders dialog with form", () => {
    render(
      <BlockFormDialog
        open={true}
        onClose={vi.fn()}
        blockType="heading"
        defaultValues={{ text: "" }}
        onSubmit={vi.fn()}
      />,
    );
    expect(screen.getByTestId("block-form")).toBeInTheDocument();
  });

  it("calls onClose when cancel is clicked", async () => {
    const onClose = vi.fn();
    render(
      <BlockFormDialog
        open={true}
        onClose={onClose}
        blockType="heading"
        defaultValues={{}}
        onSubmit={vi.fn()}
      />,
    );
    await userEvent.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
