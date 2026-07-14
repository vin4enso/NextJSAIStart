"use client";
import { useTranslations } from "next-intl";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PageBlock } from "@/schemas/page-block";

type BlockWithChildren = PageBlock & { children?: BlockWithChildren[] };

interface BlockCardProps {
  block: BlockWithChildren;
  onEdit: (blockId: string) => void;
  onDelete: (blockId: string) => void;
  depth?: number;
}

function getConfigPreview(
  config: Record<string, unknown>,
  tFields: string,
): string {
  const text = config.text as string | undefined;
  if (text) return text;
  const html = config.html as string | undefined;
  if (html) return html.replace(/<[^>]*>/g, "").slice(0, 60);
  const src = config.src as string | undefined;
  if (src) return src;
  const title = config.title as string | undefined;
  if (title) return title;
  const buttonText = config.buttonText as string | undefined;
  if (buttonText) return buttonText;
  return `(${Object.keys(config).length} ${tFields})`;
}

export function BlockCard({
  block,
  onEdit,
  onDelete,
  depth = 0,
}: BlockCardProps) {
  const t = useTranslations("pageBlock");
  const preview = getConfigPreview(
    block.config as Record<string, unknown>,
    t("blockCard.fields"),
  );
  const hasChildren = block.children && block.children.length > 0;

  return (
    <div style={{ marginLeft: depth * 16 }}>
      <div className="bg-card flex items-center gap-2 rounded-lg border p-3">
        <GripVertical className="text-muted-foreground size-4 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs font-medium uppercase">
              {t(block.blockType)}
            </span>
          </div>
          <p className="truncate text-sm">{preview}</p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onEdit(block.id)}
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onDelete(block.id)}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>
      {hasChildren && (
        <div className="ml-4 space-y-2">
          {block.children!.map((child) => (
            <BlockCard
              key={child.id}
              block={child}
              onEdit={onEdit}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
