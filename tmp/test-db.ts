import { createClient } from "@libsql/client";
import dotenv from "dotenv";
dotenv.config();

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN!,
});

async function test() {
  try {
    const rs = await client.execute("SELECT 1");
    console.log("Connection successful!", rs);
  } catch (err) {
    console.error("Connection failed:", err);
  }
}

test();
