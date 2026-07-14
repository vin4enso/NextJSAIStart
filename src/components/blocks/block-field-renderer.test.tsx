import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BlockFieldRenderer } from "./block-field-renderer";

describe("BlockFieldRenderer", () => {
  it("renders a text input with label", () => {
    render(
      <BlockFieldRenderer
        field={{ name: "title", label: "Title", type: "text" }}
        value=""
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Title")).toHaveAttribute("type", "text");
  });

  it("renders a number input", () => {
    render(
      <BlockFieldRenderer
        field={{ name: "level", label: "Level", type: "number" }}
        value={1}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByLabelText("Level")).toBeInTheDocument();
    expect(screen.getByLabelText("Level")).toHaveAttribute("type", "number");
  });

  it("renders a checkbox", () => {
    render(
      <BlockFieldRenderer
        field={{ name: "autoplay", label: "Autoplay", type: "checkbox" }}
        value={false}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByLabelText("Autoplay")).toBeInTheDocument();
  });

  it("renders a select with options", () => {
    render(
      <BlockFieldRenderer
        field={{
          name: "alignment",
          label: "Alignment",
          type: "select",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        }}
        value="left"
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByLabelText("Alignment")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Left")).toBeInTheDocument();
  });

  it("renders a textarea", () => {
    render(
      <BlockFieldRenderer
        field={{ name: "html", label: "HTML", type: "textarea" }}
        value="<p>text</p>"
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByLabelText("HTML")).toBeInTheDocument();
  });
});
