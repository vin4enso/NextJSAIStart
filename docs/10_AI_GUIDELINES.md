# AI Guidelines

## Code Generation Rules

These rules MUST be followed by any AI generating code for this project.

### TypeScript & Types

- NEVER use `any`. Use `unknown` if type is not known.
- ALL DTOs and API responses MUST be derived from Zod schemas.
- NEVER use type assertions (`as Type`) — use Zod parsing instead.
- ALL function parameters and return types MUST be explicitly typed.
- Prefer `interface` for objects, `type` for unions and intersections.

### Validation

- ALL forms MUST use React Hook Form with Zod resolver.
- ALL API inputs MUST be validated with Zod before processing.
- NEVER trust client data — always validate on the server.

### Data Fetching

- NEVER call `fetch()` directly in components.
- ALWAYS use typed API services from `src/api/*.api.ts`.
- NEVER use `useEffect` for data loading.
- Use Server Components for initial data fetching.
- Use TanStack Query (if added) or Server Actions for mutations.

### Components

- Prefer Server Components. Add `'use client'` ONLY if needed.
- Keep components under 200 lines.
- Keep functions under 50 lines.
- Keep files under 300 lines.
- At most ONE `export default` per file.
- ALWAYS handle loading, empty, error, and success states.

### Architecture

- NEVER write SQL in components — use services (`src/services/*.service.ts`).
- NEVER bypass the service layer — route handlers delegate to services.
- ALWAYS check permissions in API routes, layouts, and UI.
- ALWAYS use the unified API response format (`{ success, data }`).
- ALWAYS use soft delete (`deletedAt` field).

### Naming

| Pattern | Example |
|---------|---------|
| Entities singular | `user`, `role`, `company` |
| Directories lowercase | `users/[id]` |
| Files kebab-case | `user.service.ts` |
| Components PascalCase | `PageHeader` |
| Functions camelCase | `getUsers` |
| Zod schemas PascalCase | `UserSchema` |
| CSS classes kebab-case | `user-card` |

### i18n

- ALL user-facing strings MUST use `useTranslations()` — no hardcoded text.
- NEVER use `useTranslations` without a namespace.
- ALL new features MUST add their i18n keys to both `ru.json` and `en.json`.

### New Entity Checklist

When adding a new entity (e.g. "Company"), the AI MUST create:

1. Drizzle schema table definition
2. Zod schemas (entity + create + update DTOs)
3. Service with CRUD methods
4. REST API routes (list + get + create + update + delete)
5. TanStack Table column definitions
6. React Hook Form component
7. Create/Edit dialog component
8. AppTable page component
9. Permission keys (entity.read/create/update/delete)
10. Menu item (if needed)
11. i18n keys (ru + en)
12. Tests (Vitest + Playwright)

### Prohibited Patterns

- ❌ `any`
- ❌ `fetch()` in components
- ❌ `useEffect` for data fetching
- ❌ Inline styles
- ❌ Magic numbers/strings
- ❌ Duplicate API calls
- ❌ Direct DB access from components
- ❌ `as Type` assertions
- ❌ `// @ts-ignore` or `// @ts-expect-error`
