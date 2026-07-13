import { describe, it, expect, beforeAll } from "vitest";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { userService } from "@/services/user.service";
import type { CreateUserDTO } from "@/schemas/user";

describe("userService", () => {
  beforeAll(async () => {
    const { main } = await import("@/drizzle/seed");
    await main();
  });

  describe("create", () => {
    const plainPassword = "TestPass123!";
    const createData: CreateUserDTO = {
      name: "Password Test User",
      email: "password-test@example.com",
      password: plainPassword,
      isActive: true,
      roleIds: [],
    };

    it("stores a hashed password that can be verified with bcrypt.compare", async () => {
      const user = await userService.create(createData);

      expect(user).not.toBeNull();

      const [row] = await db
        .select({ passwordHash: users.passwordHash })
        .from(users)
        .where(eq(users.id, user!.id))
        .limit(1);

      const isValid = await bcrypt.compare(plainPassword, row!.passwordHash!);
      expect(isValid).toBe(true);
    });

    it("does not store the plaintext password in passwordHash", async () => {
      const user = await userService.create({
        ...createData,
        email: "password-test-2@example.com",
      });

      expect(user).not.toBeNull();

      const [row] = await db
        .select({ passwordHash: users.passwordHash })
        .from(users)
        .where(eq(users.id, user!.id))
        .limit(1);

      expect(row!.passwordHash).not.toBe(plainPassword);
    });
  });
});
