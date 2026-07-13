"use client";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Heading1,
  Text,
  ImageIcon,
  MousePointerClick,
  Layout,
  Columns2,
  Minus,
  HelpCircle,
  Video,
  Images,
  DollarSign,
  FormInput,
  SquareStack,
} from "lucide-react";
import type { BlockType } from "@/schemas/page-block";
import { BLOCK_TYPES } from "@/schemas/page-block";

const BLOCK_ICONS: Record<string, React.ElementType> = {
  section: SquareStack,
  heading: Heading1,
  paragraph: Text,
  image: ImageIcon,
  cta: MousePointerClick,
  columns: Columns2,
  column: Layout,
  faq: HelpCircle,
  divider: Minus,
  video: Video,
  gallery: Images,
  pricing: DollarSign,
  form: FormInput,
};

interface BlockPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (blockType: BlockType) => void;
}

export function BlockPicker({ open, onClose, onSelect }: BlockPickerProps) {
  const t = useTranslations("pageBlock");

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("blockPicker.title")}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-3 py-4">
          {BLOCK_TYPES.map((type) => {
            const Icon = BLOCK_ICONS[type];
            return (
              <button
                key={type}
                type="button"
                onClick={() => onSelect(type)}
                className="hover:bg-muted flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors"
              >
                {Icon && <Icon className="size-6" />}
                <span className="text-xs font-medium">{t(type)}</span>
              </button>
            );
          })}
        </div>
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            {t("blockPicker.cancel")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
