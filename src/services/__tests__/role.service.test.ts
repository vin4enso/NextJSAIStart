import { describe, it, expect, beforeAll } from "vitest";
import { db } from "@/lib/db";
import { roles } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { roleService } from "@/services/role.service";

describe("roleService", () => {
  beforeAll(async () => {
    await import("@/drizzle/seed");
  });

  const testRoleName = "test-soft-delete-role";
  let testRoleId: string;

  beforeAll(async () => {
    const [existing] = db
      .select({ id: roles.id })
      .from(roles)
      .where(eq(roles.name, testRoleName))
      .all();

    if (existing) {
      db.delete(roles).where(eq(roles.name, testRoleName)).run();
    }

    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    db.insert(roles)
      .values({
        id,
        name: testRoleName,
        description: "Test role for soft delete",
        isSystem: false,
        createdAt: now,
        updatedAt: now,
      })
      .run();

    testRoleId = id;

    const [existingSys] = db
      .select({ id: roles.id })
      .from(roles)
      .where(eq(roles.name, "system-test-soft-delete"))
      .all();

    if (!existingSys) {
      const sysId = crypto.randomUUID();
      db.insert(roles)
        .values({
          id: sysId,
          name: "system-test-soft-delete",
          description: "System test role",
          isSystem: true,
          createdAt: now,
          updatedAt: now,
        })
        .run();
    }
  });

  describe("delete", () => {
    it("should set deletedAt on the role (not delete the row)", async () => {
      const result = await roleService.delete(testRoleId);

      expect(result).toBe(true);

      const [role] = db
        .select({ id: roles.id, deletedAt: roles.deletedAt })
        .from(roles)
        .where(eq(roles.id, testRoleId))
        .all();

      expect(role).toBeDefined();
      expect(role.deletedAt).not.toBeNull();
    });

    it("should return false if role doesn't exist", async () => {
      const result = await roleService.delete("non-existent-id");
      expect(result).toBe(false);
    });

    it("should return false if role is system role", async () => {
      const [sysRole] = db
        .select({ id: roles.id })
        .from(roles)
        .where(eq(roles.name, "system-test-soft-delete"))
        .all();

      const result = await roleService.delete(sysRole.id);
      expect(result).toBe(false);
    });
  });

  describe("list", () => {
    it("should NOT include soft-deleted roles", async () => {
      const roleList = await roleService.list();
      const deletedRole = roleList.find((r) => r.id === testRoleId);
      expect(deletedRole).toBeUndefined();
    });

    it("should include non-deleted roles", async () => {
      const roleList = await roleService.list();
      expect(roleList.length).toBeGreaterThan(0);
    });
  });

  describe("getById", () => {
    let activeRoleId: string;

    beforeAll(async () => {
      const now = new Date().toISOString();
      const id = crypto.randomUUID();
      db.insert(roles)
        .values({
          id,
          name: "active-role-for-getbyid-test",
          description: "Active role",
          isSystem: false,
          createdAt: now,
          updatedAt: now,
        })
        .run();

      activeRoleId = id;
    });

    it("should return role if not deleted", async () => {
      const role = await roleService.getById(activeRoleId);
      expect(role).not.toBeNull();
      expect(role!.id).toBe(activeRoleId);
    });

    it("should return null if role is soft-deleted", async () => {
      const role = await roleService.getById(testRoleId);
      expect(role).toBeNull();
    });
  });
});
