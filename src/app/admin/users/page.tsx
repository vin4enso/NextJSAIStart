"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { MoreHorizontal, Plus } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { DataToolbar } from "@/components/data-toolbar";
import { SearchInput } from "@/components/search-input";
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
import { userApi } from "@/api/user.api";
import { UserFormDialog } from "./_components/user-form-dialog";

interface UserRow {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  isActive: boolean;
  roles: { id: string; name: string }[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export default function UsersPage() {
  const t = useTranslations("user");
  const tCommon = useTranslations("common");
  const tNav = useTranslations("nav");
  const [, startTransition] = useTransition();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const searchRef = useRef(search);
  const pageRef = useRef(1);
  const fetchedRef = useRef(false);
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);

  const fetchUsers = useCallback(
    async (page: number, term: string) => {
      setIsLoading(true);
      setIsError(false);
      try {
        const result = await userApi.list({
          page,
          pageSize: 20,
          search: term || undefined,
        });
        startTransition(() => {
          setUsers(result.items);
          setPagination(result.pagination);
        });
      } catch {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    },
    [startTransition],
  );

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchUsers(1, "");
    }
  }, [fetchUsers]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value);
      searchRef.current = value;
      setPagination((prev) => ({ ...prev, page: 1 }));
      pageRef.current = 1;
      fetchUsers(1, value);
    },
    [fetchUsers],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      setPagination((prev) => ({ ...prev, page }));
      pageRef.current = page;
      fetchUsers(page, searchRef.current);
    },
    [fetchUsers],
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await userApi.delete(deleteTarget.id);
      toast.success(t("deleteSuccess"));
      setDeleteTarget(null);
      fetchUsers(pageRef.current, searchRef.current);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, fetchUsers, t]);

  const handleDialogSuccess = useCallback(() => {
    fetchUsers(pageRef.current, searchRef.current);
  }, [fetchUsers]);

  const columns: ColumnDef<UserRow>[] = [
    {
      accessorKey: "name",
      header: t("name"),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "email",
      header: t("email"),
    },
    {
      accessorKey: "roles",
      header: t("roles"),
      cell: ({ row }) => {
        const roles = row.original.roles;
        if (roles.length === 0) {
          return (
            <span className="text-muted-foreground text-xs">
              {t("noRoles")}
            </span>
          );
        }
        return (
          <div className="flex flex-wrap gap-1">
            {roles.map((role) => (
              <Badge key={role.id} variant="secondary">
                {role.name}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: t("status"),
      cell: ({ row }) => {
        const active = row.original.isActive;
        return (
          <Badge variant={active ? "default" : "secondary"}>
            {active ? t("active") : t("inactive")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: t("createdAt"),
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
        return (
          <span className="text-muted-foreground text-xs">
            {date.toLocaleDateString()}
          </span>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;
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
              <DropdownMenuItem onClick={() => handleEdit(user)}>
                {tCommon("edit")}
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setDeleteTarget(user)}
              >
                {tCommon("delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const handleEdit = useCallback((user: UserRow) => {
    setEditingUser(user);
    setDialogOpen(true);
  }, []);

  const handleCreate = useCallback(() => {
    setEditingUser(null);
    setDialogOpen(true);
  }, []);

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
      <DataToolbar>
        <SearchInput
          value={search}
          onChange={handleSearchChange}
          placeholder={tCommon("search")}
        />
      </DataToolbar>
      <AppTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => fetchUsers(pageRef.current, searchRef.current)}
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
      />
      <UserFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleDialogSuccess}
        user={editingUser}
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
