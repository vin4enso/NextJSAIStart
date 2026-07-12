import { db } from "@/lib/db";
import {
  permissions,
  rolePermissions,
  userRoles,
  roles,
} from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";
import { forbidden } from "./api-response";

export async function isSystemUser(userId: string): Promise<boolean> {
  const result = await db
    .select({ id: userRoles.roleId })
    .from(userRoles)
    .innerJoin(roles, eq(roles.id, userRoles.roleId))
    .where(and(eq(userRoles.userId, userId), eq(roles.isSystem, true)))
    .limit(1);

  return result.length > 0;
}

export async function getUserPermissionKeys(userId: string): Promise<string[]> {
  const isSystem = await isSystemUser(userId);
  if (isSystem) {
    const result = await db.select({ key: permissions.key }).from(permissions);
    return result.map((r) => r.key);
  }

  const result = await db
    .select({ key: permissions.key })
    .from(permissions)
    .innerJoin(
      rolePermissions,
      eq(rolePermissions.permissionId, permissions.id),
    )
    .innerJoin(userRoles, eq(userRoles.roleId, rolePermissions.roleId))
    .where(eq(userRoles.userId, userId));

  return result.map((r) => r.key);
}

export async function hasPermission(
  userId: string,
  permissionKey: string,
): Promise<boolean> {
  const isSystem = await isSystemUser(userId);
  if (isSystem) return true;

  const result = await db
    .select({ id: permissions.id })
    .from(permissions)
    .innerJoin(
      rolePermissions,
      eq(rolePermissions.permissionId, permissions.id),
    )
    .innerJoin(userRoles, eq(userRoles.roleId, rolePermissions.roleId))
    .where(
      and(eq(userRoles.userId, userId), eq(permissions.key, permissionKey)),
    )
    .limit(1);

  return result.length > 0;
}

export async function requirePermission(
  userId: string,
  permissionKey: string,
): Promise<void> {
  const has = await hasPermission(userId, permissionKey);
  if (!has) {
    throw forbidden();
  }
}
