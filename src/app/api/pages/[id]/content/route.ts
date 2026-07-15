import { auth } from "@/lib/auth";
import {
  success,
  unauthorized,
  notFound,
  internalError,
} from "@/lib/api-response";
import { requirePermission } from "@/lib/rbac";
import { pageService } from "@/services/page.service";

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

    const page = await pageService.saveContent(id, body);
    if (!page) return notFound();

    return success(page);
  } catch (error) {
    if (error instanceof Response) return error;
    return internalError();
  }
}
