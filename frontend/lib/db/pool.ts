import { Pool } from "pg";

/**
 * Singleton PostgreSQL connection pool.
 *
 * Reads the standard `DATABASE_URL` environment variable which should be
 * a full connection string, e.g.:
 *   postgresql://user:password@localhost:5432/dormfix
 *
 * In development Next.js hot-reloads modules, so we cache the pool on
 * `globalThis` to avoid exhausting connections.
 */

const globalForPg = globalThis as unknown as { pgPool?: Pool };

export const pool: Pool =
  globalForPg.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPg.pgPool = pool;
}

/**
 * Convenience helper – runs a parameterised query and returns the rows.
 *
 * @example
 *   const users = await query<User>("SELECT * FROM users WHERE role = $1", ["student"]);
 */
export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const result = await pool.query(text, params);
  return result.rows as T[];
}

/**
 * Returns a single row or `null`.
 */
export async function queryOne<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}
