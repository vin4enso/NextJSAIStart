# RBAC (Role-Based Access Control)

## Model

Permission-based RBAC with many-to-many user-role assignment.

```
User ──< UserRole >── Role ──< RolePermission >── Permission
```

- A **User** has multiple **Roles**
- A **Role** has multiple **Permissions**
- A **User** has all permissions from all assigned roles
- The **System** role has implicit access to everything (checked in code, not via DB)

## Permission Keys

String-based keys following `{entity}.{action}` convention:

| Key                  | Description                               |
| -------------------- | ----------------------------------------- |
| `users.read`         | View user list and details                |
| `users.create`       | Create new users                          |
| `users.update`       | Edit users                                |
| `users.delete`       | Soft-delete users                         |
| `roles.read`         | View role list and details                |
| `roles.create`       | Create new roles                          |
| `roles.update`       | Edit roles                                |
| `roles.delete`       | Delete roles                              |
| `permissions.read`   | View permission list                      |
| `permissions.update` | Assign permissions to roles               |
| `profile.update`     | Edit own profile                          |
| `password.change`    | Change own password                       |
| `admin.access`       | Access admin section (sidebar visibility) |

## System Role

- `isSystem = true` in the database
- Cannot be deleted or renamed via UI
- Full access to everything — permission checks skip for users with this role
- At least one user must always have the System role

## Access Check Hierarchy

```
1. Proxy (route guard)
   └─ Redirects unauthenticated users to /login

2. Layout
   └─ (admin) layout checks admin.access permission

3. API Route
   └─ Each handler checks required permission

4. UI Component
   └─ Buttons/links hidden if user lacks permission
```

## Helper Functions

```typescript
// Check if user has a specific permission
function hasPermission(user: User, permissionKey: string): boolean;

// Check if user has System role
function isSystemUser(user: User): boolean;

// Require permission (throws if missing)
function requirePermission(user: User, permissionKey: string): void;

// Get all permissions for a user (union of all role permissions)
function getUserPermissions(user: User): string[];
```

## Admin Pages

| Page                         | Required Permission |
| ---------------------------- | ------------------- |
| /admin/users                 | users.read          |
| /admin/users/create          | users.create        |
| /admin/users/[id]/edit       | users.update        |
| /admin/users/[id]/delete     | users.delete        |
| /admin/roles                 | roles.read          |
| /admin/roles/create          | roles.create        |
| /admin/roles/[id]/edit       | roles.update        |
| /admin/roles/[id]/delete     | roles.delete        |
| /admin/permissions           | permissions.read    |
| /admin/permissions/[id]/edit | permissions.update  |

## Permission Assignment

- Permissions are assigned to roles (not directly to users)
- The **Permissions** admin page allows editing which permissions a role has
- The **Users** admin page allows assigning/removing roles to/from users
