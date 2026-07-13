import { apiClient } from "@/lib/api-client";
import type { Page, CreatePageDTO, UpdatePageDTO } from "@/schemas/page";

interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface PageListResponse {
  items: Page[];
  pagination: PaginationMeta;
}

export const pageApi = {
  list: (params?: Record<string, string | number | undefined>) =>
    apiClient.get<PageListResponse>("/api/pages", { params }),

  getById: (id: string) => apiClient.get<Page>(`/api/pages/${id}`),

  create: (data: CreatePageDTO) => apiClient.post<Page>("/api/pages", data),

  update: (id: string, data: UpdatePageDTO) =>
    apiClient.patch<Page>(`/api/pages/${id}`, data),

  delete: (id: string) => apiClient.delete<void>(`/api/pages/${id}`),

  publish: (id: string) => apiClient.post<void>(`/api/pages/${id}/publish`),
};
