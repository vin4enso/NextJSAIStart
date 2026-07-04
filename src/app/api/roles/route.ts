import { auth } from "@/lib/auth";
import {
  success,
  created,
  unauthorized,
  validationError,
  internalError,
} from "@/lib/api-response";
import { requirePermission } from "@/lib/rbac";
import { roleService } from "@/services/role.service";
import { createRoleSchema } from "@/schemas/role";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return unauthorized();

    await requirePermission(session.user.id, "roles.read");

    const data = await roleService.list();
    return success(data);
  } catch (error) {
    if (error instanceof Response) return error;
    return internalError();
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return unauthorized();

    await requirePermission(session.user.id, "roles.create");

    const body = await request.json();
    const parsed = createRoleSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(
        parsed.error.flatten().fieldErrors as Record<string, string[]>,
      );
    }

    const data = await roleService.create(parsed.data);
    return created(data);
  } catch (error) {
    if (error instanceof Response) return error;
    return internalError();
  }
}
