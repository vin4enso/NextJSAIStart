import { apiClient } from "@/lib/api-client";
import type { CreateUserDTO, UpdateUserDTO } from "@/schemas/user";

interface UserResponse {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  isActive: boolean;
  roles: { id: string; name: string }[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface UserListResponse {
  items: UserResponse[];
  pagination: PaginationMeta;
}

export const userApi = {
  list: (params?: Record<string, string | number | undefined>) =>
    apiClient.get<UserListResponse>("/api/users", { params }),

  getById: (id: string) => apiClient.get<UserResponse>(`/api/users/${id}`),

  create: (data: CreateUserDTO) =>
    apiClient.post<UserResponse>("/api/users", data),

  update: (id: string, data: UpdateUserDTO) =>
    apiClient.patch<UserResponse>(`/api/users/${id}`, data),

  delete: (id: string) => apiClient.delete<void>(`/api/users/${id}`),
};
