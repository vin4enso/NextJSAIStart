import { notFound } from "next/navigation";
import { pageService } from "@/services/page.service";
import { pageBlockService } from "@/services/page-block.service";
import { BlockRenderer } from "@/components/blocks/block-renderer";

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

  const blocks = await pageBlockService.getTree(page.id);

  return (
    <article className="prose prose-lg max-w-none">
      <h1>{page.title}</h1>
      {blocks.length > 0 && <BlockRenderer blocks={blocks} />}
    </article>
  );
}
