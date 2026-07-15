import { render, screen } from "@testing-library/react";
import { FormBlock } from "./form-block";

describe("FormBlock", () => {
  it("renders form fields", () => {
    render(
      <FormBlock
        fields={[
          { type: "text", label: "Name", required: false, options: "" },
          { type: "email", label: "Email", required: true, options: "" },
        ]}
        submitLabel="Send"
      />,
    );
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Send")).toBeInTheDocument();
  });

  it("renders submit button when submitLabel is provided", () => {
    render(
      <FormBlock
        fields={[{ type: "text", label: "Name", required: false, options: "" }]}
        submitLabel="Submit"
      />,
    );
    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
  });
});
