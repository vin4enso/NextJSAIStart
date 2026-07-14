import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BlockForm } from "./block-form";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      "heading.text": "Text",
      "heading.level": "Level",
      "heading.alignment": "Alignment",
      "paragraph.html": "Content",
      "paragraph.alignment": "Alignment",
      "image.src": "Image URL",
      "image.alt": "Alt Text",
      "cta.title": "Title",
      "cta.buttonText": "Button Text",
      "cta.buttonUrl": "Button URL",
      "cta.buttonVariant": "Variant",
      "section.title": "Title",
      "columns.columnsCount": "Columns",
      "faq.items": "FAQ Items",
      "divider.style": "Style",
      "divider.color": "Color",
      "video.url": "Video URL",
      "gallery.images": "Images",
      "gallery.layout": "Layout",
      "pricing.plans": "Plans",
      "form.fields": "Fields",
      "form.submitLabel": "Submit Label",
      blockType: "Block Type",
      left: "Left",
      center: "Center",
      right: "Right",
      solid: "Solid",
      dashed: "Dashed",
      dotted: "Dotted",
      cover: "Cover",
      contain: "Contain",
      fill: "Fill",
      primary: "Primary",
      secondary: "Secondary",
      outline: "Outline",
      grid: "Grid",
      masonry: "Masonry",
      carousel: "Carousel",
    };
    return translations[key] ?? key;
  },
}));

describe("BlockForm", () => {
  it("renders fields for heading block type", () => {
    render(
      <BlockForm
        blockType="heading"
        defaultValues={{ text: "Hello", level: 2, alignment: "center" }}
        onSubmit={vi.fn()}
      />,
    );
    expect(screen.getByLabelText("Text")).toBeInTheDocument();
    expect(screen.getByLabelText("Level")).toBeInTheDocument();
    expect(screen.getByLabelText("Alignment")).toBeInTheDocument();
  });

  it("renders fields for paragraph block type", () => {
    render(
      <BlockForm
        blockType="paragraph"
        defaultValues={{ html: "<p>text</p>", alignment: "left" }}
        onSubmit={vi.fn()}
      />,
    );
    expect(screen.getByLabelText("Content")).toBeInTheDocument();
    expect(screen.getByLabelText("Alignment")).toBeInTheDocument();
  });

  it("renders fields for image block type", () => {
    render(
      <BlockForm
        blockType="image"
        defaultValues={{ src: "", alt: "" }}
        onSubmit={vi.fn()}
      />,
    );
    expect(screen.getByLabelText("Image URL")).toBeInTheDocument();
    expect(screen.getByLabelText("Alt Text")).toBeInTheDocument();
  });

  it("renders fields for cta block type", () => {
    render(
      <BlockForm
        blockType="cta"
        defaultValues={{ buttonText: "Click", buttonUrl: "https://" }}
        onSubmit={vi.fn()}
      />,
    );
    expect(screen.getByLabelText("Button Text")).toBeInTheDocument();
    expect(screen.getByLabelText("Button URL")).toBeInTheDocument();
  });

  it("calls onSubmit with valid data", async () => {
    const onSubmit = vi.fn();
    render(
      <BlockForm
        blockType="heading"
        defaultValues={{ text: "Hello", level: 1 }}
        onSubmit={onSubmit}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /save/i }));
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("does not call onSubmit with invalid data", async () => {
    const onSubmit = vi.fn();
    render(
      <BlockForm
        blockType="heading"
        defaultValues={{ text: "", level: 1 }}
        onSubmit={onSubmit}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /save/i }));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
