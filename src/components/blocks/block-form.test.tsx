import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BlockForm } from "./block-form";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      heading__text: "Text",
      heading__level: "Level",
      heading__alignment: "Alignment",
      paragraph__html: "Content",
      paragraph__alignment: "Alignment",
      image__src: "Image URL",
      image__alt: "Alt Text",
      cta__title: "Title",
      cta__buttonText: "Button Text",
      cta__buttonUrl: "Button URL",
      cta__buttonVariant: "Variant",
      section__title: "Title",
      columns__columnsCount: "Columns",
      faq__items: "FAQ Items",
      divider__style: "Style",
      divider__color: "Color",
      video__url: "Video URL",
      gallery__images: "Images",
      gallery__layout: "Layout",
      pricing__plans: "Plans",
      form__fields: "Fields",
      form__submitLabel: "Submit Label",
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
