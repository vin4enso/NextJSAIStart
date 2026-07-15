import { render } from "@testing-library/react";
import { DividerBlock } from "./divider-block";

describe("DividerBlock", () => {
  it("renders with default style", () => {
    const { container } = render(<DividerBlock />);
    const hr = container.querySelector("hr");
    expect(hr).toBeInTheDocument();
    expect(hr).toHaveStyle("border-style: solid");
  });

  it("renders with custom style and color", () => {
    const { container } = render(
      <DividerBlock style="dashed" color="red" thickness={2} />,
    );
    const hr = container.querySelector("hr");
    expect(hr).toHaveStyle("border-style: dashed");
    expect(hr).toHaveStyle("border-color: rgb(255, 0, 0)");
    expect(hr).toHaveStyle("border-width: 2px");
  });
});
