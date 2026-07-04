import { auth } from "@/lib/auth";
import {
  success,
  unauthorized,
  notFound,
  internalError,
} from "@/lib/api-response";
import { requirePermission } from "@/lib/rbac";
import { permissionService } from "@/services/permission.service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return unauthorized();

    await requirePermission(session.user.id, "permissions.update");

    const { id } = await params;
    const body = await request.json();
    const data = await permissionService.update(id, body);
    if (!data) return notFound();

    return success(data);
  } catch (error) {
    if (error instanceof Response) return error;
    return internalError();
  }
}
