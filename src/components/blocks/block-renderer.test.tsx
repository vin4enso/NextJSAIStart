import { render, screen } from "@testing-library/react";
import { BlockRenderer } from "./block-renderer";

describe("BlockRenderer", () => {
  it("renders heading block", () => {
    render(
      <BlockRenderer
        blocks={[
          {
            id: "1",
            pageId: "p1",
            blockType: "heading",
            sortOrder: 0,
            config: { text: "Hello World", level: 1, alignment: "center" },
            createdAt: "",
            updatedAt: "",
          },
        ]}
      />,
    );
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Hello World");
    expect(heading.className).toContain("text-center");
  });

  it("renders paragraph block with HTML", () => {
    render(
      <BlockRenderer
        blocks={[
          {
            id: "2",
            pageId: "p1",
            blockType: "paragraph",
            sortOrder: 0,
            config: { html: "<strong>Bold</strong> text" },
            createdAt: "",
            updatedAt: "",
          },
        ]}
      />,
    );
    expect(screen.getByText("Bold")).toBeInTheDocument();
    expect(screen.getByText("text")).toBeInTheDocument();
  });

  it("renders image block", () => {
    render(
      <BlockRenderer
        blocks={[
          {
            id: "3",
            pageId: "p1",
            blockType: "image",
            sortOrder: 0,
            config: { src: "/test.jpg", alt: "Test image" },
            createdAt: "",
            updatedAt: "",
          },
        ]}
      />,
    );
    const img = screen.getByAltText("Test image") as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toContain("/test.jpg");
  });

  it("renders nested section with children", () => {
    render(
      <BlockRenderer
        blocks={[
          {
            id: "4",
            pageId: "p1",
            blockType: "section",
            sortOrder: 0,
            config: { title: "Section Title" },
            createdAt: "",
            updatedAt: "",
            children: [
              {
                id: "5",
                pageId: "p1",
                blockType: "heading",
                sortOrder: 0,
                config: { text: "Child Heading", level: 2 },
                createdAt: "",
                updatedAt: "",
              },
            ],
          },
        ]}
      />,
    );
    expect(screen.getByText("Section Title")).toBeInTheDocument();
    expect(screen.getByText("Child Heading")).toBeInTheDocument();
  });

  it("returns null for empty blocks", () => {
    const { container } = render(<BlockRenderer blocks={[]} />);
    expect(container.innerHTML).toBe("");
  });
});
