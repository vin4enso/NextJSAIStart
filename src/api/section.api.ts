import { apiClient } from "@/lib/api-client";
import type {
  Section,
  CreateSectionDTO,
  UpdateSectionDTO,
} from "@/schemas/section";

interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface SectionListResponse {
  items: Section[];
  pagination: PaginationMeta;
}

export const sectionApi = {
  list: (params?: Record<string, string | number | undefined>) =>
    apiClient.get<SectionListResponse>("/api/sections", { params }),

  getById: (id: string) => apiClient.get<Section>(`/api/sections/${id}`),

  create: (data: CreateSectionDTO) =>
    apiClient.post<Section>("/api/sections", data),

  update: (id: string, data: UpdateSectionDTO) =>
    apiClient.patch<Section>(`/api/sections/${id}`, data),

  delete: (id: string) => apiClient.delete<void>(`/api/sections/${id}`),
};
