import { auth } from "@/lib/auth";
import {
  success,
  unauthorized,
  notFound,
  validationError,
  internalError,
} from "@/lib/api-response";
import { db } from "@/lib/db";
import { roles, userRoles } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { requirePermission } from "@/lib/rbac";
import { userService } from "@/services/user.service";
import { updateUserSchema } from "@/schemas/user";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return unauthorized();

    await requirePermission(session.user.id, "users.read");

    const { id } = await params;
    const user = await userService.getById(id);
    if (!user) return notFound();

    const userRolesData = db
      .select({
        roleId: roles.id,
        roleName: roles.name,
      })
      .from(userRoles)
      .innerJoin(roles, eq(roles.id, userRoles.roleId))
      .where(eq(userRoles.userId, id))
      .all();

    return success({
      ...user,
      roles: userRolesData.map((r) => ({ id: r.roleId, name: r.roleName })),
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return internalError();
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return unauthorized();

    await requirePermission(session.user.id, "users.update");

    const { id } = await params;
    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(
        parsed.error.flatten().fieldErrors as Record<string, string[]>,
      );
    }

    const user = await userService.update(id, parsed.data);
    if (!user) return notFound();

    const userRolesData = db
      .select({
        roleId: roles.id,
        roleName: roles.name,
      })
      .from(userRoles)
      .innerJoin(roles, eq(roles.id, userRoles.roleId))
      .where(eq(userRoles.userId, id))
      .all();

    return success({
      ...user,
      roles: userRolesData.map((r) => ({ id: r.roleId, name: r.roleName })),
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return internalError();
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return unauthorized();

    await requirePermission(session.user.id, "users.delete");

    const { id } = await params;
    await userService.softDelete(id);

    return success({ message: "User deleted" });
  } catch (error) {
    if (error instanceof Response) return error;
    return internalError();
  }
}
