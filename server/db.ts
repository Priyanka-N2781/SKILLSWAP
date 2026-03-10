import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client/web";
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
  console.log("DB_LOG: Initializing remote Turso client with URL:", tursoUrl.substring(0, 20) + "...");
  clientOptions = { url: tursoUrl, authToken: tursoToken };
} else {
  // Fallback to local file for development
  console.warn("DB_LOG: WARNING: No DATABASE_URL found. Check your Netlify environment variables!");
  const dbPath = path.resolve(process.cwd(), "sqlite.db");
  clientOptions = { url: `file:${dbPath}` };
}

export const sqlite = createClient(clientOptions);
export const db = drizzle(sqlite, { schema });
