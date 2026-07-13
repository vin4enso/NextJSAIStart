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
import { sectionApi } from "@/api/section.api";
import { SectionFormDialog } from "./_components/section-form-dialog";
import type { Section } from "@/schemas/section";

interface SectionRow extends Section {
  pageCount: number;
}

interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export default function SectionsPage() {
  const t = useTranslations("section");
  const tCommon = useTranslations("common");
  const tNav = useTranslations("nav");
  const [, startTransition] = useTransition();
  const [sections, setSections] = useState<SectionRow[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    pageSize: 50,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const searchRef = useRef(search);
  const pageRef = useRef(1);
  const fetchedRef = useRef(false);
  const [deleteTarget, setDeleteTarget] = useState<SectionRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);

  const fetchSections = useCallback(
    async (page: number, term: string) => {
      setIsLoading(true);
      setIsError(false);
      try {
        const result = await sectionApi.list({
          page,
          pageSize: 50,
          search: term || undefined,
        });
        startTransition(() => {
          setSections(result.items as SectionRow[]);
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
      fetchSections(1, "");
    }
  }, [fetchSections]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value);
      searchRef.current = value;
      pageRef.current = 1;
      fetchSections(1, value);
    },
    [fetchSections],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      pageRef.current = page;
      fetchSections(page, searchRef.current);
    },
    [fetchSections],
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await sectionApi.delete(deleteTarget.id);
      toast.success(t("deleteSuccess"));
      setDeleteTarget(null);
      fetchSections(pageRef.current, searchRef.current);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, fetchSections, t]);

  const handleDialogSuccess = useCallback(() => {
    fetchSections(pageRef.current, searchRef.current);
  }, [fetchSections]);

  const columns: ColumnDef<SectionRow>[] = [
    {
      accessorKey: "name",
      header: t("name"),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "slug",
      header: t("slug"),
      cell: ({ row }) => (
        <code className="bg-muted rounded px-1.5 py-0.5 text-xs">
          /{row.original.slug}
        </code>
      ),
    },
    {
      accessorKey: "pageCount",
      header: t("pagesCount"),
    },
    {
      accessorKey: "sortOrder",
      header: t("sortOrder"),
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
        const section = row.original;
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
                onClick={() => window.open(`/${section.slug}`, "_blank")}
              >
                {tCommon("preview")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(section)}>
                {tCommon("edit")}
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setDeleteTarget(section)}
              >
                {tCommon("delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const handleEdit = useCallback((section: Section) => {
    setEditingSection(section);
    setDialogOpen(true);
  }, []);

  const handleCreate = useCallback(() => {
    setEditingSection(null);
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
        data={sections}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => fetchSections(pageRef.current, searchRef.current)}
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
      />
      <SectionFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleDialogSuccess}
        section={editingSection}
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
