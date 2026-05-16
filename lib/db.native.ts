import * as SQLite from 'expo-sqlite';
import { MIGRATIONS } from './migrations';

let dbSingleton: Promise<SQLite.SQLiteDatabase> | null = null;

async function ensureMigrations(db: SQLite.SQLiteDatabase) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY
    );
  `);
  const applied = new Set<number>();
  const rows = await db.getAllAsync<{ id: number }>('SELECT id FROM schema_migrations');
  for (const r of rows) {
    applied.add(r.id);
  }
  for (const m of MIGRATIONS) {
    if (applied.has(m.id)) continue;
    await db.execAsync(m.sql);
    await db.runAsync('INSERT INTO schema_migrations (id) VALUES (?)', m.id);
  }
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbSingleton) {
    dbSingleton = (async () => {
      const db = await SQLite.openDatabaseAsync('life-rpg.db');
      await db.execAsync('PRAGMA foreign_keys = ON;');
      await ensureMigrations(db);
      return db;
    })();
  }
  return dbSingleton;
}

export function resetDatabaseSingletonForTests() {
  dbSingleton = null;
}
