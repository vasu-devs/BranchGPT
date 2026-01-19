import { drizzle } from "drizzle-orm/node-postgres";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { Pool } from "pg";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const isProduction = process.env.NODE_ENV === "production";
const connectionString = process.env.DATABASE_URL;
const localUrl = "postgresql://postgres@localhost:5432/postgres";

// In development, we MUST use the local database because the current network blocks Neon.
// In production (Vercel), we'll use Neon with the specialized HTTP driver for speed.
const isNeon = !!(connectionString && connectionString.includes("neon.tech"));

export const db = (isProduction && isNeon)
    ? drizzleNeon(neon(connectionString!), { schema })
    : drizzle(new Pool({ 
        connectionString: isProduction ? connectionString : localUrl,
        ssl: (isProduction && isNeon) ? { rejectUnauthorized: false } : false 
      }), { schema });
// Export schema for convenience
export * from "./schema";
