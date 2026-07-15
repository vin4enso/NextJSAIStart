import { notFound } from "next/navigation";
import { pageService } from "@/services/page.service";
import { Render } from "@puckeditor/core";
import { config } from "@/lib/puck";

export default async function PublicChildPage({
  params,
}: {
  params: Promise<{ slug: string; pageSlug: string }>;
}) {
  const { slug, pageSlug } = await params;

  const page = await pageService.getBySectionAndSlug(slug, pageSlug);
  if (!page || !page.isPublished) {
    notFound();
  }

  const content = await pageService.getContent(page.id);

  return (
    <article className="prose prose-lg max-w-none">
      <h1>{page.title}</h1>
      {content && <Render config={config} data={content} />}
    </article>
  );
}
