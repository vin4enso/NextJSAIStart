import { notFound } from "next/navigation";
import { pageService } from "@/services/page.service";

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

  return (
    <article className="prose prose-lg max-w-none">
      <h1>{page.title}</h1>
      {page.content && (
        <div dangerouslySetInnerHTML={{ __html: page.content }} />
      )}
    </article>
  );
}
