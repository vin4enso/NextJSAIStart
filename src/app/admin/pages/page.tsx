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
import { pageApi } from "@/api/page.api";
import { PageFormDialog } from "./_components/page-form-dialog";

interface PageRow {
  id: string;
  sectionId: string | null;
  title: string;
  slug: string;
  content: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  isPublished: boolean;
  isHome: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  sectionName: string | null;
  sectionSlug: string | null;
}

interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export default function PagesPage() {
  const t = useTranslations("page");
  const tCommon = useTranslations("common");
  const tNav = useTranslations("nav");
  const [, startTransition] = useTransition();
  const [pages, setPages] = useState<PageRow[]>([]);
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
  const [deleteTarget, setDeleteTarget] = useState<PageRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<PageRow | null>(null);

  const fetchPages = useCallback(
    async (page: number, term: string) => {
      setIsLoading(true);
      setIsError(false);
      try {
        const result = await pageApi.list({
          page,
          pageSize: 20,
          search: term || undefined,
        });
        startTransition(() => {
          setPages(result.items as PageRow[]);
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
      fetchPages(1, "");
    }
  }, [fetchPages]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value);
      searchRef.current = value;
      pageRef.current = 1;
      fetchPages(1, value);
    },
    [fetchPages],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      pageRef.current = page;
      fetchPages(page, searchRef.current);
    },
    [fetchPages],
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    if (deleteTarget.isHome) {
      toast.error(t("deleteHomeBlocked"));
      setDeleteTarget(null);
      return;
    }
    setIsDeleting(true);
    try {
      await pageApi.delete(deleteTarget.id);
      toast.success(t("deleteSuccess"));
      setDeleteTarget(null);
      fetchPages(pageRef.current, searchRef.current);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, fetchPages, t]);

  const handleDialogSuccess = useCallback(() => {
    fetchPages(pageRef.current, searchRef.current);
  }, [fetchPages]);

  const columns: ColumnDef<PageRow>[] = [
    {
      accessorKey: "title",
      header: t("name"),
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.title}
          {row.original.isHome && (
            <Badge variant="default" className="ml-2">
              {t("home")}
            </Badge>
          )}
          {row.original.slug === "index" && row.original.sectionId && (
            <Badge variant="secondary" className="ml-2">
              {t("index")}
            </Badge>
          )}
        </span>
      ),
    },
    {
      accessorKey: "slug",
      header: t("slug"),
      cell: ({ row }) => {
        const prefix = row.original.sectionSlug
          ? `/${row.original.sectionSlug}/`
          : "/";
        return (
          <code className="bg-muted rounded px-1.5 py-0.5 text-xs">
            {prefix}
            {row.original.slug}
          </code>
        );
      },
    },
    {
      accessorKey: "sectionName",
      header: t("section"),
      cell: ({ row }) => (
        <span>
          {row.original.sectionName ?? (
            <span className="text-muted-foreground">—</span>
          )}
        </span>
      ),
    },
    {
      accessorKey: "isPublished",
      header: t("isPublished"),
      cell: ({ row }) => (
        <Badge variant={row.original.isPublished ? "default" : "secondary"}>
          {row.original.isPublished ? tCommon("yes") : tCommon("no")}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const p = row.original;
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
              <DropdownMenuItem
                onClick={() => {
                  const url = p.sectionSlug
                    ? `/${p.sectionSlug}/${p.slug}`
                    : `/${p.slug}`;
                  window.open(url, "_blank");
                }}
              >
                {tCommon("preview")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(p)}>
                {tCommon("edit")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  window.open(`/admin/pages/${p.id}`, "_self");
                }}
              >
                {t("blocks")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  try {
                    await pageApi.publish(p.id);
                    toast.success(t("publishSuccess"));
                    fetchPages(pageRef.current, searchRef.current);
                  } catch {
                    toast.error(t("publishError"));
                  }
                }}
              >
                {p.isPublished ? t("unpublish") : t("publish")}
              </DropdownMenuItem>
              {!p.isHome && (
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setDeleteTarget(p)}
                >
                  {tCommon("delete")}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const handleEdit = useCallback((p: PageRow) => {
    setEditingPage(p);
    setDialogOpen(true);
  }, []);

  const handleCreate = useCallback(() => {
    setEditingPage(null);
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
        data={pages}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => fetchPages(pageRef.current, searchRef.current)}
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
      />
      <PageFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleDialogSuccess}
        page={editingPage}
      />
      <ConfirmDelete
        open={!!deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        entityName={deleteTarget?.title ?? ""}
        isLoading={isDeleting}
      />
    </div>
  );
}
