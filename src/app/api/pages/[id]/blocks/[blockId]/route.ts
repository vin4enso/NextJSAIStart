import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import {
  success,
  unauthorized,
  validationError,
  internalError,
} from "@/lib/api-response";
import { requirePermission } from "@/lib/rbac";
import { pageBlockService } from "@/services/page-block.service";
import { UpdateBlockDTOSchema } from "@/schemas/page-block";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; blockId: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return unauthorized();

    await requirePermission(session.user.id, "pages.update");

    const { blockId } = await params;
    const body = await request.json();
    const parsed = UpdateBlockDTOSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(
        parsed.error.flatten().fieldErrors as Record<string, string[]>,
      );
    }

    const block = await pageBlockService.update(blockId, parsed.data);
    if (!block) {
      const t = await getTranslations("errors");
      return validationError({ blockId: [t("blockNotFound")] });
    }

    return success(block);
  } catch (error) {
    if (error instanceof Response) return error;
    return internalError();
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; blockId: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return unauthorized();

    await requirePermission(session.user.id, "pages.update");

    const { blockId } = await params;
    const deleted = await pageBlockService.delete(blockId);
    if (!deleted) {
      const t = await getTranslations("errors");
      return validationError({ blockId: [t("blockNotFound")] });
    }

    return success(null);
  } catch (error) {
    if (error instanceof Response) return error;
    return internalError();
  }
}
