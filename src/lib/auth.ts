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

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      users: schema.users,
      account: schema.accounts,
      session: schema.sessions,
      verification: schema.verifications,
    },
  }),
  databaseHooks: {
    user: {
      create: {
        before: async (data) => {
          const serialized: Record<string, unknown> = {};
          for (const [key, value] of Object.entries(data)) {
            serialized[key] = toSqliteValue(value);
          }
          return { data: serialized };
        },
      },
    },
    session: {
      create: {
        before: async (data) => {
          const serialized: Record<string, unknown> = {};
          for (const [key, value] of Object.entries(data)) {
            serialized[key] = toSqliteValue(value);
          }
          return { data: serialized };
        },
      },
    },
    account: {
      create: {
        before: async (data) => {
          const serialized: Record<string, unknown> = {};
          for (const [key, value] of Object.entries(data)) {
            serialized[key] = toSqliteValue(value);
          }
          return { data: serialized };
        },
      },
    },
    verification: {
      create: {
        before: async (data) => {
          const serialized: Record<string, unknown> = {};
          for (const [key, value] of Object.entries(data)) {
            serialized[key] = toSqliteValue(value);
          }
          return { data: serialized };
        },
      },
    },
  },
  user: {
    modelName: "users",
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
