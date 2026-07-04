import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import {
  roles,
  rolePermissions,
  userRoles,
  permissions,
} from "@/drizzle/schema";
import { count, eq } from "drizzle-orm";
import type { CreateRoleDTO, UpdateRoleDTO } from "@/schemas/role";

export const roleService = {
  async list() {
    const allRoles = db
      .select({
        id: roles.id,
        name: roles.name,
        description: roles.description,
        isSystem: roles.isSystem,
        createdAt: roles.createdAt,
        updatedAt: roles.updatedAt,
      })
      .from(roles)
      .all();

    const result = allRoles.map((role) => ({
      ...role,
      userCount: 0,
      permissionCount: 0,
    }));

    for (const role of result) {
      const [userCountResult] = db
        .select({ count: count() })
        .from(userRoles)
        .where(eq(userRoles.roleId, role.id))
        .all();

      const [permCountResult] = db
        .select({ count: count() })
        .from(rolePermissions)
        .where(eq(rolePermissions.roleId, role.id))
        .all();

      role.userCount = userCountResult.count;
      role.permissionCount = permCountResult.count;
    }

    return result;
  },

  async getById(id: string) {
    const [role] = db
      .select({
        id: roles.id,
        name: roles.name,
        description: roles.description,
        isSystem: roles.isSystem,
        createdAt: roles.createdAt,
        updatedAt: roles.updatedAt,
      })
      .from(roles)
      .where(eq(roles.id, id))
      .all();

    if (!role) return null;

    const perms = db
      .select({
        id: permissions.id,
        key: permissions.key,
        name: permissions.name,
        group: permissions.group,
      })
      .from(permissions)
      .innerJoin(
        rolePermissions,
        eq(rolePermissions.permissionId, permissions.id),
      )
      .where(eq(rolePermissions.roleId, id))
      .all();

    return { ...role, permissions: perms };
  },

  async create(data: CreateRoleDTO) {
    const id = randomUUID();
    const now = new Date().toISOString();

    db.insert(roles)
      .values({
        id,
        name: data.name,
        description: data.description ?? null,
        isSystem: false,
        createdAt: now,
        updatedAt: now,
      })
      .run();

    if (data.permissionIds.length > 0) {
      db.insert(rolePermissions)
        .values(
          data.permissionIds.map((permissionId) => ({
            roleId: id,
            permissionId,
          })),
        )
        .run();
    }

    return this.getById(id);
  },

  async update(id: string, data: UpdateRoleDTO) {
    const now = new Date().toISOString();

    const updateData: Record<string, unknown> = { updatedAt: now };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;

    if (Object.keys(updateData).length > 1) {
      db.update(roles).set(updateData).where(eq(roles.id, id)).run();
    }

    if (data.permissionIds !== undefined) {
      db.delete(rolePermissions).where(eq(rolePermissions.roleId, id)).run();

      if (data.permissionIds.length > 0) {
        db.insert(rolePermissions)
          .values(
            data.permissionIds.map((permissionId) => ({
              roleId: id,
              permissionId,
            })),
          )
          .run();
      }
    }

    return this.getById(id);
  },

  async delete(id: string) {
    const [role] = db
      .select({ isSystem: roles.isSystem })
      .from(roles)
      .where(eq(roles.id, id))
      .all();

    if (!role) return false;
    if (role.isSystem) return false;

    db.delete(roles).where(eq(roles.id, id)).run();
    return true;
  },
};
