import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";

const sqlite = new Database("data/sqlite.db");
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite);
