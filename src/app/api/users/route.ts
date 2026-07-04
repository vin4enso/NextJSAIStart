import { auth } from "@/lib/auth";
import { success, unauthorized, internalError } from "@/lib/api-response";
import { requirePermission } from "@/lib/rbac";
import { userService } from "@/services/user.service";
import type { UserListParams } from "@/schemas/user";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return unauthorized();

    await requirePermission(session.user.id, "users.read");

    const url = new URL(request.url);
    const params: UserListParams = {
      page: url.searchParams.get("page")
        ? Number(url.searchParams.get("page"))
        : undefined,
      pageSize: url.searchParams.get("pageSize")
        ? Number(url.searchParams.get("pageSize"))
        : undefined,
      search: url.searchParams.get("search") || undefined,
      sortBy: url.searchParams.get("sortBy") || undefined,
      sortOrder:
        (url.searchParams.get("sortOrder") as "asc" | "desc") || undefined,
    };

    const result = await userService.list(params);

    return success(result.items, {
      page: result.page,
      pageSize: result.pageSize,
      total: result.total,
      totalPages: result.totalPages,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return internalError();
  }
}
