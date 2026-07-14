"use client";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BlockForm } from "./block-form";
import type { BlockType } from "@/schemas/page-block";

interface BlockFormDialogProps {
  open: boolean;
  onClose: () => void;
  blockType: BlockType;
  defaultValues: Record<string, unknown>;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
}

export function BlockFormDialog({
  open,
  onClose,
  blockType,
  defaultValues,
  onSubmit,
}: BlockFormDialogProps) {
  const t = useTranslations("pageBlock");
  const formId = "block-form";

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("blockForm.title")}</DialogTitle>
        </DialogHeader>
        <BlockForm
          id={formId}
          blockType={blockType}
          defaultValues={defaultValues}
          onSubmit={onSubmit}
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            {t("blockForm.cancel")}
          </Button>
          <Button type="submit" form={formId}>
            {t("blockForm.save")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
