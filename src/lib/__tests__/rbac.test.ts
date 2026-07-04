import { describe, it, expect, beforeAll } from "vitest";
import { db } from "@/lib/db";
import { users, permissions } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { isSystemUser, hasPermission, getUserPermissionKeys } from "@/lib/rbac";

describe("rbac", () => {
  let adminUserId: string;

  beforeAll(async () => {
    await import("@/drizzle/seed");

    const admin = db
      .select()
      .from(users)
      .where(eq(users.email, "system@example.com"))
      .get()!;
    adminUserId = admin.id;
  });

  describe("isSystemUser", () => {
    it("returns true for admin user with System role", async () => {
      const result = await isSystemUser(adminUserId);
      expect(result).toBe(true);
    });

    it("returns false for a non-existent user", async () => {
      const result = await isSystemUser("non-existent-id");
      expect(result).toBe(false);
    });
  });

  describe("hasPermission", () => {
    it("returns true for system user (implicit access)", async () => {
      const result = await hasPermission(adminUserId, "users.read");
      expect(result).toBe(true);
    });

    it("returns false for non-existent user", async () => {
      const result = await hasPermission("non-existent-id", "users.read");
      expect(result).toBe(false);
    });
  });

  describe("getUserPermissionKeys", () => {
    it("returns all permissions for system user", async () => {
      const allPermissions = db.select().from(permissions).all();
      const expectedKeys = allPermissions.map((p) => p.key).sort();

      const result = await getUserPermissionKeys(adminUserId);
      expect(result.sort()).toEqual(expectedKeys);
    });

    it("returns empty array for non-existent user", async () => {
      const result = await getUserPermissionKeys("non-existent-id");
      expect(result).toEqual([]);
    });
  });
});
