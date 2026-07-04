import { auth } from "@/lib/auth";
import {
  success,
  unauthorized,
  internalError,
  error,
} from "@/lib/api-response";
import { requirePermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return unauthorized();

    await requirePermission(session.user.id, "password.change");

    const body = await request.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return error("All fields are required", 400);
    }

    if (newPassword !== confirmPassword) {
      return error("Passwords do not match", 400);
    }

    if (newPassword.length < 6) {
      return error("Password must be at least 6 characters", 400);
    }

    const [user] = db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .all();

    if (!user?.passwordHash) {
      return error("Cannot change password for this account", 400);
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return error("Current password is incorrect", 400);
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    db.update(users)
      .set({ passwordHash: hashed, updatedAt: new Date().toISOString() })
      .where(eq(users.id, session.user.id))
      .run();

    return success({ message: "Password changed successfully" });
  } catch (error) {
    if (error instanceof Response) return error;
    return internalError();
  }
}
