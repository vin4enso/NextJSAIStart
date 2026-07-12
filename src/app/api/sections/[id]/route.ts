import { auth } from "@/lib/auth";
import {
  success,
  unauthorized,
  notFound,
  validationError,
  internalError,
} from "@/lib/api-response";
import { requirePermission } from "@/lib/rbac";
import { sectionService } from "@/services/section.service";
import { UpdateSectionSchema } from "@/schemas/section";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return unauthorized();

    await requirePermission(session.user.id, "sections.read");

    const { id } = await params;
    const section = await sectionService.getById(id);
    if (!section) return notFound();

    return success(section);
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

    await requirePermission(session.user.id, "sections.update");

    const { id } = await params;
    const body = await request.json();
    const parsed = UpdateSectionSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(
        parsed.error.flatten().fieldErrors as Record<string, string[]>,
      );
    }

    const section = await sectionService.update(id, parsed.data);
    if (!section) {
      return validationError({
        slug: ["Section with this slug already exists"],
      });
    }

    return success(section);
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

    await requirePermission(session.user.id, "sections.delete");

    const { id } = await params;
    const deleted = await sectionService.delete(id);
    if (!deleted) {
      return validationError({
        section: ["Cannot delete section with existing pages"],
      });
    }

    return success(null);
  } catch (error) {
    if (error instanceof Response) return error;
    return internalError();
  }
}
