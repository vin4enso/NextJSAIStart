import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BlockEditor } from "./block-editor";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      "blockEditor.title": "Page Editor",
      "blockEditor.addBlock": "Add Block",
      "blockEditor.back": "Back to Pages",
      "blockEditor.noBlocks": 'No blocks yet. Click "Add Block" to start.',
      "blockPicker.title": "Add Block",
      "blockPicker.cancel": "Cancel",
      heading: "Heading",
      paragraph: "Paragraph",
      image: "Image",
      section: "Section",
      columns: "Columns",
      column: "Column",
      faq: "FAQ",
      divider: "Divider",
      video: "Video",
      gallery: "Gallery",
      pricing: "Pricing",
      form: "Form",
      cta: "CTA",
      "blockForm.title": "Block Config",
      "blockForm.save": "Save",
      "blockForm.cancel": "Cancel",
    };
    return translations[key] ?? key;
  },
}));

const mockBlocks = [
  {
    id: "b1",
    pageId: "p1",
    blockType: "heading" as const,
    sortOrder: 0,
    config: { text: "Hello World", level: 1 },
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "b2",
    pageId: "p1",
    blockType: "paragraph" as const,
    sortOrder: 1,
    config: { html: "<p>Some text</p>" },
    createdAt: "",
    updatedAt: "",
  },
];

describe("BlockEditor", () => {
  it("renders block tree", async () => {
    render(<BlockEditor pageId="p1" initialBlocks={mockBlocks} />);
    await waitFor(() => {
      expect(screen.getByText("Heading")).toBeInTheDocument();
      expect(screen.getByText("Paragraph")).toBeInTheDocument();
    });
  });

  it("shows empty state when no blocks", () => {
    render(<BlockEditor pageId="p1" initialBlocks={[]} />);
    expect(screen.getByText(/No blocks yet/)).toBeInTheDocument();
  });

  it("opens block picker when Add Block is clicked", async () => {
    render(<BlockEditor pageId="p1" initialBlocks={[]} />);
    await userEvent.click(screen.getByText("Add Block"));
    expect(screen.getByText("Heading")).toBeInTheDocument();
  });
});
