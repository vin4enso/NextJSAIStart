import { render, screen } from "@testing-library/react";
import { CtaBlock } from "./cta-block";

describe("CtaBlock", () => {
  it("renders button with text and url", () => {
    render(<CtaBlock buttonText="Get Started" buttonUrl="/signup" />);
    const link = screen.getByText("Get Started");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/signup");
  });

  it("renders title and description when provided", () => {
    render(
      <CtaBlock
        title="Join Now"
        description="Sign up today"
        buttonText="Go"
        buttonUrl="#"
      />,
    );
    expect(screen.getByText("Join Now")).toBeInTheDocument();
    expect(screen.getByText("Sign up today")).toBeInTheDocument();
  });

  it("renders without title and description", () => {
    render(<CtaBlock buttonText="Click" buttonUrl="#" />);
    expect(screen.getByText("Click")).toBeInTheDocument();
  });
});
