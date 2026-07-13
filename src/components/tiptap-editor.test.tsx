import { render } from "@testing-library/react";
import { TipTapEditor } from "./tiptap-editor";

const mockOnChange = vi.fn();

vi.mock("@tiptap/react", async () => {
  const actual =
    await vi.importActual<typeof import("@tiptap/react")>("@tiptap/react");
  return {
    ...actual,
    useEditor: vi.fn(() => null),
    EditorContent: ({ editor }: { editor: unknown }) =>
      editor ? <div data-testid="editor-content" /> : null,
  };
});

vi.mock("@tiptap/starter-kit", () => ({
  default: {
    configure: () => ({}),
  },
}));

describe("TipTapEditor", () => {
  it("renders the editor container", () => {
    const { container } = render(
      <TipTapEditor value="" onChange={mockOnChange} />,
    );
    expect(container.querySelector(".rounded-lg")).toBeInTheDocument();
  });

  it("renders toolbar buttons when editor is available", async () => {
    const { useEditor } = await import("@tiptap/react");

    const mockEditor = {
      chain: () => ({
        focus: () => ({
          toggleBold: () => ({ run: vi.fn() }),
          toggleItalic: () => ({ run: vi.fn() }),
          toggleHeading: () => ({ run: vi.fn() }),
          toggleBulletList: () => ({ run: vi.fn() }),
          toggleOrderedList: () => ({ run: vi.fn() }),
        }),
      }),
      isActive: () => false,
    };

    vi.mocked(useEditor).mockReturnValue(
      mockEditor as unknown as ReturnType<typeof useEditor>,
    );

    render(<TipTapEditor value="" onChange={mockOnChange} />);
  });
});
