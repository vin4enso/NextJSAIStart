import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { sections, pages } from "@/drizzle/schema";
import { eq, and, isNull } from "drizzle-orm";

/**
 * Migrates existing sections that don't have an index page.
 * Creates an index page from the section's data (name, content, meta).
 */
async function migrateSections() {
  const allSections = db.select().from(sections).all();
  let created = 0;

  for (const section of allSections) {
    const [existingIndex] = await db
      .select({ id: pages.id })
      .from(pages)
      .where(
        and(
          eq(pages.sectionId, section.id),
          eq(pages.slug, "index"),
          isNull(pages.deletedAt),
        ),
      )
      .limit(1);

    if (existingIndex) {
      console.log(`  [skip] Section "${section.name}" already has index page`);
      continue;
    }

    const now = new Date().toISOString();
    db.insert(pages)
      .values({
        id: randomUUID(),
        sectionId: section.id,
        title: section.name,
        slug: "index",
        content: section.content ?? "",
        metaTitle: section.metaTitle ?? "",
        metaDescription: section.metaDescription ?? "",
        isPublished: section.isPublished,
        isHome: false,
        publishedAt: section.isPublished ? now : null,
        createdAt: now,
        updatedAt: now,
      })
      .run();

    console.log(`  [ok] Created index page for section "${section.name}"`);
    created++;
  }

  console.log(`\nDone. Created ${created} index page(s).`);
}

const isMainModule = process.argv[1]?.includes("migrate-sections");
if (isMainModule) {
  console.log("Migrating sections to index pages...\n");
  migrateSections()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Migration failed:", err);
      process.exit(1);
    });
}

export { migrateSections };
