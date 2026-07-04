import { describe, it, expect, beforeAll } from "vitest";
import { db } from "@/lib/db";
import {
  users,
  roles,
  permissions,
  rolePermissions,
  userRoles,
} from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";

describe("seed data", () => {
  beforeAll(async () => {
    await import("@/drizzle/seed");
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

  it("creates all 13 permission keys", () => {
    const allPermissions = db.select().from(permissions).all();
    const keys = allPermissions.map((p) => p.key).sort();

    const expectedKeys = [
      "admin.access",
      "password.change",
      "permissions.read",
      "permissions.update",
      "profile.update",
      "roles.create",
      "roles.delete",
      "roles.read",
      "roles.update",
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
});
