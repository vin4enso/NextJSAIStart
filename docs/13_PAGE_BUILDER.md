# Page Builder

## Overview

Block-based page builder powered by [Puck](https://puckeditor.com) (`@puckeditor/core`). Page content is stored as a Puck `Data` JSON blob in the `pages.content` column — no separate `page_blocks` table.

### Architecture

```
@puckeditor/core
├── <Puck>         — Visual editor (admin UI)
└── <Render>       — Public renderer (frontend)

src/lib/puck/
├── config.tsx     — Puck Config with all 13 block types
├── types.ts       — TypeScript props for each block component
└── index.ts       — Barrel exports

src/app/admin/pages/[id]/
└── page.tsx       — Server Component → <PuckEditor> (client)

src/app/(public)/
├── page.tsx              — Home page <Render>
├── [slug]/page.tsx       — Section/page <Render>
└── [slug]/[pageSlug]/
    └── page.tsx          — Child page <Render>
```

## Content Storage

Puck data is serialized as JSON in the `pages.content` column:

```json
{
  "content": [
    {
      "type": "SectionBlock",
      "props": { "title": "Hero" },
      "children": [
        {
          "zone": "content",
          "content": [
            { "type": "HeadingBlock", "props": { "text": "Welcome" } }
          ]
        }
      ]
    }
  ],
  "root": { "props": {} }
}
```

### Key Service Methods

| Method                              | Purpose                                  |
| ----------------------------------- | ---------------------------------------- |
| `pageService.getContent(id)`        | Parse `pages.content` → Puck `Data`      |
| `pageService.saveContent(id, data)` | Serialize Puck `Data` → `pages.content`  |
| `pageService.publish(id)`           | Set `publishedAt` + `isPublished = true` |

Data flow: editor saves JSON → `pages.content` column → public routes read and render via `<Render>`.

## Services

### page.service.ts

| Method                                                             | Status |
| ------------------------------------------------------------------ | ------ |
| `list(params)` — paginated list with search, section filter        | ✅     |
| `getById(id)` — single page with section info                      | ✅     |
| `getBySlug(slug)` — root page by slug                              | ✅     |
| `getBySectionAndSlug(sectionSlug, pageSlug)` — page within section | ✅     |
| `getHome()` — home page                                            | ✅     |
| `create(data)` — with slug uniqueness check                        | ✅     |
| `update(id, data)` — partial update with slug validation           | ✅     |
| `delete(id)` — soft delete, home page protection                   | ✅     |
| `getContent(id)` — parse `pages.content` as Puck `Data`            | ✅     |
| `saveContent(id, data)` — serialize and save Puck `Data`           | ✅     |
| `publish(id)` — set publishedAt + isPublished                      | ✅     |

## API Routes

| Method | Path                      | Permission     | Purpose                             |
| ------ | ------------------------- | -------------- | ----------------------------------- |
| GET    | `/api/pages`              | `pages.read`   | List pages                          |
| POST   | `/api/pages`              | `pages.create` | Create page                         |
| GET    | `/api/pages/[id]`         | `pages.read`   | Get page                            |
| PATCH  | `/api/pages/[id]`         | `pages.update` | Update page                         |
| DELETE | `/api/pages/[id]`         | `pages.delete` | Soft-delete page                    |
| POST   | `/api/pages/[id]/publish` | `pages.update` | Publish/unpublish                   |
| POST   | `/api/pages/[id]/content` | `pages.update` | Save Puck `Data` to `pages.content` |

All endpoints return `{ success, data|message }`.

## Block Types (Puck Components)

| Puck Component   | Props                                                             | Fields                             |
| ---------------- | ----------------------------------------------------------------- | ---------------------------------- |
| `SectionBlock`   | `{ title?, subtitle? }` + `renderDropZone`                        | text, text                         |
| `HeadingBlock`   | `{ text, level, alignment? }`                                     | text, number, radio                |
| `ParagraphBlock` | `{ html, alignment? }`                                            | textarea, radio                    |
| `ImageBlock`     | `{ src, alt, caption?, sizing? }`                                 | text, text, text, select           |
| `CtaBlock`       | `{ title?, description?, buttonText, buttonUrl, buttonVariant? }` | text, textarea, text, text, select |
| `ColumnsBlock`   | `{ columnsCount }` + `renderDropZone` per column                  | number                             |
| `ColumnBlock`    | (uses `renderDropZone`)                                           | none                               |
| `FaqBlock`       | `{ items: FaqItem[] }`                                            | array                              |
| `DividerBlock`   | `{ style?, color?, thickness? }`                                  | select, color, number              |
| `VideoBlock`     | `{ url, autoplay?, controls? }`                                   | text, boolean, boolean             |
| `GalleryBlock`   | `{ images: GalleryImage[], layout? }`                             | array, select                      |
| `PricingBlock`   | `{ plans: PricingPlan[], currency? }`                             | array, text                        |
| `FormBlock`      | `{ fields: FormField[], submitLabel? }`                           | array, text                        |

Types defined in `src/lib/puck/types.ts`. Config registered in `src/lib/puck/config.tsx`.

## Admin UI

### Page List (`/admin/pages`)

Standard CRUD table with:

- `PageHeader` with title/description and "Create Page" button
- `DataToolbar` with `SearchInput`
- `AppTable` with columns: Title (with Home/Index badges), Slug, Section, Published badge, Actions
- `PageFormDialog` — create/edit page metadata
- "Blocks" action → navigates to `/admin/pages/[id]` (Puck editor)
- Publish/unpublish quick action

### Page Editor (`/admin/pages/[id]`)

Client component using `<Puck>` from `@puckeditor/core`:

- Loads initial data from `pageService.getContent(id)`
- Saves via `pageService.saveContent(id, data)` on publish
- On publish: saves content + sets `isPublished = true`

```tsx
<Puck
  config={config}
  data={initialData}
  onPublish={async (data) => {
    await pageService.saveContent(pageId, data);
    await pageService.publish(pageId);
  }}
/>
```

## Public Rendering

Public routes use `<Render>` from `@puckeditor/core`:

| Route                                 | Source                                  |
| ------------------------------------- | --------------------------------------- |
| `(public)/page.tsx`                   | Home page content                       |
| `(public)/[slug]/page.tsx`            | Section landing page or standalone page |
| `(public)/[slug]/[pageSlug]/page.tsx` | Child page within a section             |

All routes:

1. Fetch page via `pageService`
2. Parse content via `pageService.getContent(id)` → `Data`
3. Render via `<Render config={config} data={data} />`

Block components are the same files in `src/components/blocks/*.tsx`, now receiving individual props (not the old `PageBlock` shape).

## Permission Model

- `pages.read` — view/read pages and view page editor
- `pages.create` — create pages
- `pages.update` — edit pages, save content, publish
- `pages.delete` — delete pages

No block-specific permissions needed — block editing is covered by `pages.update`.

## Extending Block Types

Adding a new block type takes 3 steps:

1. **Types** — add props type in `src/lib/puck/types.ts`
2. **Config** — register in `src/lib/puck/config.tsx` with fields + render
3. **Component** — create `src/components/blocks/{name}-block.tsx`

Puck handles the editor UI, drag-drop, and JSON serialisation automatically.
