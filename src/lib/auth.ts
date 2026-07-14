import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import * as schema from "@/drizzle/schema";

function toSqliteValue(value: unknown): unknown {
  if (value === undefined) return null;
  if (value instanceof Date) return value.getTime();
  return value;
}

function serializeHook() {
  return {
    create: {
      before: async (data: Record<string, unknown>) => {
        const serialized: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(data)) {
          serialized[key] = toSqliteValue(value);
        }
        return { data: serialized };
      },
    },
    update: {
      before: async (data: Record<string, unknown>) => {
        const serialized: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(data)) {
          serialized[key] = toSqliteValue(value);
        }
        return { data: serialized };
      },
    },
  };
}

const hook = serializeHook();

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  databaseHooks: {
    user: hook,
    session: hook,
    account: hook,
    verification: hook,
  },
  user: {
    fields: {
      image: "avatar",
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  plugins: [nextCookies()],
});
