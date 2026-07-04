import { db } from "@/lib/db";
import { permissions } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export const permissionService = {
  async list() {
    const allPermissions = db
      .select({
        id: permissions.id,
        key: permissions.key,
        name: permissions.name,
        group: permissions.group,
        createdAt: permissions.createdAt,
      })
      .from(permissions)
      .orderBy(permissions.group)
      .all();

    const grouped: Record<string, typeof allPermissions> = {};

    for (const perm of allPermissions) {
      if (!grouped[perm.group]) {
        grouped[perm.group] = [];
      }
      grouped[perm.group].push(perm);
    }

    return grouped;
  },

  async update(id: string, data: { name?: string; group?: string }) {
    const updateData: Record<string, string> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.group !== undefined) updateData.group = data.group;

    if (Object.keys(updateData).length === 0) return null;

    db.update(permissions).set(updateData).where(eq(permissions.id, id)).run();

    const [updated] = db
      .select({
        id: permissions.id,
        key: permissions.key,
        name: permissions.name,
        group: permissions.group,
        createdAt: permissions.createdAt,
      })
      .from(permissions)
      .where(eq(permissions.id, id))
      .all();

    return updated ?? null;
  },
};
