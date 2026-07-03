# Entity Template

This document defines the exact structure for adding any new business entity to the project. Following this template guarantees consistency, type safety, and automatic integration with the existing RBAC, menu, and i18n systems.

## Overview

Each entity consists of these files:

```
src/
├── drizzle/schema.ts              # Table definition (append to file)
├── schemas/[entity].ts            # Zod schemas + DTO types
├── services/[entity].service.ts   # Business logic + DB queries
├── app/api/[entity]/route.ts      # REST API (list + create)
├── app/api/[entity]/[id]/route.ts # REST API (get + update + delete)
├── api/[entity].api.ts            # Typed fetch client
├── components/[entity]/
│   ├── columns.tsx                # TanStack column definitions
│   ├── form.tsx                   # React Hook Form
│   ├── dialog.tsx                 # Create/Edit modal
│   └── table.tsx                  # DataTable page component
├── app/(admin)/[entity]/page.tsx  # List page
├── config/menu.ts                 # Menu registration (append)
├── messages/ru.json               # Russian i18n keys (append)
└── messages/en.json               # English i18n keys (append)
```

## Step-by-Step Template

### 1. Drizzle Schema (`drizzle/schema.ts`)

```typescript
export const [entity] = sqliteTable('[entity]', {
  id: text('id').primaryKey().$defaultFn(uuid),
  name: text('name').notNull(),
  description: text('description'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
  deletedAt: text('deleted_at'),
})
```

### 2. Zod Schemas (`src/schemas/[entity].ts`)

```typescript
import { z } from 'zod'

export const [Entity]Schema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Required'),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const Create[Entity]Schema = [Entity]Schema.omit({
  id: true, createdAt: true, updatedAt: true,
})

export const Update[Entity]Schema = Create[Entity]Schema.partial()

export type [Entity] = z.infer<typeof [Entity]Schema>
export type Create[Entity]DTO = z.infer<typeof Create[Entity]Schema>
export type Update[Entity]DTO = z.infer<typeof Update[Entity]Schema>
```

### 3. Service (`src/services/[entity].service.ts`)

```typescript
import { db } from '@/lib/db'
import { [entity] } from '@/drizzle/schema'
import { eq, like, and, isNull, count } from 'drizzle-orm'
import type { Create[Entity]DTO, Update[Entity]DTO, [Entity] } from '@/schemas/[entity]'

export const [entity]Service = {
  async list(params: { page?: number; pageSize?: number; search?: string }) {
    const { page = 1, pageSize = 20, search } = params
    const conditions = [isNull([entity].deletedAt)]

    if (search) {
      conditions.push(like([entity].name, `%${search}%`))
    }

    const total = await db.select({ count: count() }).from([entity]).where(and(...conditions))
    const items = await db
      .select()
      .from([entity])
      .where(and(...conditions))
      .limit(pageSize)
      .offset((page - 1) * pageSize)

    return {
      data: items,
      pagination: {
        page,
        pageSize,
        total: total[0].count,
        totalPages: Math.ceil(total[0].count / pageSize),
      },
    }
  },

  async getById(id: string) {
    const result = await db
      .select()
      .from([entity])
      .where(and(eq([entity].id, id), isNull([entity].deletedAt)))
      .limit(1)
    return result[0] || null
  },

  async create(data: Create[Entity]DTO) {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    await db.insert([entity]).values({ ...data, id, createdAt: now, updatedAt: now })
    return this.getById(id)
  },

  async update(id: string, data: Update[Entity]DTO) {
    await db
      .update([entity])
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq([entity].id, id))
    return this.getById(id)
  },

  async delete(id: string) {
    await db
      .update([entity])
      .set({ deletedAt: new Date().toISOString() })
      .where(eq([entity].id, id))
  },
}
```

### 4. API Routes

**`src/app/api/[entity]/route.ts`** — list + create:

```typescript
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { [entity]Service } from '@/services/[entity].service'
import { requirePermission, success, error } from '@/lib/api-utils'
import { Create[Entity]Schema } from '@/schemas/[entity]'

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession(request)
  if (!session) return error('Unauthorized', 401)
  requirePermission(session.user, '[entity].read')

  const params = Object.fromEntries(request.nextUrl.searchParams)
  const result = await [entity]Service.list(params)
  return success(result)
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession(request)
  if (!session) return error('Unauthorized', 401)
  requirePermission(session.user, '[entity].create')

  const body = await request.json()
  const parsed = Create[Entity]Schema.safeParse(body)
  if (!parsed.success) return error('Validation error', 400, parsed.error.flatten().fieldErrors)

  const result = await [entity]Service.create(parsed.data)
  return success(result, 201)
}
```

**`src/app/api/[entity]/[id]/route.ts`** — get + update + delete:

```typescript
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { [entity]Service } from '@/services/[entity].service'
import { requirePermission, success, error } from '@/lib/api-utils'
import { Update[Entity]Schema } from '@/schemas/[entity]'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth.api.getSession(request)
  if (!session) return error('Unauthorized', 401)
  requirePermission(session.user, '[entity].read')

  const result = await [entity]Service.getById(params.id)
  if (!result) return error('Not found', 404)
  return success(result)
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth.api.getSession(request)
  if (!session) return error('Unauthorized', 401)
  requirePermission(session.user, '[entity].update')

  const body = await request.json()
  const parsed = Update[Entity]Schema.safeParse(body)
  if (!parsed.success) return error('Validation error', 400, parsed.error.flatten().fieldErrors)

  const result = await [entity]Service.update(params.id, parsed.data)
  return success(result)
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth.api.getSession(request)
  if (!session) return error('Unauthorized', 401)
  requirePermission(session.user, '[entity].delete')

  await [entity]Service.delete(params.id)
  return success(null)
}
```

### 5. API Client (`src/api/[entity].api.ts`)

```typescript
import { apiClient } from '@/lib/api-client'
import type { [Entity], Create[Entity]DTO, Update[Entity]DTO } from '@/schemas/[entity]'

export const [entity]Api = {
  list: (params?: Record<string, string | number>) =>
    apiClient.get<{ data: [Entity][]; pagination: Pagination }>('/api/[entity]', { params }),

  getById: (id: string) =>
    apiClient.get<{ data: [Entity] }>(`/api/[entity]/${id}`),

  create: (data: Create[Entity]DTO) =>
    apiClient.post<{ data: [Entity] }>('/api/[entity]', data),

  update: (id: string, data: Update[Entity]DTO) =>
    apiClient.patch<{ data: [Entity] }>(`/api/[entity]/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<void>(`/api/[entity]/${id}`),
}
```

### 6. Columns (`src/components/[entity]/columns.tsx`)

```typescript
import { ColumnDef } from '@tanstack/react-table'
import type { [Entity] } from '@/schemas/[entity]'

export const columns: ColumnDef<[Entity]>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'description',
    header: 'Description',
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) => row.original.isActive ? 'Active' : 'Inactive',
  },
  {
    id: 'actions',
    cell: ({ row }) => <ActionCell entity={row.original} />,
  },
]
```

### 7. Form (`src/components/[entity]/form.tsx`)

```typescript
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Create[Entity]Schema, type Create[Entity]DTO } from '@/schemas/[entity]'

interface [Entity]FormProps {
  defaultValues?: Create[Entity]DTO
  onSubmit: (data: Create[Entity]DTO) => Promise<void>
}

export function [Entity]Form({ defaultValues, onSubmit }: [Entity]FormProps) {
  const form = useForm<Create[Entity]DTO>({
    resolver: zodResolver(Create[Entity]Schema),
    defaultValues: defaultValues ?? { name: '', description: '', isActive: true },
  })

  // ... render form fields
}
```

### 8. Dialog (`src/components/[entity]/dialog.tsx`)

```typescript
'use client'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { [Entity]Form } from './form'
import type { Create[Entity]DTO, Update[Entity]DTO, [Entity] } from '@/schemas/[entity]'

interface [Entity]DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entity?: [Entity]
  onSubmit: (data: Create[Entity]DTO | Update[Entity]DTO) => Promise<void>
}

export function [Entity]Dialog({ open, onOpenChange, entity, onSubmit }: [Entity]DialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{entity ? 'Edit' : 'Create'} [Entity]</DialogTitle>
        </DialogHeader>
        <[Entity]Form
          defaultValues={entity}
          onSubmit={async (data) => { await onSubmit(data); onOpenChange(false) }}
        />
      </DialogContent>
    </Dialog>
  )
}
```

### 9. Page (`src/app/(admin)/[entity]/page.tsx`)

```typescript
import { auth } from '@/lib/auth'
import { [entity]Service } from '@/services/[entity].service'
import { [Entity]Table } from '@/components/[entity]/table'
import { requirePermission } from '@/lib/api-utils'

export const pageMeta = {
  title: '[Entity]s',
  breadcrumbs: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Administration', href: `/admin/[entity]` },
    { label: '[Entity]s' },
  ],
}

export default async function [Entity]Page() {
  const session = await auth.api.getSession()
  requirePermission(session?.user, '[entity].read')

  const result = await [entity]Service.list({ page: 1, pageSize: 20 })

  return (
    <>
      <PageHeader title="[Entity]s" description="Manage [entity]s" actions={...} />
      <[Entity]Table data={result.data} pagination={result.pagination} />
    </>
  )
}
```

### 10. Permissions

Add these permission keys to the seed script and DB:

```
[entity].read
[entity].create
[entity].update
[entity].delete
```

### 11. Menu (`src/config/menu.ts`)

```typescript
{
  title: '[Entity]s',
  href: '/admin/[entity]',
  icon: 'IconName',
  permission: '[entity].read',
}
```

### 12. i18n Keys

```json
// messages/ru.json
"[entity]": {
  "title": "[Entity]ы",
  "name": "Название",
  "description": "Описание",
  "status": "Статус",
  "active": "Активен",
  "inactive": "Неактивен"
}

// messages/en.json
"[entity]": {
  "title": "[Entity]s",
  "name": "Name",
  "description": "Description",
  "status": "Status",
  "active": "Active",
  "inactive": "Inactive"
}
```

## Checklist

- [ ] Drizzle table in `schema.ts`
- [ ] `drizzle generate` + `drizzle migrate`
- [ ] Zod schemas in `schemas/[entity].ts`
- [ ] Service in `services/[entity].service.ts`
- [ ] API routes (list + get + create + update + delete)
- [ ] Typed API client in `api/[entity].api.ts`
- [ ] Columns definition
- [ ] Form component
- [ ] Dialog component
- [ ] Table / page component
- [ ] Permission keys seeded
- [ ] Menu item registered
- [ ] i18n keys (ru + en)
- [ ] Tests (Vitest for service + Playwright for UI)
