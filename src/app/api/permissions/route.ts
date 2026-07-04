import { auth } from "@/lib/auth";
import { success, unauthorized, internalError } from "@/lib/api-response";
import { requirePermission } from "@/lib/rbac";
import { permissionService } from "@/services/permission.service";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return unauthorized();

    await requirePermission(session.user.id, "permissions.read");

    const data = await permissionService.list();
    return success(data);
  } catch (error) {
    if (error instanceof Response) return error;
    return internalError();
  }
}
