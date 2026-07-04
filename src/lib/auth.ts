import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import * as schema from "@/drizzle/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      ...schema,
      user: schema.users,
    },
  }),
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
