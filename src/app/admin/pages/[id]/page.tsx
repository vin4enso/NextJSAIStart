import { auth } from "@/lib/auth";
import { pageService } from "@/services/page.service";
import { requirePermission } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import type { Data } from "@puckeditor/core";
import { PuckEditor } from "./_components/puck-editor";

export default async function PageEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/");
  await requirePermission(session.user.id, "pages.update");

  const page = await pageService.getById(id);
  if (!page) redirect("/admin/pages");

  const data: Data = page.content
    ? JSON.parse(page.content)
    : { content: [], root: { props: {} } };

  return <PuckEditor pageId={id} initialData={data} pageTitle={page.title} />;
}
