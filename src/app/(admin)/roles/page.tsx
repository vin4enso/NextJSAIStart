"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { MoreHorizontal, Plus } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { AppTable } from "@/components/app-table";
import { ConfirmDelete } from "@/components/confirm-delete";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { roleApi } from "@/api/role.api";
import { RoleFormDialog } from "./_components/role-form-dialog";

interface RoleRow {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  userCount: number;
  permissionCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function RolesPage() {
  const t = useTranslations("role");
  const tCommon = useTranslations("common");
  const tNav = useTranslations("nav");
  const [, startTransition] = useTransition();
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const fetchedRef = useRef(false);
  const [deleteTarget, setDeleteTarget] = useState<RoleRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<{
    id: string;
    name: string;
    description: string | null;
    permissions: { id: string }[];
  } | null>(null);

  const fetchRoles = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const result = await roleApi.list();
      startTransition(() => {
        setRoles(result);
      });
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [startTransition]);

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchRoles();
    }
  }, [fetchRoles]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await roleApi.delete(deleteTarget.id);
      toast.success(t("deleteSuccess"));
      setDeleteTarget(null);
      fetchRoles();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, fetchRoles, t]);

  const handleEdit = useCallback(async (role: RoleRow) => {
    try {
      const detail = await roleApi.getById(role.id);
      setEditingRole({
        id: detail.id,
        name: detail.name,
        description: detail.description,
        permissions: detail.permissions.map((p) => ({ id: p.id })),
      });
      setDialogOpen(true);
    } catch {
      toast.error("Failed to load role details");
    }
  }, []);

  const handleCreate = useCallback(() => {
    setEditingRole(null);
    setDialogOpen(true);
  }, []);

  const handleDialogSuccess = useCallback(() => {
    fetchRoles();
  }, [fetchRoles]);

  const columns: ColumnDef<RoleRow>[] = [
    {
      accessorKey: "name",
      header: t("name"),
      cell: ({ row }) => (
        <a
          href={`/roles/${row.original.id}`}
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
            <DropdownMenuTrigger>
              <Button variant="ghost" size="icon-sm">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
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

  const pageMeta = {
    title: t("title"),
    description: t("description"),
    breadcrumbs: [
      { label: tNav("dashboard"), href: "/dashboard" },
      { label: t("title") },
    ],
  };

  return (
    <div>
      <PageHeader
        title={pageMeta.title}
        description={pageMeta.description}
        actions={
          <Button onClick={handleCreate}>
            <Plus className="size-4" />
            {t("create")}
          </Button>
        }
      />
      <AppTable
        columns={columns}
        data={roles}
        isLoading={isLoading}
        isError={isError}
        onRetry={fetchRoles}
      />
      <RoleFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleDialogSuccess}
        role={editingRole}
      />
      <ConfirmDelete
        open={!!deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        entityName={deleteTarget?.name ?? ""}
        isLoading={isDeleting}
      />
    </div>
  );
}
