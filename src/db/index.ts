import { drizzle } from "drizzle-orm/node-postgres";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { Pool } from "pg";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
const localUrl = "postgresql://postgres@localhost:5432/postgres";

// In development and production, we use Neon with the specialized HTTP driver for speed and to bypass local port blocks.
const isNeon = !!(connectionString && connectionString.includes("neon.tech"));

export const db = isNeon
  ? drizzleNeon(neon(connectionString!), { schema })
  : drizzle(new Pool({
    connectionString: connectionString || localUrl,
    ssl: false
  }), { schema });
// Export schema for convenience
export * from "./schema";
