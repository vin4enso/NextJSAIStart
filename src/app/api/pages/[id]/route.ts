import { auth } from "@/lib/auth";
import {
  success,
  unauthorized,
  notFound,
  validationError,
  internalError,
} from "@/lib/api-response";
import { requirePermission } from "@/lib/rbac";
import { pageService } from "@/services/page.service";
import { UpdatePageSchema } from "@/schemas/page";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return unauthorized();

    await requirePermission(session.user.id, "pages.read");

    const { id } = await params;
    const page = await pageService.getById(id);
    if (!page) return notFound();

    return success(page);
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

    await requirePermission(session.user.id, "pages.update");

    const { id } = await params;
    const body = await request.json();
    const parsed = UpdatePageSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(
        parsed.error.flatten().fieldErrors as Record<string, string[]>,
      );
    }

    const page = await pageService.update(id, parsed.data);
    if (!page) {
      return validationError({ slug: ["Page with this slug already exists"] });
    }

    return success(page);
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

    await requirePermission(session.user.id, "pages.delete");

    const { id } = await params;
    const deleted = await pageService.delete(id);
    if (!deleted) {
      return validationError({ page: ["Cannot delete the home page"] });
    }

    return success(null);
  } catch (error) {
    if (error instanceof Response) return error;
    return internalError();
  }
}
