# Architecture

## Tech Stack

| Layer | Technology | Version / Notes |
|-------|-----------|-----------------|
| Framework | Next.js | Latest (App Router only) |
| Language | TypeScript | Strict mode |
| UI Library | shadcn/ui | Custom components, no Radix UI |
| Styling | Tailwind CSS | v4 |
| Icons | lucide-react | — |
| Build Tool | Turbopack | Next.js default |
| Database | SQLite | better-sqlite3 |
| ORM | Drizzle | — |
| Auth | Better Auth | With Drizzle adapter |
| Forms | React Hook Form | — |
| Validation | Zod | — |
| i18n | next-intl | — |
| Tables | TanStack Table | For data grids |
| HTTP Client | fetch / ky | Typed service wrappers |
| Testing | Vitest | Unit + integration |
| E2E | Playwright | — |
| Linting | ESLint | — |
| Formatting | Prettier | — |
| Git Hooks | Husky + lint-staged | — |
| Commit Convention | Commitlint | Conventional commits |

## Architecture Principles

1. **Server Components first** — client components only when interactivity is required (forms, dialogs, tables).
2. **Minimize `"use client"`** — push interactivity to leaf components.
3. **No direct `fetch()` in components** — use typed API services.
4. **No raw SQL in components** — all queries in services.
5. **No `useEffect` for data fetching** — use Server Components or RSC patterns.
6. **Single source of truth for types** — all DTOs derived from Zod schemas.
7. **Unified API response format** — every endpoint returns `{ success, data }` or `{ success, message, errors }`.
8. **Config-driven UI** — sidebar menu, breadcrumbs, and permissions are data-driven, not hardcoded.

## Application Shell

Three layout groups:

```
(auth)      — login, register, forgot-password, reset-password
              No sidebar, centered forms.

(app)       — dashboard, profile
              Full shell: sidebar + header + content area.

(admin)     — users, roles, permissions
              Same shell as (app), guarded by admin-access permission.
```

## Sidebar Structure

```
Logo / Brand
─────────────────────
Dashboard
─────────────────────
Profile
─────────────────────
Administration        (visible only with admin.access)
  Users
  Roles
  Permissions
─────────────────────
User avatar ▲         (dropdown: Profile, Admin, Sign Out)
```

Defined as a typed array in `config/menu.ts`.

## Multi-Layer Access Control

```
Middleware        → Route protection (auth check)
Layout            → Permission guard
Server Action     → Business logic guard
API Route         → API-level guard
UI Component      → Conditional rendering (hidden buttons)
```

## Unified API Response

```typescript
// Success
{
  success: true,
  data: T
}

// Error
{
  success: false,
  message: string,
  errors?: Record<string, string[]>
}
```
