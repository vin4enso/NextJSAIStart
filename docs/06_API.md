# API

## Approach

REST API via Next.js Route Handlers. All endpoints are under `/api/`.

Every response follows a unified format:

```typescript
// Success
{
  success: true,
  data: T
}

// List with pagination
{
  success: true,
  data: T[],
  pagination: {
    page: number,
    pageSize: number,
    total: number,
    totalPages: number
  }
}

// Error
{
  success: false,
  message: string,
  errors?: Record<string, string[]>
}
```

## HTTP Status Codes

| Code | Usage                            |
| ---- | -------------------------------- |
| 200  | Success                          |
| 201  | Created                          |
| 400  | Validation error                 |
| 401  | Unauthenticated                  |
| 403  | Forbidden (missing permission)   |
| 404  | Not found                        |
| 409  | Conflict (duplicate email, etc.) |
| 500  | Internal server error            |

## Endpoints

### Auth

Better Auth manages its own routes under `/api/auth/*` — do not create custom auth endpoints.

### Users

| Method | Path            | Permission   | Description                            |
| ------ | --------------- | ------------ | -------------------------------------- |
| GET    | /api/users      | users.read   | List (paginated, searchable, sortable) |
| GET    | /api/users/[id] | users.read   | Get by ID                              |
| POST   | /api/users      | users.create | Create user                            |
| PATCH  | /api/users/[id] | users.update | Update user                            |
| DELETE | /api/users/[id] | users.delete | Soft delete                            |

Query params for GET /api/users:

| Param     | Type       | Default   | Description             |
| --------- | ---------- | --------- | ----------------------- |
| page      | number     | 1         | —                       |
| pageSize  | number     | 20        | —                       |
| search    | string     | —         | Search by name or email |
| sortBy    | string     | createdAt | —                       |
| sortOrder | asc / desc | desc      | —                       |

### Roles

| Method | Path            | Permission   | Description                                  |
| ------ | --------------- | ------------ | -------------------------------------------- |
| GET    | /api/roles      | roles.read   | List                                         |
| GET    | /api/roles/[id] | roles.read   | Get by ID (includes permissions)             |
| POST   | /api/roles      | roles.create | Create role                                  |
| PATCH  | /api/roles/[id] | roles.update | Update role (name, description, permissions) |
| DELETE | /api/roles/[id] | roles.delete | Delete role (not if isSystem)                |

### Permissions

| Method | Path                  | Permission         | Description                  |
| ------ | --------------------- | ------------------ | ---------------------------- |
| GET    | /api/permissions      | permissions.read   | List (grouped)               |
| PATCH  | /api/permissions/[id] | permissions.update | Update permission name/group |

Permissions are primarily managed at the data level (seeded). The UI allows assigning them to roles, not CRUD on the permission itself.

### Profile

| Method | Path                  | Permission      | Description                               |
| ------ | --------------------- | --------------- | ----------------------------------------- |
| PATCH  | /api/profile          | profile.update  | Update name or avatar URL                 |
| POST   | /api/profile/avatar   | profile.update  | Upload avatar image (multipart, max 5MB)  |
| POST   | /api/profile/password | password.change | Change password (current + new + confirm) |

Profile endpoints operate on the authenticated user's own record — no `[id]` parameter needed.

Query params for POST /api/profile/avatar: multipart/form-data with `file` field.

### Dashboard

| Method | Path                 | Permission | Description                                  |
| ------ | -------------------- | ---------- | -------------------------------------------- |
| GET    | /api/dashboard/stats | —          | Returns aggregate counts for dashboard cards |

Response:

```typescript
{
  success: true,
  data: {
    totalUsers: number,
    activeUsers: number,
    totalRoles: number,
    totalPermissions: number,
  }
}
```

## Typed API Client

No direct `fetch()` calls in components. Use typed service wrappers:

```typescript
// src/api/user.api.ts
import { apiClient } from "@/lib/api-client";

export const userApi = {
  list: (params?: UserListParams) =>
    apiClient.get<UserListResponse>("/api/users", { params }),

  getById: (id: string) => apiClient.get<UserResponse>(`/api/users/${id}`),

  create: (data: CreateUserDTO) =>
    apiClient.post<UserResponse>("/api/users", data),

  update: (id: string, data: UpdateUserDTO) =>
    apiClient.patch<UserResponse>(`/api/users/${id}`, data),

  delete: (id: string) => apiClient.delete<void>(`/api/users/${id}`),
};
```

```typescript
// src/lib/api-client.ts — simple typed wrapper around fetch
export const apiClient = {
  get: <T>(url: string, opts?: RequestInit) =>
    request<T>(url, { ...opts, method: "GET" }),
  post: <T>(url: string, body: unknown) =>
    request<T>(url, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(url: string, body: unknown) =>
    request<T>(url, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(url: string) => request<T>(url, { method: "DELETE" }),
};
```

## Service Layer

Business logic lives in services, not in route handlers:

```typescript
// src/services/user.service.ts
export const userService = {
  async list(params: UserListParams): Promise<PaginatedResult<User>> { ... },
  async getById(id: string): Promise<User> { ... },
  async create(data: CreateUserDTO): Promise<User> { ... },
  async update(id: string, data: UpdateUserDTO): Promise<User> { ... },
  async delete(id: string): Promise<void> { ... },
}
```

Route handlers delegate to services:

```typescript
// src/app/api/users/route.ts
export async function GET(request: Request) {
  const session = await auth.api.getSession(request);
  if (!session) return unauthorized();
  requirePermission(session.user, "users.read");

  const result = await userService.list(getParams(request));
  return success(result);
}
```
