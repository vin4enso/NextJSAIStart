import { apiClient } from "@/lib/api-client";

interface RoleRow {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  userCount: number;
  permissionCount: number;
  createdAt: string;
  updatedAt: string;
}

interface PermissionItem {
  id: string;
  key: string;
  name: string;
  group: string;
}

interface RoleDetail {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions: PermissionItem[];
  createdAt: string;
  updatedAt: string;
}

type RoleListResponse = RoleRow[];
type RoleDetailResponse = RoleDetail;

export const roleApi = {
  list: () => apiClient.get<RoleListResponse>("/api/roles"),
  getById: (id: string) =>
    apiClient.get<RoleDetailResponse>(`/api/roles/${id}`),
  create: (data: {
    name: string;
    description?: string;
    permissionIds?: string[];
  }) => apiClient.post<RoleDetailResponse>("/api/roles", data),
  update: (
    id: string,
    data: {
      name?: string;
      description?: string;
      permissionIds?: string[];
    },
  ) => apiClient.patch<RoleDetailResponse>(`/api/roles/${id}`, data),
  delete: (id: string) => apiClient.delete<void>(`/api/roles/${id}`),
};
