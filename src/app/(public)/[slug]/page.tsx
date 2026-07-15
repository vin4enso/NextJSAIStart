import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { sectionService } from "@/services/section.service";
import { pageService } from "@/services/page.service";
import { Render } from "@puckeditor/core";
import { config } from "@/lib/puck";

export default async function PublicSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const t = await getTranslations("page");
  const { slug } = await params;

  const section = await sectionService.getBySlug(slug);
  if (section && section.isPublished) {
    const indexPage = await pageService.getBySectionAndSlug(
      section.slug,
      "index",
    );
    const childPages = indexPage
      ? await pageService.listBySection(section.id, { excludeSlug: "index" })
      : await pageService.listBySection(section.id);

    const content = indexPage
      ? await pageService.getContent(indexPage.id)
      : null;

    return (
      <div>
        <article className="prose prose-lg max-w-none">
          <h1>{indexPage?.title ?? section.name}</h1>
          {section.description && !indexPage && (
            <p className="lead">{section.description}</p>
          )}
          {content && <Render config={config} data={content} />}
        </article>

        {childPages.length > 0 && (
          <nav className="mt-12 border-t pt-8">
            <h2 className="text-muted-foreground mb-4 text-sm font-medium tracking-wider uppercase">
              {t("pagesInSection")}
            </h2>
            <ul className="space-y-3">
              {childPages.map(
                (p: { id: string; slug: string; title: string }) => (
                  <li key={p.id}>
                    <Link
                      href={`/${section.slug}/${p.slug}`}
                      className="hover:text-primary text-base font-medium transition-colors"
                    >
                      {p.title}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </nav>
        )}
      </div>
    );
  }

  const page = await pageService.getBySlug(slug);
  if (page && page.isPublished) {
    const content = await pageService.getContent(page.id);
    return (
      <article className="prose prose-lg max-w-none">
        <h1>{page.title}</h1>
        {content && <Render config={config} data={content} />}
      </article>
    );
  }

  notFound();
}
