import { auth } from "@/lib/auth";
import { pageService } from "@/services/page.service";
import { requirePermission } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { BlockEditor } from "@/components/blocks/block-editor";

export default async function PageEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/");
  await requirePermission(session.user.id, "pages.update");

  const page = await pageService.getWithBlocks(id);
  if (!page) redirect("/admin/pages");

  return <BlockEditor pageId={id} initialBlocks={page.blocks ?? []} />;
}
