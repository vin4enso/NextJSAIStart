import { render, screen } from "@testing-library/react";
import { AvatarUpload } from "./avatar-upload";

describe("AvatarUpload", () => {
  it("renders avatar with initials", () => {
    render(<AvatarUpload name="John Doe" onFileSelect={vi.fn()} />);
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("renders image container when src is provided", () => {
    const { container } = render(
      <AvatarUpload
        name="John Doe"
        src="/path/to/avatar.jpg"
        onFileSelect={vi.fn()}
      />,
    );
    const avatar = container.querySelector("[data-slot='avatar']");
    expect(avatar).toBeInTheDocument();
  });

  it("renders a button for upload", () => {
    render(<AvatarUpload name="John Doe" onFileSelect={vi.fn()} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
