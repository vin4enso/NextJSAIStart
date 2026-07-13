import { auth } from "@/lib/auth";
import { pageService } from "@/services/page.service";
import { requirePermission } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { BlockEditor } from "@/components/blocks/block-editor";

export default async function PageEditorPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth.api.getSession();
  if (!session?.user) redirect("/");
  await requirePermission(session.user.id, "pages.update");

  const page = await pageService.getWithBlocks(params.id);
  if (!page) redirect("/admin/pages");

  return <BlockEditor pageId={params.id} initialBlocks={page.blocks ?? []} />;
}
