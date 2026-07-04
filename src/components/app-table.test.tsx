import { render, screen } from "@testing-library/react";
import type { ColumnDef } from "@tanstack/react-table";
import { AppTable } from "./app-table";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      noData: "No data",
    };
    return translations[key] ?? key;
  },
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));

interface TestData {
  id: number;
  name: string;
  email: string;
}

const columns: ColumnDef<TestData>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
];

const data: TestData[] = [
  { id: 1, name: "Alice", email: "alice@test.com" },
  { id: 2, name: "Bob", email: "bob@test.com" },
];

describe("AppTable", () => {
  it("renders data rows", () => {
    render(<AppTable columns={columns} data={data} />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("renders empty state when no data", () => {
    render(<AppTable columns={columns} data={[]} />);
    expect(screen.getByText("No data")).toBeInTheDocument();
  });

  it("renders loading state", () => {
    const { container } = render(
      <AppTable columns={columns} data={[]} isLoading />,
    );
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("renders error state", () => {
    render(
      <AppTable
        columns={columns}
        data={[]}
        isError
        errorMessage="Failed to load"
      />,
    );
    expect(screen.getByText("Failed to load")).toBeInTheDocument();
  });

  it("renders pagination when page props provided", () => {
    render(
      <AppTable
        columns={columns}
        data={data}
        page={1}
        totalPages={3}
        onPageChange={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "2" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "3" })).toBeInTheDocument();
  });
});
