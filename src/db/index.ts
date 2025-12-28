import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Create a PostgreSQL connection pool
// This works with both local Postgres and standard Neon connections
const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
});

// Create the Drizzle database instance with schema
export const db = drizzle(pool, { schema });

// Export schema for convenience
export * from "./schema";
