import { neon } from '@neondatabase/serverless';
import { drizzle, NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './schema';

let _db: NeonHttpDatabase<typeof schema> | null = null;

/**
 * Returns true if a dedicated disposable test database is configured.
 */
export function isTestDatabaseConfigured(): boolean {
  const testDbUrl = process.env.TEST_DATABASE_URL;
  return Boolean(testDbUrl && testDbUrl.startsWith('postgres'));
}

/**
 * Resets the cached database connection instance. Useful for testing environment switches.
 */
export function resetDbInstance(): void {
  _db = null;
}

/**
 * Resolves the database connection safely.
 *
 * SAFETY INVARIANT:
 * When running in test environments (NODE_ENV === 'test' or VITEST === 'true'),
 * integration tests must NEVER default to or accidentally target the primary/production DATABASE_URL.
 * A dedicated disposable test database must be explicitly configured via TEST_DATABASE_URL.
 */
export function getDb(): NeonHttpDatabase<typeof schema> | null {
  if (_db) return _db;

  const isTest = process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';

  let connectionString: string | undefined;

  if (isTest) {
    connectionString = process.env.TEST_DATABASE_URL;
    if (!connectionString || !connectionString.startsWith('postgres')) {
      // In test mode, fail closed: do NOT use production DATABASE_URL
      return null;
    }
  } else {
    connectionString = process.env.DATABASE_URL;
    if (!connectionString || !connectionString.startsWith('postgres')) {
      return null;
    }
  }

  try {
    const sql = neon(connectionString);
    _db = drizzle(sql, { schema });
    return _db;
  } catch (err) {
    console.warn('[Velmora DB] Database connection failed, using local/demo mode:', err);
    return null;
  }
}

export const db = getDb();
export { schema };
