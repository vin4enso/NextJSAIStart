import { apiClient, ApiError } from "@/lib/api-client";

interface ProfileResponse {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const profileApi = {
  update: (data: { name?: string; avatar?: string }) =>
    apiClient.patch<ProfileResponse>("/api/profile", data),

  uploadAvatar: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/profile/avatar", {
      method: "POST",
      body: formData,
    });

    const body = await res.json();
    if (!body.success) {
      throw new ApiError(body.message, res.status, body.errors);
    }
    return body.data;
  },

  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => apiClient.post<{ message: string }>("/api/profile/password", data),
};
