import { auth } from "@/lib/auth";
import {
  success,
  unauthorized,
  notFound,
  validationError,
  internalError,
  error,
} from "@/lib/api-response";
import { requirePermission } from "@/lib/rbac";
import { roleService } from "@/services/role.service";
import { updateRoleSchema } from "@/schemas/role";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return unauthorized();

    await requirePermission(session.user.id, "roles.read");

    const { id } = await params;
    const data = await roleService.getById(id);
    if (!data) return notFound();

    return success(data);
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

    await requirePermission(session.user.id, "roles.update");

    const { id } = await params;
    const body = await request.json();
    const parsed = updateRoleSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(
        parsed.error.flatten().fieldErrors as Record<string, string[]>,
      );
    }

    const data = await roleService.update(id, parsed.data);
    return success(data);
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

    await requirePermission(session.user.id, "roles.delete");

    const { id } = await params;
    const result = await roleService.delete(id);
    if (!result) {
      return error("Cannot delete system role or role with users", 400);
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof Response) return error;
    return internalError();
  }
}
