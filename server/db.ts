import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "@shared/schema";
import path from "path";

// Setup database connection. In production on Render, we use a remote Turso database.
// In local development, we fallback to a local SQLite file.
const isProduction = process.env.NODE_ENV === "production";
const tursoUrl = process.env.DATABASE_URL;
const tursoToken = process.env.DATABASE_AUTH_TOKEN;

let clientOptions: any;

if (tursoUrl) {
  // Use remote database if URL is provided (production)
  clientOptions = { url: tursoUrl, authToken: tursoToken };
} else {
  // Fallback to local file for development
  const dbPath = path.resolve(process.cwd(), "sqlite.db");
  clientOptions = { url: `file:${dbPath}` };
}

export const sqlite = createClient(clientOptions);
export const db = drizzle(sqlite, { schema });
