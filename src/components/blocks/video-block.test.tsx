import { render } from "@testing-library/react";
import { VideoBlock } from "./video-block";

describe("VideoBlock", () => {
  it("renders iframe with given url", () => {
    const { container } = render(
      <VideoBlock url="https://example.com/video" />,
    );
    const iframe = container.querySelector("iframe");
    expect(iframe).toBeInTheDocument();
    expect(iframe?.src).toContain("https://example.com/video");
  });

  it("sets allowFullScreen when controls is true", () => {
    const { container } = render(
      <VideoBlock url="https://example.com/video" controls />,
    );
    const iframe = container.querySelector("iframe");
    expect(iframe).toHaveAttribute("allowFullScreen");
  });
});
