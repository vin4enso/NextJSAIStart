import { auth } from "@/lib/auth";
import { success, unauthorized, internalError } from "@/lib/api-response";
import { db } from "@/lib/db";
import { users, roles, permissions } from "@/drizzle/schema";
import { count, eq, isNull } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return unauthorized();

    const [totalUsers] = db
      .select({ count: count() })
      .from(users)
      .where(isNull(users.deletedAt))
      .all();

    const [activeUsers] = db
      .select({ count: count() })
      .from(users)
      .where(eq(users.isActive, true))
      .all();

    const [totalRoles] = db.select({ count: count() }).from(roles).all();

    const [totalPermissions] = db
      .select({ count: count() })
      .from(permissions)
      .all();

    return success({
      totalUsers: totalUsers.count,
      activeUsers: activeUsers.count,
      totalRoles: totalRoles.count,
      totalPermissions: totalPermissions.count,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return internalError();
  }
}
