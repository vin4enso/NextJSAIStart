import { describe, it, expect, beforeAll } from "vitest";
import { db } from "@/lib/db";
import {
  users,
  accounts,
  roles,
  permissions,
  rolePermissions,
  userRoles,
  pages,
  sections,
} from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";

describe("seed data", () => {
  beforeAll(async () => {
    const { main } = await import("@/drizzle/seed");
    await main();
  });

  it("creates System role with isSystem = true", () => {
    const systemRole = db
      .select()
      .from(roles)
      .where(eq(roles.name, "System"))
      .get();
    expect(systemRole).toBeDefined();
    expect(systemRole!.isSystem).toBe(true);
  });

  it("creates User role with isSystem = false", () => {
    const userRole = db
      .select()
      .from(roles)
      .where(eq(roles.name, "User"))
      .get();
    expect(userRole).toBeDefined();
    expect(userRole!.isSystem).toBe(false);
  });

  it("creates admin user with correct email and active status", () => {
    const admin = db
      .select()
      .from(users)
      .where(eq(users.email, "system@example.com"))
      .get();
    expect(admin).toBeDefined();
    expect(admin!.name).toBe("System Admin");
    expect(admin!.isActive).toBe(true);
    expect(admin!.deletedAt).toBeNull();
  });

  it("creates all 17 permission keys", () => {
    const allPermissions = db.select().from(permissions).all();
    const keys = allPermissions.map((p) => p.key).sort();

    const expectedKeys = [
      "admin.access",
      "pages.create",
      "pages.delete",
      "pages.read",
      "pages.update",
      "password.change",
      "permissions.read",
      "permissions.update",
      "profile.update",
      "roles.create",
      "roles.delete",
      "roles.read",
      "roles.update",
      "sections.create",
      "sections.delete",
      "sections.read",
      "sections.update",
      "users.create",
      "users.delete",
      "users.read",
      "users.update",
    ].sort();

    expect(keys).toEqual(expectedKeys);
  });

  it("assigns all permissions to System role", () => {
    const systemRole = db
      .select()
      .from(roles)
      .where(eq(roles.name, "System"))
      .get()!;
    const allPermissions = db.select().from(permissions).all();
    const assigned = db
      .select()
      .from(rolePermissions)
      .where(eq(rolePermissions.roleId, systemRole.id))
      .all();

    expect(assigned.length).toBe(allPermissions.length);
  });

  it("creates credential account for admin user", () => {
    const admin = db
      .select()
      .from(users)
      .where(eq(users.email, "system@example.com"))
      .get()!;
    const credentialAccount = db
      .select()
      .from(accounts)
      .where(
        and(
          eq(accounts.userId, admin.id),
          eq(accounts.providerId, "credential"),
        ),
      )
      .get();
    expect(credentialAccount).toBeDefined();
    expect(credentialAccount!.password).toBeTruthy();
  });

  it("assigns System role to admin user", () => {
    const admin = db
      .select()
      .from(users)
      .where(eq(users.email, "system@example.com"))
      .get()!;
    const systemRole = db
      .select()
      .from(roles)
      .where(eq(roles.name, "System"))
      .get()!;
    const assignment = db
      .select()
      .from(userRoles)
      .where(
        and(
          eq(userRoles.userId, admin.id),
          eq(userRoles.roleId, systemRole.id),
        ),
      )
      .get();

    expect(assignment).toBeDefined();
  });

  it("creates a home page with slug 'home'", () => {
    const homePage = db
      .select()
      .from(pages)
      .where(eq(pages.slug, "home"))
      .get();
    expect(homePage).toBeDefined();
    expect(homePage!.title).toBe("Home");
    expect(homePage!.isHome).toBe(true);
    expect(homePage!.isPublished).toBe(true);
    expect(homePage!.sectionId).toBeNull();
    expect(homePage!.deletedAt).toBeNull();
  });

  it("creates a sample section", () => {
    const section = db
      .select()
      .from(sections)
      .where(eq(sections.slug, "about"))
      .get();
    expect(section).toBeDefined();
    expect(section!.name).toBe("About");
    expect(section!.isPublished).toBe(true);
    expect(section!.sortOrder).toBe(0);
  });

  it("creates a sample page within the About section", () => {
    const section = db
      .select()
      .from(sections)
      .where(eq(sections.slug, "about"))
      .get()!;
    const samplePage = db
      .select()
      .from(pages)
      .where(and(eq(pages.sectionId, section.id), eq(pages.slug, "team")))
      .get();
    expect(samplePage).toBeDefined();
    expect(samplePage!.title).toBe("Team");
    expect(samplePage!.isPublished).toBe(true);
    expect(samplePage!.isHome).toBe(false);
  });
});
