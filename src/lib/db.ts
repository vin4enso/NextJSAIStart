import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "@/drizzle/schema";

const dbPath = process.env.VITEST_POOL_ID
  ? `data/test-${process.env.VITEST_POOL_ID}.db`
  : process.env.DATABASE_URL
    ? process.env.DATABASE_URL
    : (process.env.VITEST_DB_PATH ?? "data/sqlite.db");

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite, { schema });
