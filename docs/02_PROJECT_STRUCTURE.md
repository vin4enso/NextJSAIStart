# Project Structure

## Directory Layout

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   ├── (app)/
│   │   ├── dashboard/
│   │   ├── profile/
│   │   └── layout.tsx
│   ├── (admin)/
│   │   ├── users/
│   │   │   └── [id]/
│   │   ├── roles/
│   │   │   └── [id]/
│   │   ├── permissions/
│   │   └── layout.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...]/
│   │   ├── users/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   ├── roles/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   └── permissions/
│   │       ├── route.ts
│   │       └── [id]/
│   ├── favicon.ico
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/            (shadcn components)
│   ├── app-table.tsx
│   ├── page-header.tsx
│   ├── confirm-delete.tsx
│   ├── avatar-upload.tsx
│   ├── search-input.tsx
│   ├── pagination.tsx
│   ├── data-toolbar.tsx
│   └── sidebar.tsx
├── config/
│   └── menu.ts
├── hooks/
├── i18n/
│   ├── ru.json
│   └── en.json
├── lib/
│   ├── auth.ts       (Better Auth config)
│   ├── db.ts         (Drizzle client)
│   ├── api-response.ts
│   └── utils.ts
├── schemas/
│   ├── user.ts
│   ├── role.ts
│   └── permission.ts
├── services/
│   ├── user.service.ts
│   ├── role.service.ts
│   └── permission.service.ts
├── api/
│   ├── user.api.ts
│   ├── role.api.ts
│   └── permission.api.ts
├── types/
│   └── index.ts
├── middleware.ts
└── drizzle/
    ├── migrations/
    ├── schema.ts
    └── seed.ts
```

## Entity File Template

Each business entity follows a strict file pattern:

```
entities/[entity]/
├── schema.ts       (Zod schemas + DTO types)
├── service.ts      (Business logic + DB queries)
├── api.ts          (Typed fetch client)
├── columns.tsx     (TanStack column definitions)
├── form.tsx        (React Hook Form + Zod resolver)
├── dialog.tsx      (Create/Edit modal)
├── table.tsx       (DataTable wrapper)
└── page.tsx        (Server component page)
```

## Naming Conventions

| Rule | Example |
|------|---------|
| Entity name singular | `user`, `role`, `permission` |
| Directories lowercase | `users/[id]` |
| Files kebab-case | `user.service.ts`, `api-response.ts` |
| Components PascalCase | `PageHeader`, `AppTable` |
| Functions camelCase | `getUsers`, `createUser` |
| Types PascalCase | `User`, `CreateUserDTO` |
| Constants UPPER_SNAKE | `DEFAULT_PAGE_SIZE` |
| Zod schemas PascalCase | `UserSchema`, `CreateUserSchema` |

## Menu Configuration

```typescript
// src/config/menu.ts
export interface MenuItem {
  title: string
  href: string
  icon: string
  permission?: string
  children?: MenuItem[]
}

export const menu: MenuItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { title: 'Profile', href: '/profile', icon: 'User' },
  {
    title: 'Administration',
    icon: 'Shield',
    permission: 'admin.access',
    children: [
      { title: 'Users', href: '/admin/users', icon: 'Users' },
      { title: 'Roles', href: '/admin/roles', icon: 'Shield' },
      { title: 'Permissions', href: '/admin/permissions', icon: 'Key' },
    ],
  },
]
```

## Page Meta Export

Each page exports metadata for breadcrumb generation:

```typescript
export const pageMeta = {
  title: 'Users',
  breadcrumbs: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Administration', href: '/admin/users' },
    { label: 'Users' },
  ],
}
```

## Import Order

1. React / Next.js
2. Third-party libraries
3. Internal lib / config / types
4. Services
5. Components
6. i18n
7. Styles
