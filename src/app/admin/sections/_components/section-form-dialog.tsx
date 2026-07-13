"use client";

import { useCallback, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
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
import { useFormMutation } from "@/hooks/use-form-mutation";
import { sectionApi } from "@/api/section.api";
import { CreateSectionSchema, type CreateSectionDTO } from "@/schemas/section";
import type { Section } from "@/schemas/section";

interface SectionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  section?: Section | null;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function SectionFormDialog({
  open,
  onOpenChange,
  onSuccess,
  section,
}: SectionFormDialogProps) {
  const t = useTranslations("section");
  const tCommon = useTranslations("common");
  const isEdit = !!section;
  const slugManuallyEdited = useRef(false);

  const form = useForm<CreateSectionDTO>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(CreateSectionSchema) as any,
    defaultValues: {
      name: "",
      slug: "",
      sortOrder: 0,
      isPublished: true,
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset();
      slugManuallyEdited.current = false;
      return;
    }
    if (section) {
      form.reset({
        name: section.name,
        slug: section.slug,
        sortOrder: section.sortOrder ?? 0,
        isPublished: section.isPublished ?? true,
      });
      slugManuallyEdited.current = true;
    } else {
      form.reset({
        name: "",
        slug: "",
        sortOrder: 0,
        isPublished: true,
      });
      slugManuallyEdited.current = false;
    }
  }, [open, section, form]);

  const nameValue = form.watch("name");
  useEffect(() => {
    if (slugManuallyEdited.current) return;
    const slug = slugify(nameValue);
    form.setValue("slug", slug);
  }, [nameValue, form]);

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
      if (isEdit && section) {
        return sectionApi.update(section.id, data);
      } else {
        return sectionApi.create(data);
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? t("edit") : t("create")}</DialogTitle>
          <DialogDescription>
            {isEdit ? t("edit") : t("create")}
          </DialogDescription>
        </DialogHeader>
        <AppForm onSubmit={form.handleSubmit(() => submitForm())}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("name")}</Label>
              <Input id="name" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-destructive text-xs">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">{t("slug")}</Label>
              <Input
                id="slug"
                {...form.register("slug")}
                onChange={handleSlugChange}
              />
              {form.formState.errors.slug && (
                <p className="text-destructive text-xs">
                  {form.formState.errors.slug.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sortOrder">{t("sortOrder")}</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  {...form.register("sortOrder", { valueAsNumber: true })}
                />
              </div>
              <div className="flex items-end gap-2 pb-2">
                <input
                  id="isPublished"
                  type="checkbox"
                  {...form.register("isPublished")}
                  className="border-input rounded"
                />
                <Label htmlFor="isPublished">{t("isPublished")}</Label>
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
