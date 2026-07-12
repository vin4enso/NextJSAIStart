import { auth } from "@/lib/auth";
import {
  success,
  created,
  unauthorized,
  validationError,
  internalError,
} from "@/lib/api-response";
import { requirePermission } from "@/lib/rbac";
import { pageService } from "@/services/page.service";
import { CreatePageSchema } from "@/schemas/page";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return unauthorized();

    await requirePermission(session.user.id, "pages.read");

    const url = new URL(request.url);
    const params = {
      page: url.searchParams.get("page")
        ? Number(url.searchParams.get("page"))
        : undefined,
      pageSize: url.searchParams.get("pageSize")
        ? Number(url.searchParams.get("pageSize"))
        : undefined,
      search: url.searchParams.get("search") || undefined,
      sectionId: url.searchParams.get("sectionId") || undefined,
    };

    const result = await pageService.list(params);
    return success({
      items: result.items,
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return internalError();
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return unauthorized();

    await requirePermission(session.user.id, "pages.create");

    const body = await request.json();
    const parsed = CreatePageSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(
        parsed.error.flatten().fieldErrors as Record<string, string[]>,
      );
    }

    const page = await pageService.create(parsed.data);
    if (!page) {
      return validationError({ slug: ["Page with this slug already exists"] });
    }

    return created(page);
  } catch (error) {
    if (error instanceof Response) return error;
    return internalError();
  }
}
