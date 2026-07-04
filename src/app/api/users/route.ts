import { auth } from "@/lib/auth";
import {
  success,
  created,
  unauthorized,
  validationError,
  internalError,
} from "@/lib/api-response";
import { db } from "@/lib/db";
import { roles, userRoles } from "@/drizzle/schema";
import { eq, inArray } from "drizzle-orm";
import { requirePermission } from "@/lib/rbac";
import { userService } from "@/services/user.service";
import { createUserSchema } from "@/schemas/user";
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

    const userIds = result.items.map((u) => u.id);
    const userRolesData =
      userIds.length > 0
        ? db
            .select({
              userId: userRoles.userId,
              roleId: roles.id,
              roleName: roles.name,
            })
            .from(userRoles)
            .innerJoin(roles, eq(roles.id, userRoles.roleId))
            .where(inArray(userRoles.userId, userIds))
            .all()
        : [];

    const rolesByUser: Record<string, { id: string; name: string }[]> = {};
    for (const ur of userRolesData) {
      if (!rolesByUser[ur.userId]) rolesByUser[ur.userId] = [];
      rolesByUser[ur.userId].push({ id: ur.roleId, name: ur.roleName });
    }

    const items = result.items.map((u) => ({
      ...u,
      roles: rolesByUser[u.id] || [],
    }));

    return success({
      items,
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return internalError();
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return unauthorized();

    await requirePermission(session.user.id, "users.create");

    const body = await request.json();
    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(
        parsed.error.flatten().fieldErrors as Record<string, string[]>,
      );
    }

    const user = await userService.create(parsed.data);
    if (!user) return internalError();

    const userRolesData = db
      .select({
        roleId: roles.id,
        roleName: roles.name,
      })
      .from(userRoles)
      .innerJoin(roles, eq(roles.id, userRoles.roleId))
      .where(eq(userRoles.userId, user.id))
      .all();

    return created({
      ...user,
      roles: userRolesData.map((r) => ({ id: r.roleId, name: r.roleName })),
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return internalError();
  }
}
