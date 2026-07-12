import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { createRoleColumns, type RoleRow } from "../_components/columns";

const mockRole: RoleRow = {
  id: "role-abc-123",
  name: "Admin",
  description: "Administrator role",
  isSystem: true,
  userCount: 1,
  permissionCount: 13,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

const t = (key: string) => key;
const handleEdit = vi.fn();
const setDeleteTarget = vi.fn();

describe("createRoleColumns", () => {
  describe("name column", () => {
    const columns = createRoleColumns(t, t, handleEdit, setDeleteTarget);
    const nameColumn = columns[0];

    it("renders role name as a link", () => {
      const Cell = nameColumn.cell! as (props: {
        row: { original: RoleRow };
      }) => React.ReactNode;
      render(<Cell row={{ original: mockRole }} />);

      const link = screen.getByText(mockRole.name);
      expect(link.tagName).toBe("A");
    });

    it("links to /admin/roles/{id}", () => {
      const Cell = nameColumn.cell! as (props: {
        row: { original: RoleRow };
      }) => React.ReactNode;
      render(<Cell row={{ original: mockRole }} />);

      const link = screen.getByText(mockRole.name) as HTMLAnchorElement;
      expect(link.href).toBe(
        `http://localhost:3000/admin/roles/${mockRole.id}`,
      );
    });
  });
});
