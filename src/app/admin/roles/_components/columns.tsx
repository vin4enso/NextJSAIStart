import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface RoleRow {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  userCount: number;
  permissionCount: number;
  createdAt: string;
  updatedAt: string;
}

export function createRoleColumns(
  t: (key: string) => string,
  tCommon: (key: string) => string,
  handleEdit: (role: RoleRow) => void,
  setDeleteTarget: (role: RoleRow | null) => void,
): ColumnDef<RoleRow>[] {
  return [
    {
      accessorKey: "name",
      header: t("name"),
      cell: ({ row }) => (
        <a
          href={`/admin/roles/${row.original.id}`}
          className="font-medium hover:underline"
        >
          {row.original.name}
        </a>
      ),
    },
    {
      accessorKey: "description",
      header: t("description"),
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {row.original.description ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "userCount",
      header: t("usersCount"),
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {row.original.userCount}
        </span>
      ),
    },
    {
      accessorKey: "permissionCount",
      header: t("permissionsCount"),
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {row.original.permissionCount}
        </span>
      ),
    },
    {
      accessorKey: "isSystem",
      header: t("system"),
      cell: ({ row }) => {
        const system = row.original.isSystem;
        return system ? (
          <Badge variant="secondary">{t("system")}</Badge>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const role = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon-sm">
                  <MoreHorizontal className="size-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEdit(role)}>
                {tCommon("edit")}
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                disabled={role.isSystem}
                onClick={() => setDeleteTarget(role)}
              >
                {tCommon("delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
