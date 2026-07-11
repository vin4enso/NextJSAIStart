import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users, userRoles } from "@/drizzle/schema";
import { asc, count, desc, eq, like, or } from "drizzle-orm";
import type {
  CreateUserDTO,
  UpdateUserDTO,
  UserListParams,
} from "@/schemas/user";

export interface UserWithRoles {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export const userService = {
  async list(params: UserListParams = {}) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;
    const offset = (page - 1) * pageSize;
    const sortBy = params.sortBy ?? "createdAt";
    const sortOrder = params.sortOrder ?? "desc";

    const column = users[sortBy as keyof typeof users] as
      typeof users.createdAt | undefined;
    const orderBy = column
      ? sortOrder === "asc"
        ? asc(column)
        : desc(column)
      : desc(users.createdAt);

    const where = params.search
      ? or(
          like(users.name, `%${params.search}%`),
          like(users.email, `%${params.search}%`),
        )
      : undefined;

    const [totalResult] = await db
      .select({ count: count() })
      .from(users)
      .where(where);

    const total = totalResult.count;
    const totalPages = Math.ceil(total / pageSize);

    const rows = await db
      .select()
      .from(users)
      .where(where)
      .orderBy(orderBy)
      .limit(pageSize)
      .offset(offset);

    const items = rows.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      avatar: u.avatar,
      isActive: u.isActive,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
      deletedAt: u.deletedAt,
    }));

    return { items, total, page, pageSize, totalPages };
  },

  async getById(id: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
    };
  },

  async create(data: CreateUserDTO) {
    const id = randomUUID();
    const now = new Date().toISOString();

    db.insert(users)
      .values({
        id,
        name: data.name,
        email: data.email,
        passwordHash: bcrypt.hashSync(data.password, 10),
        isActive: data.isActive,
        createdAt: now,
        updatedAt: now,
      })
      .run();

    if (data.roleIds.length > 0) {
      db.insert(userRoles)
        .values(
          data.roleIds.map((roleId) => ({
            userId: id,
            roleId,
          })),
        )
        .run();
    }

    return this.getById(id);
  },

  async update(id: string, data: UpdateUserDTO) {
    const now = new Date().toISOString();

    const updateData: Record<string, unknown> = { updatedAt: now };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    if (Object.keys(updateData).length > 1) {
      db.update(users).set(updateData).where(eq(users.id, id)).run();
    }

    if (data.roleIds !== undefined) {
      db.delete(userRoles).where(eq(userRoles.userId, id)).run();

      if (data.roleIds.length > 0) {
        db.insert(userRoles)
          .values(
            data.roleIds.map((roleId) => ({
              userId: id,
              roleId,
            })),
          )
          .run();
      }
    }

    return this.getById(id);
  },

  async softDelete(id: string) {
    const now = new Date().toISOString();
    db.update(users)
      .set({ deletedAt: now, updatedAt: now })
      .where(eq(users.id, id))
      .run();
  },
};
