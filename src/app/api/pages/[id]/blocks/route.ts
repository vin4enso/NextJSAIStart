import { auth } from "@/lib/auth";
import {
  success,
  created,
  unauthorized,
  validationError,
  internalError,
} from "@/lib/api-response";
import { requirePermission } from "@/lib/rbac";
import { pageBlockService } from "@/services/page-block.service";
import { CreateBlockDTOSchema } from "@/schemas/page-block";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return unauthorized();

    await requirePermission(session.user.id, "pages.read");

    const { id } = await params;
    const tree = await pageBlockService.getTree(id);

    return success(tree);
  } catch (error) {
    if (error instanceof Response) return error;
    return internalError();
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return unauthorized();

    await requirePermission(session.user.id, "pages.update");

    const { id } = await params;
    const body = await request.json();
    const parsed = CreateBlockDTOSchema.safeParse({ ...body, pageId: id });
    if (!parsed.success) {
      return validationError(
        parsed.error.flatten().fieldErrors as Record<string, string[]>,
      );
    }

    const block = await pageBlockService.create(parsed.data);
    return created(block);
  } catch (error) {
    if (error instanceof Response) return error;
    return internalError();
  }
}
