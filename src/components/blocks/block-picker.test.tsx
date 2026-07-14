import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BlockPicker } from "./block-picker";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      "blockPicker.title": "Add Block",
      "blockPicker.cancel": "Cancel",
      heading: "Heading",
      paragraph: "Paragraph",
      image: "Image",
      cta: "CTA",
      section: "Section",
      columns: "Columns",
      column: "Column",
      faq: "FAQ",
      divider: "Divider",
      video: "Video",
      gallery: "Gallery",
      pricing: "Pricing",
      form: "Form",
    };
    return translations[key] ?? key;
  },
}));

describe("BlockPicker", () => {
  it("renders dialog with block type grid", () => {
    render(<BlockPicker open={true} onClose={vi.fn()} onSelect={vi.fn()} />);
    expect(screen.getByText("Heading")).toBeInTheDocument();
    expect(screen.getByText("Paragraph")).toBeInTheDocument();
    expect(screen.getByText("Image")).toBeInTheDocument();
  });

  it("shows all 13 block types", () => {
    render(<BlockPicker open={true} onClose={vi.fn()} onSelect={vi.fn()} />);
    expect(screen.getAllByRole("button").length).toBeGreaterThanOrEqual(13);
  });

  it("calls onSelect with block type when clicked", async () => {
    const onSelect = vi.fn();
    render(<BlockPicker open={true} onClose={vi.fn()} onSelect={onSelect} />);
    await userEvent.click(screen.getByText("Heading"));
    expect(onSelect).toHaveBeenCalledWith("heading");
  });

  it("calls onClose when cancel is clicked", async () => {
    const onClose = vi.fn();
    render(<BlockPicker open={true} onClose={onClose} onSelect={vi.fn()} />);
    await userEvent.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
