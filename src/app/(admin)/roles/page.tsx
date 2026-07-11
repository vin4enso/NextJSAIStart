"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/page-header";
import { AppTable } from "@/components/app-table";
import { ConfirmDelete } from "@/components/confirm-delete";
import { Button } from "@/components/ui/button";
import { roleApi } from "@/api/role.api";
import { RoleFormDialog } from "./_components/role-form-dialog";
import { createRoleColumns, type RoleRow } from "./_components/columns";

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

  const columns = createRoleColumns(t, tCommon, handleEdit, setDeleteTarget);

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
