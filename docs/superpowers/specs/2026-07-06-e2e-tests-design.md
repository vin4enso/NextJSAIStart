# E2E Tests Design

## Issue

Closes #10 — E2E tests for all flows.

## Approach

Hybrid: Playwright fixtures for auth + lightweight helpers for reused actions.

## Structure

```
e2e/
├── fixtures.ts              # adminPage, newUserPage fixtures
├── global-setup.ts          # db:seed before all tests
├── helpers/
│   ├── seed.ts              # Database reset
│   ├── auth.ts              # login helper
│   ├── users.ts             # createUserViaApi, fillUserForm
│   └── roles.ts             # createRoleViaApi, fillRoleForm
├── smoke.spec.ts            # (existing) homepage load
├── auth.spec.ts             # (extended) register, login, validation
├── dashboard.spec.ts        # Dashboard load + welcome
├── profile.spec.ts          # Edit name, change password
├── users.spec.ts            # Users CRUD + search + sort
├── roles.spec.ts            # Roles CRUD + System role protection
├── permissions.spec.ts      # Permission list + edit description
├── navigation.spec.ts       # Sidebar, breadcrumbs
├── errors.spec.ts           # 403, 404
└── search.spec.ts           # Search/sort in tables
```

## Fixtures

- `adminPage` — pre-authenticated as system@example.com (seed admin)
- `newUserPage` — pre-authenticated as fresh user with no permissions

Storage state per fixture avoids repeated login.

## Helpers

- `seed.ts` — resets DB via `npm run db:seed`
- `auth.ts` — `login(page, email, password)`
- `users.ts` — `createUserViaApi(page, data)` (POST /api/users using fetch), `fillUserForm(page, data)`
- `roles.ts` — analogous

## Test Data Strategy

- global-setup resets DB to seed state before all tests
- Each test creates its own data via API helpers (no cross-test coupling)
- Tests rely on seed admin user for authentication only

## Test Files Detail

### auth.spec.ts (extend existing)

- Register success → redirect to dashboard
- Register with existing email → validation error
- Login with wrong password → error message
- Login with empty fields → validation
- Forgot password page accessibility

### dashboard.spec.ts

- Page loads with welcome message
- User name visible
- Stat cards visible
- Quick links visible (if admin)

### profile.spec.ts

- Edit name → saved
- Change password → success
- Wrong current password → error
- Empty fields validation

### users.spec.ts

- Table renders with columns
- Search by name/email
- Create user → appears in table
- Edit user → changes persist
- Soft delete user → removed from table
- Pagination works
- Sort by column

### roles.spec.ts

- Table renders with columns
- Create role → appears in table
- Edit role name/description
- Edit role permissions
- Delete role → removed
- System role: no delete button / disabled
- Delete role with users → prevented

### permissions.spec.ts

- List renders grouped by entity
- Edit description → saved

### navigation.spec.ts

- Sidebar links navigate correctly
- Breadcrumbs visible on admin pages
- Active link highlighted

### errors.spec.ts

- 403 page shown when accessing admin without permission
- 404 page shown for non-existent route

### search.spec.ts

- Search input filters users table
- Search input filters roles table
- Sort toggles between asc/desc
- Clear search resets results
