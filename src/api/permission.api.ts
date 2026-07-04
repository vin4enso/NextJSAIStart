import { apiClient } from "@/lib/api-client";

interface PermissionItem {
  id: string;
  key: string;
  name: string;
  group: string;
  createdAt: string;
}

type PermissionListResponse = Record<string, PermissionItem[]>;

export const permissionApi = {
  list: () => apiClient.get<PermissionListResponse>("/api/permissions"),
  update: (id: string, data: { name?: string }) =>
    apiClient.patch(`/api/permissions/${id}`, data),
};
