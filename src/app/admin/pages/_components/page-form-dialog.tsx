"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppForm } from "@/components/app-form";
import { TipTapEditor } from "@/components/tiptap-editor";
import { useFormMutation } from "@/hooks/use-form-mutation";
import { pageApi } from "@/api/page.api";
import { sectionApi } from "@/api/section.api";
import { CreatePageSchema, type CreatePageDTO } from "@/schemas/page";
import type { Section } from "@/schemas/section";

interface PageRecord {
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
}

interface PageFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  page?: PageRecord | null;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function PageFormDialog({
  open,
  onOpenChange,
  onSuccess,
  page,
}: PageFormDialogProps) {
  const t = useTranslations("page");
  const tCommon = useTranslations("common");
  const isEdit = !!page;
  const [sectionList, setSectionList] = useState<Section[]>([]);
  const slugManuallyEdited = useRef(false);

  const form = useForm<CreatePageDTO>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(CreatePageSchema) as any,
    defaultValues: {
      title: "",
      slug: "",
      sectionId: null,
      content: "",
      metaTitle: "",
      metaDescription: "",
      isPublished: false,
      isHome: false,
    },
  });

  useEffect(() => {
    if (open) {
      sectionApi
        .list({ pageSize: 100 })
        .then((res) => {
          setSectionList(res.items);
        })
        .catch(() => {});
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      form.reset();
      slugManuallyEdited.current = false;
      return;
    }
    if (page) {
      form.reset({
        title: page.title,
        slug: page.slug,
        sectionId: page.sectionId,
        content: page.content ?? "",
        metaTitle: page.metaTitle ?? "",
        metaDescription: page.metaDescription ?? "",
        isPublished: page.isPublished,
        isHome: page.isHome,
      });
      slugManuallyEdited.current = true;
    } else {
      form.reset({
        title: "",
        slug: "",
        sectionId: null,
        content: "",
        metaTitle: "",
        metaDescription: "",
        isPublished: false,
        isHome: false,
      });
      slugManuallyEdited.current = false;
    }
  }, [open, page, form]);

  const isHomeDisabled = page?.isHome;
  const isIndexPage = page?.slug === "index" && !!page?.sectionId;

  const titleValue = form.watch("title");
  useEffect(() => {
    if (slugManuallyEdited.current || isIndexPage) return;
    const slug = slugify(titleValue);
    form.setValue("slug", slug);
  }, [titleValue, form, isIndexPage]);

  const handleSlugChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      slugManuallyEdited.current = true;
      form.setValue("slug", e.target.value);
    },
    [form],
  );

  const { mutate: submitForm, isPending: submitting } = useFormMutation({
    mutationFn: async () => {
      const data = form.getValues();
      if (isEdit && page) {
        return pageApi.update(page.id, data);
      } else {
        return pageApi.create(data);
      }
    },
    onSuccess: () => {
      onSuccess();
      onOpenChange(false);
    },
    successMessage: isEdit ? t("updateSuccess") : t("createSuccess"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? t("edit") : t("create")}</DialogTitle>
          <DialogDescription>
            {isEdit ? t("edit") : t("create")}
          </DialogDescription>
        </DialogHeader>
        <AppForm onSubmit={form.handleSubmit(() => submitForm())}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">{t("name")}</Label>
                <Input id="title" {...form.register("title")} />
                {form.formState.errors.title && (
                  <p className="text-destructive text-xs">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">{t("slug")}</Label>
                <Input
                  id="slug"
                  {...form.register("slug")}
                  onChange={handleSlugChange}
                  disabled={isIndexPage}
                />
                {form.formState.errors.slug && (
                  <p className="text-destructive text-xs">
                    {form.formState.errors.slug.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sectionId">{t("section")}</Label>
              <select
                id="sectionId"
                className="border-border bg-background w-full rounded-lg border px-3 py-2 text-sm"
                {...form.register("sectionId")}
              >
                <option value="">{t("root")}</option>
                {sectionList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>{t("content")}</Label>
              <Controller
                name="content"
                control={form.control}
                render={({ field }) => (
                  <TipTapEditor
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="metaTitle">{t("metaTitle")}</Label>
              <Input id="metaTitle" {...form.register("metaTitle")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="metaDescription">{t("metaDescription")}</Label>
              <Input
                id="metaDescription"
                {...form.register("metaDescription")}
              />
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <input
                  id="isPublished"
                  type="checkbox"
                  {...form.register("isPublished")}
                  className="border-input rounded"
                />
                <Label htmlFor="isPublished">{t("isPublished")}</Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="isHome"
                  type="checkbox"
                  {...form.register("isHome")}
                  className="border-input rounded"
                  disabled={isHomeDisabled}
                />
                <Label htmlFor="isHome">{t("isHome")}</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              {tCommon("cancel")}
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
              {submitting ? tCommon("loading") : tCommon("save")}
            </Button>
          </DialogFooter>
        </AppForm>
      </DialogContent>
    </Dialog>
  );
}
