import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BlockCard } from "./block-card";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      heading: "Heading",
      paragraph: "Paragraph",
      columns: "Columns",
    };
    return translations[key] ?? key;
  },
}));

describe("BlockCard", () => {
  it("renders block type and config preview", () => {
    render(
      <BlockCard
        block={{
          id: "1",
          pageId: "page-1",
          blockType: "heading",
          sortOrder: 0,
          config: { text: "Hello World", level: 1 },
          createdAt: "",
          updatedAt: "",
        }}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText("Heading")).toBeInTheDocument();
    expect(screen.getByText(/Hello World/)).toBeInTheDocument();
  });

  it("renders children blocks", () => {
    render(
      <BlockCard
        block={{
          id: "1",
          pageId: "page-1",
          blockType: "columns",
          sortOrder: 0,
          config: { columnsCount: 2 },
          createdAt: "",
          updatedAt: "",
          children: [
            {
              id: "2",
              pageId: "page-1",
              blockType: "paragraph",
              sortOrder: 0,
              config: { html: "<p>child</p>" },
              createdAt: "",
              updatedAt: "",
            },
          ],
        }}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText(/child/)).toBeInTheDocument();
  });

  it("calls onEdit when edit button is clicked", async () => {
    const onEdit = vi.fn();
    const { container } = render(
      <BlockCard
        block={{
          id: "1",
          pageId: "page-1",
          blockType: "heading",
          sortOrder: 0,
          config: { text: "Hello" },
          createdAt: "",
          updatedAt: "",
        }}
        onEdit={onEdit}
        onDelete={vi.fn()}
      />,
    );
    const buttons = container.querySelectorAll("button");
    await userEvent.click(buttons[0]);
    expect(onEdit).toHaveBeenCalledWith("1");
  });

  it("calls onDelete when delete button is clicked", async () => {
    const onDelete = vi.fn();
    const { container } = render(
      <BlockCard
        block={{
          id: "1",
          pageId: "page-1",
          blockType: "heading",
          sortOrder: 0,
          config: { text: "Hello" },
          createdAt: "",
          updatedAt: "",
        }}
        onEdit={vi.fn()}
        onDelete={onDelete}
      />,
    );
    const buttons = container.querySelectorAll("button");
    await userEvent.click(buttons[1]);
    expect(onDelete).toHaveBeenCalledWith("1");
  });
});
