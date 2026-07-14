# Database

## Engine

- **SQLite** via `better-sqlite3` (development)
- Migration path to **PostgreSQL** supported by Drizzle — no application code changes required

## Drizzle Configuration

```typescript
// src/lib/db.ts
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "@/drizzle/schema";

const sqlite = new Database("data/sqlite.db");
export const db = drizzle(sqlite, { schema });
```

## Table Definitions

### users

| Column        | Type              | Constraints             | Notes                    |
| ------------- | ----------------- | ----------------------- | ------------------------ |
| id            | text              | PK, default uuid        | —                        |
| email         | text              | unique, not null        | —                        |
| passwordHash  | text              | nullable                | Nullable for OAuth users |
| name          | text              | not null                | —                        |
| avatar        | text              | nullable                | File path                |
| emailVerified | integer (boolean) | default false, not null | —                        |
| isActive      | integer (boolean) | default true, not null  | —                        |
| createdAt     | text (ISO)        | not null                | —                        |
| updatedAt     | text (ISO)        | not null                | —                        |
| deletedAt     | text (ISO)        | nullable                | Soft delete              |

### roles

| Column      | Type              | Constraints      | Notes                 |
| ----------- | ----------------- | ---------------- | --------------------- |
| id          | text              | PK, default uuid | —                     |
| name        | text              | unique, not null | e.g. "System", "User" |
| description | text              | nullable         | —                     |
| isSystem    | integer (boolean) | default false    | Protected role flag   |
| createdAt   | text (ISO)        | not null         | —                     |
| updatedAt   | text (ISO)        | not null         | —                     |

### permissions

| Column    | Type       | Constraints      | Notes                         |
| --------- | ---------- | ---------------- | ----------------------------- |
| id        | text       | PK, default uuid | —                             |
| key       | text       | unique, not null | e.g. "users.read"             |
| name      | text       | not null         | Human-readable                |
| group     | text       | not null         | For UI grouping, e.g. "users" |
| createdAt | text (ISO) | not null         | —                             |

### role_permissions

| Column       | Type | Constraints                   |
| ------------ | ---- | ----------------------------- |
| roleId       | text | FK → roles.id, not null       |
| permissionId | text | FK → permissions.id, not null |

Composite PK: (roleId, permissionId)

### user_roles

| Column | Type | Constraints             |
| ------ | ---- | ----------------------- |
| userId | text | FK → users.id, not null |
| roleId | text | FK → roles.id, not null |

Composite PK: (userId, roleId)

### sections

| Column          | Type              | Constraints            | Notes                                                        |
| --------------- | ----------------- | ---------------------- | ------------------------------------------------------------ |
| id              | text              | PK, default uuid       | —                                                            |
| name            | text              | not null               | —                                                            |
| slug            | text              | unique, not null       | URL-friendly identifier                                      |
| description     | text              | nullable               | —                                                            |
| content         | text              | nullable               | HTML content (deprecated — migration to page_blocks ongoing) |
| metaTitle       | text              | nullable               | —                                                            |
| metaDescription | text              | nullable               | —                                                            |
| sortOrder       | integer           | default 0, not null    | Display order                                                |
| isPublished     | integer (boolean) | default true, not null | —                                                            |
| createdAt       | text (ISO)        | not null               | —                                                            |
| updatedAt       | text (ISO)        | not null               | —                                                            |

### pages

| Column          | Type              | Constraints                | Notes                                               |
| --------------- | ----------------- | -------------------------- | --------------------------------------------------- |
| id              | text              | PK, default uuid           | —                                                   |
| sectionId       | text              | FK → sections.id, nullable | —                                                   |
| title           | text              | not null                   | —                                                   |
| slug            | text              | not null                   | URL-friendly identifier                             |
| content         | text              | nullable                   | HTML content (deprecated — replaced by page_blocks) |
| metaTitle       | text              | nullable                   | —                                                   |
| metaDescription | text              | nullable                   | —                                                   |
| isPublished     | integer (boolean) | default false, not null    | —                                                   |
| isHome          | integer (boolean) | default false, not null    | Marks the home page                                 |
| publishedAt     | text (ISO)        | nullable                   | —                                                   |
| createdAt       | text (ISO)        | not null                   | —                                                   |
| updatedAt       | text (ISO)        | not null                   | —                                                   |
| deletedAt       | text (ISO)        | nullable                   | Soft delete                                         |

### page_blocks

| Column    | Type        | Constraints                                       | Notes                                |
| --------- | ----------- | ------------------------------------------------- | ------------------------------------ |
| id        | text        | PK, default uuid                                  | —                                    |
| pageId    | text        | FK → pages.id, not null, ON DELETE CASCADE        | Parent page                          |
| parentId  | text        | FK → page_blocks.id, nullable, ON DELETE SET NULL | Self-reference for nesting           |
| blockType | text        | not null                                          | e.g. "heading", "paragraph", "image" |
| sortOrder | integer     | default 0, not null                               | Sort order within parent             |
| config    | text (JSON) | not null                                          | Block configuration as JSON object   |
| createdAt | text (ISO)  | not null                                          | —                                    |
| updatedAt | text (ISO)  | not null                                          | —                                    |

## Permission Key Convention

Format: `{entity}.{action}`

```
users.read
users.create
users.update
users.delete
roles.read
roles.create
roles.update
roles.delete
permissions.read
permissions.create
permissions.update
permissions.delete
profile.update
password.change
admin.access
pages.read
pages.create
pages.update
pages.delete
sections.read
sections.create
sections.update
sections.delete
```

## Soft Delete

- All deletable entities use `deletedAt` (nullable ISO string).
- Queries MUST filter `WHERE deletedAt IS NULL` by default.
- Admin UI provides no "restore" — deleted items are permanently gone from the UI.

## Seed Data

Created by `src/drizzle/seed.ts`, run via `npm run db:seed`.

### System Role

A role named "System" with `isSystem = true`. This role:

- Cannot be deleted
- Cannot be renamed
- Automatically has every permission in the system
- Assigned to the initial admin user

### Default User Role

A role named "User" with no permissions by default.

### Default Admin User

| Field    | Value              |
| -------- | ------------------ |
| email    | system@example.com |
| password | System123!         |
| name     | System Admin       |
| isActive | true               |

### Default Permissions

All permissions from the permission key convention table above are seeded automatically.

## Migrations

```bash
npm run db:generate   # Generate migration
npm run db:migrate    # Apply migration
npm run db:seed       # Seed database
```
