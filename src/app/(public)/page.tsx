import { pageService } from "@/services/page.service";

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

  return (
    <article className="prose prose-lg max-w-none">
      <h1>{page.title}</h1>
      {page.content && (
        <div dangerouslySetInnerHTML={{ __html: page.content }} />
      )}
    </article>
  );
}
