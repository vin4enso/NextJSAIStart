"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Puck } from "@puckeditor/core";
import { config } from "@/lib/puck";
import { pageApi } from "@/api/page.api";
import type { Data } from "@puckeditor/core";

interface PuckEditorProps {
  pageId: string;
  initialData: Data;
  pageTitle: string;
}

export function PuckEditor({
  pageId,
  initialData,
  pageTitle,
}: PuckEditorProps) {
  const router = useRouter();

  const handlePublish = useCallback(
    async (data: Data) => {
      await pageApi.saveContent(pageId, data);
      await pageApi.publish(pageId);
      router.refresh();
    },
    [pageId, router],
  );

  return (
    <Puck
      config={config}
      data={initialData}
      onPublish={handlePublish}
      headerTitle={pageTitle}
    />
  );
}
