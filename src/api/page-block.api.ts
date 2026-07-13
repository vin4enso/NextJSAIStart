import { apiClient } from "@/lib/api-client";
import type {
  PageBlock,
  CreateBlockDTO,
  UpdateBlockDTO,
} from "@/schemas/page-block";

export const pageBlockApi = {
  getTree: (pageId: string) =>
    apiClient.get<PageBlock[]>(`/api/pages/${pageId}/blocks`),

  create: (pageId: string, data: CreateBlockDTO) =>
    apiClient.post<PageBlock>(`/api/pages/${pageId}/blocks`, data),

  update: (pageId: string, blockId: string, data: UpdateBlockDTO) =>
    apiClient.patch<PageBlock>(`/api/pages/${pageId}/blocks/${blockId}`, data),

  delete: (pageId: string, blockId: string) =>
    apiClient.delete<void>(`/api/pages/${pageId}/blocks/${blockId}`),

  reorder: (pageId: string, blockIds: string[]) =>
    apiClient.patch<void>(`/api/pages/${pageId}/blocks/reorder`, {
      blockIds: blockIds,
    }),
};
