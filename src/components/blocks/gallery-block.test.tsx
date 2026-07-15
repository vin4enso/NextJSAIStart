import { render, screen } from "@testing-library/react";
import { GalleryBlock } from "./gallery-block";

describe("GalleryBlock", () => {
  it("renders images", () => {
    render(
      <GalleryBlock
        images={[
          { src: "/img1.jpg", alt: "Image 1" },
          { src: "/img2.jpg", alt: "Image 2" },
        ]}
      />,
    );
    expect(screen.getByAltText("Image 1")).toBeInTheDocument();
    expect(screen.getByAltText("Image 2")).toBeInTheDocument();
  });

  it("renders with empty images array", () => {
    const { container } = render(<GalleryBlock images={[]} />);
    expect(container.querySelector("img")).not.toBeInTheDocument();
  });
});
