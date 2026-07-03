# Pages

## Layout Groups

### (auth) — Centered form layout, no sidebar

| Route | Component | Description |
|-------|-----------|-------------|
| /login | LoginPage | Email + password form |
| /register | RegisterPage | Name + email + password form |
| /forgot-password | ForgotPasswordPage | Email input form |
| /reset-password | ResetPasswordPage | Token + new password form |

### (app) — Full shell: sidebar + header + content

| Route | Component | Permission | Description |
|-------|-----------|------------|-------------|
| /dashboard | DashboardPage | — | Welcome page with placeholder stats |
| /profile | ProfilePage | — | Edit name, avatar, change password |

### (admin) — Same shell, guarded by `admin.access`

| Route | Component | Permission | Description |
|-------|-----------|------------|-------------|
| /admin/users | UsersPage | users.read | User table with CRUD |
| /admin/users/[id] | UserDetailPage | users.read | User detail + role assignment |
| /admin/roles | RolesPage | roles.read | Role table with CRUD |
| /admin/roles/[id] | RoleDetailPage | roles.read | Role detail + permission assignment |
| /admin/permissions | PermissionsPage | permissions.read | Permission list grouped by entity |

### Public

| Route | Component | Description |
|-------|-----------|-------------|
| /403 | ForbiddenPage | No access |
| /404 | NotFoundPage | Not found |

## Page Meta

Each page exports metadata:

```typescript
// src/app/(admin)/users/page.tsx
export const pageMeta = {
  title: 'Users',
  description: 'Manage system users',
  breadcrumbs: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Administration', href: '/admin/users' },
    { label: 'Users' },
  ],
}
```

## Dashboard Page

Placeholder page with:

- Welcome message with user name
- 3-4 stat cards (total users, total roles, etc.) — hardcoded for now
- Quick links to admin sections (if permitted)

## Profile Page

Three sections:

1. **Profile Information** — edit name, upload avatar
2. **Account** — email (read-only), member since
3. **Change Password** — current password + new password + confirm

## Users Page (admin)

Features:

- **DataToolbar**: search by name/email + "Create User" button
- **Table columns**: Name, Email, Roles, Status (Active/Inactive), Created, Actions
- **Actions dropdown**: Edit, Delete (with confirmation)
- **Create/Edit Dialog**: Modal form with name, email, password, role assignment, isActive toggle
- **Delete**: Soft delete with ConfirmDelete dialog

## Roles Page (admin)

Features:

- **Table columns**: Name, Description, Users count, Permissions count, System flag, Actions
- **Actions**: Edit, Delete (disabled for System role)
- **Create/Edit Dialog**: Name, description, permission checkboxes grouped by entity
- **Delete**: Prevented if role is `isSystem` or has assigned users

## Permissions Page (admin)

Features:

- Grouped list by entity (users, roles, permissions, profile, admin)
- Each group shows permission key + display name
- No create/delete — permissions are seeded
- Edit dialog for description only
