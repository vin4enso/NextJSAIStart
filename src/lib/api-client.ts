import type { ApiResponse, SuccessResponse } from "./api-response";

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(
    message: string,
    status: number,
    errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  const body: ApiResponse<T> = await res.json();

  if (!body.success) {
    throw new ApiError(body.message, res.status, body.errors);
  }

  return (body as SuccessResponse<T>).data;
}

function getSearchParams(
  params?: Record<string, string | number | undefined>,
): string {
  if (!params) return "";
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  }
  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}

export const apiClient = {
  get: <T>(
    url: string,
    opts?: {
      params?: Record<string, string | number | undefined>;
      init?: RequestInit;
    },
  ) => {
    const qs = getSearchParams(opts?.params);
    return request<T>(`${url}${qs}`, { method: "GET", ...opts?.init });
  },

  post: <T>(url: string, body?: unknown) =>
    request<T>(url, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(url: string, body: unknown) =>
    request<T>(url, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  delete: <T>(url: string) => request<T>(url, { method: "DELETE" }),
};
