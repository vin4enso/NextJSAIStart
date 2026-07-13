import { auth } from "@/lib/auth";
import {
  success,
  unauthorized,
  validationError,
  internalError,
} from "@/lib/api-response";
import { requirePermission } from "@/lib/rbac";
import { pageBlockService } from "@/services/page-block.service";
import { z } from "zod";

const ReorderSchema = z.object({
  blockIds: z.array(z.string()).min(1),
});

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
    const parsed = ReorderSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(
        parsed.error.flatten().fieldErrors as Record<string, string[]>,
      );
    }

    await pageBlockService.reorder(id, parsed.data.blockIds);
    return success(null);
  } catch (error) {
    if (error instanceof Response) return error;
    return internalError();
  }
}
