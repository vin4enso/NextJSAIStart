# Development Guide

## Prerequisites

- Node.js >= 20 (use nvm)
- Docker (optional, for Postgres)
- npm or pnpm

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Generate Drizzle client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Start dev server
npm run dev
```

## Environment Variables

```env
# .env.example
DATABASE_URL="data/sqlite.db"
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3000"
```

## Available Scripts

```bash
npm run dev              # Start dev server with Turbopack
npm run build            # Production build
npm run start            # Start production server
npm run lint             # ESLint check
npm run format           # Prettier format
npm run typecheck        # TypeScript check
npm run test             # Vitest (unit + integration)
npm run test:e2e         # Playwright (E2E)
npm run db:generate      # Generate Drizzle migration
npm run db:migrate       # Apply migrations
npm run db:seed          # Seed database
npm run db:studio        # Open Drizzle Studio
```

## Docker Development

```bash
# Start Postgres + Adminer
docker compose up -d

# Run migrations on Postgres (update DATABASE_URL first)
npm run db:migrate

# Adminer UI: http://localhost:8080
```

### docker-compose.yml

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: app
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app
    ports:
      - 5432:5432
    volumes:
      - pgdata:/var/lib/postgresql/data

  adminer:
    image: adminer
    ports:
      - 8080:8080

volumes:
  pgdata:
```

## Git Workflow

```bash
# Conventional commit format
git commit -m "feat: add user management"
git commit -m "fix: correct pagination offset"
git commit -m "refactor: extract shared table component"
```

Commit types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `style`, `perf`.

Husky runs lint-staged on commit — auto-formatting and linting.

## Testing

### Vitest

```bash
npm run test          # Run tests
npm run test -- --ui  # UI mode
```

Write tests alongside source files:

```
src/services/__tests__/user.service.test.ts
src/api/__tests__/user.api.test.ts
```

### Playwright

```bash
npm run test:e2e        # Run E2E tests
npm run test:e2e -- --ui  # UI mode
```

E2E tests in `e2e/`:

```
e2e/
├── auth.spec.ts
├── users.spec.ts
├── roles.spec.ts
└── permissions.spec.ts
```

## Database Migration

```bash
# 1. Edit schema in drizzle/schema.ts
# 2. Generate migration
npm run db:generate

# 3. Apply
npm run db:migrate

# 4. Re-seed if needed
npm run db:seed
```

## Adding a New Entity

See [12_ENTITY_TEMPLATE.md](./12_ENTITY_TEMPLATE.md) for the complete template.

Quick reference:

1. Add table to `drizzle/schema.ts`
2. Run `npm run db:generate && npm run db:migrate`
3. Create Zod schemas in `src/schemas/[entity].ts`
4. Create service in `src/services/[entity].service.ts`
5. Create API routes in `src/app/api/[entity]/`
6. Create API client in `src/api/[entity].api.ts`
7. Create UI components (columns, form, dialog, table)
8. Create page in `src/app/(admin)/[entity]/`
9. Add permissions to seed + migration
10. Add menu item to `src/config/menu.ts`
11. Add i18n keys
12. Write tests
