import { auth } from "@/lib/auth";
import { success, unauthorized, internalError } from "@/lib/api-response";
import { requirePermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function PATCH(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return unauthorized();

    await requirePermission(session.user.id, "profile.update");

    const body = await request.json();
    const updateData: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (body.name !== undefined) updateData.name = body.name;
    if (body.avatar !== undefined) updateData.avatar = body.avatar;

    db.update(users).set(updateData).where(eq(users.id, session.user.id)).run();

    const [updated] = db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .all();

    return success({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      avatar: updated.avatar,
      isActive: updated.isActive,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return internalError();
  }
}
