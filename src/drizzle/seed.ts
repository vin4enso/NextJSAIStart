import { randomUUID, scryptSync, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import {
  users,
  accounts,
  roles,
  permissions,
  rolePermissions,
  userRoles,
} from "@/drizzle/schema";

const PERMISSION_DEFINITIONS = [
  { key: "users.read", name: "View users", group: "users" },
  { key: "users.create", name: "Create users", group: "users" },
  { key: "users.update", name: "Update users", group: "users" },
  { key: "users.delete", name: "Delete users", group: "users" },
  { key: "roles.read", name: "View roles", group: "roles" },
  { key: "roles.create", name: "Create roles", group: "roles" },
  { key: "roles.update", name: "Update roles", group: "roles" },
  { key: "roles.delete", name: "Delete roles", group: "roles" },
  { key: "permissions.read", name: "View permissions", group: "permissions" },
  {
    key: "permissions.update",
    name: "Assign permissions",
    group: "permissions",
  },
  { key: "profile.update", name: "Update profile", group: "profile" },
  { key: "password.change", name: "Change password", group: "profile" },
  { key: "admin.access", name: "Access admin", group: "admin" },
] as const;

async function main() {
  console.log("Seeding database...");

  db.delete(userRoles).run();
  db.delete(rolePermissions).run();
  db.delete(permissions).run();
  db.delete(roles).run();
  db.delete(accounts).run();
  db.delete(users).run();

  const now = new Date().toISOString();

  const systemRoleId = randomUUID();
  const userRoleId = randomUUID();

  db.insert(roles)
    .values([
      {
        id: systemRoleId,
        name: "System",
        description: "System administrator role with full access",
        isSystem: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: userRoleId,
        name: "User",
        description: "Default role for authenticated users",
        isSystem: false,
        createdAt: now,
        updatedAt: now,
      },
    ])
    .run();

  console.log("Roles created: System, User");

  const permissionIds: string[] = [];

  for (const perm of PERMISSION_DEFINITIONS) {
    const id = randomUUID();
    permissionIds.push(id);

    db.insert(permissions)
      .values({
        id,
        key: perm.key,
        name: perm.name,
        group: perm.group,
        createdAt: now,
      })
      .run();
  }

  console.log(`Permissions created: ${PERMISSION_DEFINITIONS.length}`);

  for (const permissionId of permissionIds) {
    db.insert(rolePermissions)
      .values({
        roleId: systemRoleId,
        permissionId,
      })
      .run();
  }

  console.log("System role assigned all permissions");

  const passwordHash = bcrypt.hashSync("System123!", 10);

  const adminUserId = randomUUID();

  db.insert(users)
    .values({
      id: adminUserId,
      email: "system@example.com",
      passwordHash,
      name: "System Admin",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    })
    .run();

  console.log("Admin user created: system@example.com");

  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync("System123!", salt, 64, {
    N: 16384,
    r: 16,
    p: 1,
    maxmem: 128 * 16384 * 16 * 2,
  });
  const betterAuthHash = `${salt}:${hash.toString("hex")}`;

  db.insert(accounts)
    .values({
      id: randomUUID(),
      userId: adminUserId,
      accountId: adminUserId,
      providerId: "credential",
      password: betterAuthHash,
      createdAt: now,
      updatedAt: now,
    })
    .run();

  console.log("Admin user credential account created");

  db.insert(userRoles)
    .values({
      userId: adminUserId,
      roleId: systemRoleId,
    })
    .run();

  console.log("Admin user assigned System role");
  console.log("Database seeded successfully!");
}

export { main };

main();
