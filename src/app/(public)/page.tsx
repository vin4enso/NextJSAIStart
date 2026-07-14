import { pageService } from "@/services/page.service";
import { pageBlockService } from "@/services/page-block.service";
import { BlockRenderer } from "@/components/blocks/block-renderer";

export default async function HomePage() {
  const page = await pageService.getHome();

  if (!page) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground text-lg">
          Welcome! Create a home page in the admin panel.
        </p>
      </div>
    );
  }

  const blocks = await pageBlockService.getTree(page.id);

  return (
    <article className="prose prose-lg max-w-none">
      <h1>{page.title}</h1>
      {blocks.length > 0 && <BlockRenderer blocks={blocks} />}
    </article>
  );
}
