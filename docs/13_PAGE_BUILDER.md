# Page Builder

## Overview

Block-based page builder for public site pages. Replaces the existing `content` (richtext/HTML) field on pages with structured, reusable blocks. Each block has a `blockType` and a typed JSON `config` validated by Zod discriminated union.

The project **already has** a full CRUD for pages: DB table, service (`src/services/page.service.ts`), API routes, admin list page at `/admin/pages` with form dialog, i18n keys, and menu item. The page builder adds block management on top of this existing infrastructure.

## Schema

### pages (existing — extended)

| Column      | Type                    | Notes                 |
| ----------- | ----------------------- | --------------------- |
| id          | text (PK)               | uuid                  |
| sectionId   | text (FK → sections.id) | nullable              |
| title       | text                    |                       |
| slug        | text                    | unique                |
| isPublished | boolean                 |                       |
| isHome      | boolean                 |                       |
| publishedAt | text (ISO)              | nullable              |
| createdAt   | text (ISO)              |                       |
| updatedAt   | text (ISO)              |                       |
| deletedAt   | text (ISO)              | nullable, soft delete |

The `content` column is **removed** — replaced by `page_blocks`.

### sections (existing — unchanged)

`content` column is kept for backwards compatibility; sections may be migrated to blocks later.

### page_blocks (new)

| Column    | Type                       | Notes                                |
| --------- | -------------------------- | ------------------------------------ |
| id        | text (PK)                  | uuid                                 |
| pageId    | text (FK → pages.id)       | ON DELETE CASCADE                    |
| parentId  | text (FK → page_blocks.id) | nullable, self-reference for nesting |
| blockType | text                       | enum-like                            |
| sortOrder | integer                    |                                      |
| config    | text (JSON)                | validated by Zod per blockType       |
| createdAt | text (ISO)                 |                                      |
| updatedAt | text (ISO)                 |                                      |

### Hierarchy via parentId

- Blocks with `parentId = NULL` — root-level blocks, ordered by `sortOrder`
- `section` block — container, may wrap child blocks
- `columns` block — config has `columnsCount`, each column is a child block `{ blockType: 'column' }`
- Inside a column — regular blocks with `parentId` pointing to the column block

## Block Types

| Type        | Description                                                             |
| ----------- | ----------------------------------------------------------------------- |
| `section`   | Container with padding, background, optional title/subtitle             |
| `heading`   | h1-h4 with alignment                                                    |
| `paragraph` | Rich inline content (bold, italic, link fragments) with alignment       |
| `image`     | Image with src, alt, caption, sizing                                    |
| `cta`       | Call-to-action with title, description, button                          |
| `columns`   | Multi-column grid (1-4), each column is a child block                   |
| `faq`       | Accordion list of question/answer items                                 |
| `divider`   | Horizontal rule with style/color/thickness                              |
| `video`     | YouTube/Vimeo embed with controls                                       |
| `gallery`   | Grid/masonry/carousel of images                                         |
| `pricing`   | Pricing table with 1-4 plans                                            |
| `form`      | Custom form builder with text, email, textarea, select, checkbox fields |

Each block config extends `BaseBlockConfig` (paddingTop, paddingBottom, backgroundColor).

## Services

### page.service.ts (exists — extend)

Existing methods:

- `list(params)` — paginated list with search, section filter ✅
- `getById(id)` — single page with section info ✅
- `getBySlug(slug)` — root page by slug ✅
- `getBySectionAndSlug(sectionSlug, pageSlug)` — page within section ✅
- `getHome()` — home page ✅
- `create(data)` — with slug uniqueness check ✅
- `update(id, data)` — partial update with slug validation ✅
- `delete(id)` — soft delete, home page protection ✅

Need to add:

- `getWithBlocks(id)` — page + blocks tree
- `publish(id)` — set publishedAt + isPublished = true

### page-block.service.ts (new)

- `getTree(pageId)` — nested blocks ordered by sortOrder
- `create(data)` — create a block
- `update(id, data)` — update block config
- `delete(id)` — delete block (children cascade)
- `reorder(pageId, blockIds)` — batch update sortOrder

## API Routes

All under existing `{ success, data|message }` pattern.

### Existing (already implemented)

| Method | Path            | Permission      |
| ------ | --------------- | --------------- |
| GET    | /api/pages      | pages.read ✅   |
| POST   | /api/pages      | pages.create ✅ |
| GET    | /api/pages/[id] | pages.read ✅   |
| PATCH  | /api/pages/[id] | pages.update ✅ |
| DELETE | /api/pages/[id] | pages.delete ✅ |

### Need to add

| Method | Path                             | Permission   |
| ------ | -------------------------------- | ------------ |
| POST   | /api/pages/[id]/publish          | pages.update |
| GET    | /api/pages/[id]/blocks           | pages.read   |
| POST   | /api/pages/[id]/blocks           | pages.update |
| PATCH  | /api/pages/[id]/blocks/[blockId] | pages.update |
| DELETE | /api/pages/[id]/blocks/[blockId] | pages.update |
| PUT    | /api/pages/[id]/blocks/reorder   | pages.update |

Permissions `pages.*` already seeded.

## Admin UI

### Page List (`/admin/pages`) — already implemented ✅

The page list already has:

- `PageHeader` with title/description and "Create Page" button
- `DataToolbar` with `SearchInput`
- `AppTable` with columns: Title (with Home/Index badges), Slug (prefixed by section), Section name, Published badge, Actions dropdown (Preview, Edit, Delete)
- `PageFormDialog` — create/edit modal with fields: title, slug, section, content (TipTap editor), metaTitle, metaDescription, isPublished, isHome
- `ConfirmDelete` with home page protection
- Pagination

**Changes needed:**

1. Remove `content` field from `PageFormDialog` (replaced by blocks)
2. Add "Blocks" action in dropdown → navigates to `/admin/pages/[id]`
3. Add publish/unpublish quick action (or the existing isPublished toggle already covers this)

### Page Editor (`/admin/pages/[id]`) — new

Block tree view:

- Root blocks listed in order
- Drag handle for reorder
- Each block shows: icon (by type), config preview, edit/delete buttons
- "Add Block" button shows `BlockPicker` (modal with block type grid)
- Nested blocks shown indented

### Block Form (`/admin/pages/[id]/blocks/[blockId]`) — new

Dynamic form rendered from Zod schema per blockType:

- Uses React Hook Form + Zod resolver
- Fields rendered based on config shape (text inputs, toggles, color pickers, image uploaders)
- Inline text formatting (B/I/link) for paragraph blocks

## Public Rendering

### Route — new

Pages are currently rendered by the existing sections/pages system. The page builder introduces a new public route:

```
src/app/(public)/
├── layout.tsx          # Minimal layout (header/footer optional)
└── [slug]/
    └── page.tsx        # Server Component → fetches page + blocks → renders
```

Existing routes (`/:sectionSlug/:pageSlug`) remain functional for backward compatibility.

### Components

```
src/components/blocks/
├── block-renderer.tsx  # Switch by blockType
├── section-block.tsx
├── heading-block.tsx
├── paragraph-block.tsx
├── image-block.tsx
├── cta-block.tsx
├── columns-block.tsx
├── column-block.tsx
├── faq-block.tsx
├── divider-block.tsx
├── video-block.tsx
├── gallery-block.tsx
├── pricing-block.tsx
└── form-block.tsx
```

`block-renderer.tsx`:

- Accepts `PageBlock` (includes `children?: PageBlock[]`)
- Matches `blockType` → renders the appropriate block component
- Recursively renders children for `section` and `columns`

## Permission Model

Already seeded in `PERMISSION_DEFINITIONS`:

- `pages.read` — view/read pages
- `pages.create` — create pages
- `pages.update` — edit pages and blocks
- `pages.delete` — delete pages

No new permissions needed. Admin layout already guarded by `admin.access`.

## Extending Block Types

Adding a new block type takes 4 steps:

1. **Schema** — add variant to `BlockConfigSchema` discriminated union in `src/schemas/page-block.ts`
2. **Component** — create `src/components/blocks/{name}-block.tsx`
3. **Renderer** — add `case` to `block-renderer.tsx`
4. **Form** — add field mapping in `block-form.tsx`

No migration needed — `blockType` is a string, `config` is JSON.

## Implementation Plan

### Issue #1 — Database & Schema

- Create `page_blocks` table in `drizzle/schema.ts`
- Generate + run migration
- Remove `content` column from `pages` (optional, can keep for transition)
- Create Zod schemas: `PageBlockSchema`, `BlockConfigSchema` (discriminated union)
- Add `pages.publish` permission to seed (if missing)

### Issue #2 — Services & API

- `page.service.ts` — extend with publish, getBySlug with blocks
- `page-block.service.ts` — CRUD + getTree + reorder
- API routes for blocks (CRUD + reorder)
- API route for page publish
- Typed API client (`api/page-block.api.ts`)

### Issue #3 — Admin UI: Adapt Page List

- Remove `content` field from `PageFormDialog` (no longer needed — blocks replace it)
- Add "Blocks" action in table dropdown → navigates to `/admin/pages/[id]`
- Add publish/unpublish quick action in table actions

### Issue #4 — Admin UI: Block Editor

- `BlockPicker` — modal grid of available block types
- `BlockCard` — block preview in list
- Page editor page at `/admin/pages/[id]` with drag-to-reorder
- Delete confirmation for blocks

### Issue #5 — Admin UI: Block Form

- Dynamic form component per blockType
- Inline text formatting editor for paragraph blocks
- Image uploader for image/gallery blocks
- Form integrated at `/admin/pages/[id]/blocks/[blockId]`

### Issue #6 — Public Rendering

- All block render components (`src/components/blocks/*`)
- `BlockRenderer` with recursive rendering
- `(public)/[slug]/page.tsx` Server Component
- `(public)/layout.tsx`

### Issue #7 — Polish & Edge Cases

- i18n keys for block builder UI (ru + en)
- Rename page list route from `/admin/pages` to `/admin/pages/list` (optional)
- Polish and edge cases
