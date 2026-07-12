"use client";

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

export function SectionFormDialog({
  open,
  onOpenChange,
  onSuccess,
  section,
}: SectionFormDialogProps) {
  const t = useTranslations("section");
  const tCommon = useTranslations("common");
  const isEdit = !!section;

  const form = useForm<CreateSectionDTO>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(CreateSectionSchema) as any,
    defaultValues: {
      name: section?.name ?? "",
      slug: section?.slug ?? "",
      description: section?.description ?? "",
      content: section?.content ?? "",
      metaTitle: section?.metaTitle ?? "",
      metaDescription: section?.metaDescription ?? "",
      sortOrder: section?.sortOrder ?? 0,
      isPublished: section?.isPublished ?? true,
    },
  });

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
              <Input id="slug" {...form.register("slug")} />
              {form.formState.errors.slug && (
                <p className="text-destructive text-xs">
                  {form.formState.errors.slug.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{t("description")}</Label>
              <Input id="description" {...form.register("description")} />
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
