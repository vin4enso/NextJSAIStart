import { notFound } from "next/navigation";
import { sectionService } from "@/services/section.service";
import { pageService } from "@/services/page.service";

export default async function PublicSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const section = await sectionService.getBySlug(slug);
  if (section && section.isPublished) {
    return (
      <article className="prose prose-lg max-w-none">
        <h1>{section.name}</h1>
        {section.description && <p className="lead">{section.description}</p>}
        {section.content && (
          <div dangerouslySetInnerHTML={{ __html: section.content }} />
        )}
      </article>
    );
  }

  const page = await pageService.getBySlug(slug);
  if (page && page.isPublished) {
    return (
      <article className="prose prose-lg max-w-none">
        <h1>{page.title}</h1>
        {page.content && (
          <div dangerouslySetInnerHTML={{ __html: page.content }} />
        )}
      </article>
    );
  }

  notFound();
}
