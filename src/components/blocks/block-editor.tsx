"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { BlockCard } from "./block-card";
import { BlockPicker } from "./block-picker";
import { BlockFormDialog } from "./block-form-dialog";
import { pageBlockApi } from "@/api/page-block.api";
import type { PageBlock, BlockType } from "@/schemas/page-block";

type BlockWithChildren = PageBlock & { children?: BlockWithChildren[] };

interface BlockEditorProps {
  pageId: string;
  initialBlocks: BlockWithChildren[];
}

export function BlockEditor({ pageId, initialBlocks }: BlockEditorProps) {
  const t = useTranslations("pageBlock");
  const [blocks, setBlocks] = useState<BlockWithChildren[]>(initialBlocks);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<{
    id: string;
    type: BlockType;
    config: Record<string, unknown>;
  } | null>(null);

  const handleAddBlock = async (blockType: BlockType) => {
    setPickerOpen(false);
    try {
      const newBlock = await pageBlockApi.create(pageId, {
        pageId,
        blockType,
        config: { blockType } as PageBlock["config"],
        sortOrder: blocks.length,
      });
      const newBlockCard: BlockWithChildren = {
        id: newBlock.id,
        pageId: newBlock.pageId,
        blockType: newBlock.blockType,
        sortOrder: newBlock.sortOrder,
        config: newBlock.config,
        createdAt: newBlock.createdAt,
        updatedAt: newBlock.updatedAt,
      };
      setBlocks((prev) => [...prev, newBlockCard]);
      toast.success("Block added");
    } catch {
      toast.error("Failed to add block");
    }
  };

  const handleEdit = (blockId: string) => {
    const block = blocks.find((b) => b.id === blockId);
    if (block) {
      setEditTarget({
        id: block.id,
        type: block.blockType,
        config: block.config as Record<string, unknown>,
      });
    }
  };

  const handleSaveConfig = async (data: Record<string, unknown>) => {
    if (!editTarget) return;
    try {
      const updated = await pageBlockApi.update(pageId, editTarget.id, {
        config: { ...data, blockType: editTarget.type } as PageBlock["config"],
      });
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === editTarget.id ? { ...b, config: updated.config } : b,
        ),
      );
      setEditTarget(null);
      toast.success("Block updated");
    } catch {
      toast.error("Failed to update block");
    }
  };

  const handleDelete = async (blockId: string) => {
    try {
      await pageBlockApi.delete(pageId, blockId);
      setBlocks((prev) => prev.filter((b) => b.id !== blockId));
      toast.success("Block deleted");
    } catch {
      toast.error("Failed to delete block");
    }
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const newBlocks = [...blocks];
    [newBlocks[index - 1], newBlocks[index]] = [
      newBlocks[index],
      newBlocks[index - 1],
    ];
    const updated = newBlocks.map((b, i) => ({ ...b, sortOrder: i }));
    setBlocks(updated);
    pageBlockApi.reorder(
      pageId,
      updated.map((b) => b.id),
    );
  };

  const handleMoveDown = (index: number) => {
    if (index >= blocks.length - 1) return;
    const newBlocks = [...blocks];
    [newBlocks[index], newBlocks[index + 1]] = [
      newBlocks[index + 1],
      newBlocks[index],
    ];
    const updated = newBlocks.map((b, i) => ({ ...b, sortOrder: i }));
    setBlocks(updated);
    pageBlockApi.reorder(
      pageId,
      updated.map((b) => b.id),
    );
  };

  if (blocks.length === 0) {
    return (
      <div>
        <PageHeader
          title={t("blockEditor.title")}
          actions={
            <Button onClick={() => setPickerOpen(true)}>
              <Plus className="size-4" />
              {t("blockEditor.addBlock")}
            </Button>
          }
        />
        <div className="text-muted-foreground flex flex-col items-center justify-center py-20">
          <p>{t("blockEditor.noBlocks")}</p>
        </div>
        <BlockPicker
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          onSelect={handleAddBlock}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={t("blockEditor.title")}
        actions={
          <Button onClick={() => setPickerOpen(true)}>
            <Plus className="size-4" />
            {t("blockEditor.addBlock")}
          </Button>
        }
      />
      <div className="space-y-3">
        {blocks.map((block, index) => (
          <div key={block.id} className="flex items-start gap-2">
            <div className="flex flex-col gap-0.5 pt-3">
              <button
                type="button"
                onClick={() => handleMoveUp(index)}
                className="text-muted-foreground hover:text-foreground size-5"
                disabled={index === 0}
              >
                <ArrowUpDown className="size-4 rotate-180" />
              </button>
              <button
                type="button"
                onClick={() => handleMoveDown(index)}
                className="text-muted-foreground hover:text-foreground size-5"
                disabled={index === blocks.length - 1}
              >
                <ArrowUpDown className="size-4" />
              </button>
            </div>
            <div className="flex-1">
              <BlockCard
                block={block}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          </div>
        ))}
      </div>
      <BlockPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleAddBlock}
      />
      {editTarget && (
        <BlockFormDialog
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
          blockType={editTarget.type}
          defaultValues={editTarget.config}
          onSubmit={handleSaveConfig}
        />
      )}
    </div>
  );
}
