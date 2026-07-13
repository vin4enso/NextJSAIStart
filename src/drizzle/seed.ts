import { randomUUID, scryptSync, randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import {
  users,
  accounts,
  sessions,
  roles,
  permissions,
  rolePermissions,
  userRoles,
  pages,
  sections,
} from "@/drizzle/schema";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

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
  { key: "pages.read", name: "View pages", group: "pages" },
  { key: "pages.create", name: "Create pages", group: "pages" },
  { key: "pages.update", name: "Update pages", group: "pages" },
  { key: "pages.delete", name: "Delete pages", group: "pages" },
  { key: "sections.read", name: "View sections", group: "sections" },
  { key: "sections.create", name: "Create sections", group: "sections" },
  { key: "sections.update", name: "Update sections", group: "sections" },
  { key: "sections.delete", name: "Delete sections", group: "sections" },
] as const;

async function main() {
  console.log("Seeding database...");

  const migrationsFolder = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "migrations",
  );
  migrate(db, { migrationsFolder });

  db.delete(sessions).run();
  db.delete(userRoles).run();
  db.delete(rolePermissions).run();
  db.delete(permissions).run();
  db.delete(roles).run();
  db.delete(accounts).run();
  db.delete(users).run();
  db.delete(pages).run();
  db.delete(sections).run();

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

  const homePageId = randomUUID();
  db.insert(pages)
    .values({
      id: homePageId,
      sectionId: null,
      title: "Home",
      slug: "home",
      content:
        "<h2>Welcome!</h2><p>This is your home page. Edit it in the admin panel.</p>",
      isPublished: true,
      isHome: true,
      publishedAt: now,
      createdAt: now,
      updatedAt: now,
    })
    .run();

  console.log("Home page created");

  const sampleSectionId = randomUUID();
  db.insert(sections)
    .values({
      id: sampleSectionId,
      name: "About",
      slug: "about",
      description: "About us",
      content: "<h2>About Us</h2><p>Sample about page content.</p>",
      isPublished: true,
      sortOrder: 0,
      createdAt: now,
      updatedAt: now,
    })
    .run();

  console.log("Sample section created");

  const samplePageId = randomUUID();
  db.insert(pages)
    .values({
      id: samplePageId,
      sectionId: sampleSectionId,
      title: "Team",
      slug: "team",
      content: "<h3>Our Team</h3><p>Meet the team page content.</p>",
      isPublished: true,
      isHome: false,
      publishedAt: now,
      createdAt: now,
      updatedAt: now,
    })
    .run();

  console.log("Sample page created");

  console.log("Database seeded successfully!");
  console.log("Existing sessions cleared. Please re-login.");
}

const isMainModule = process.argv[1]?.includes("seed");
if (isMainModule) {
  main();
}

export { main };
