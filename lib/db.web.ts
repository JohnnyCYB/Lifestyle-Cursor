/**
 * Web SQLite via sql.js (WASM). Persists to localStorage. Do not use for large databases.
 */
import type { Database, SqlValue } from 'sql.js';
import initSqlJs from 'sql.js';
import { MIGRATIONS } from './migrations';

const STORAGE_KEY = 'life-rpg-sqljs-v1';
const SQL_JS_VERSION = '1.11.0';

type BindParam = string | number | Uint8Array | null;

let dbSingleton: Promise<WebSqliteDatabase> | null = null;

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function base64ToUint8(b64: string): Uint8Array {
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
}

async function ensureMigrations(db: WebSqliteDatabase) {
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

/** Serialize all DB operations — sql.js Database is synchronous but not re-entrant safe with our wrapper. */
function createGate() {
  let tail = Promise.resolve();
  return function enqueue<T>(fn: () => Promise<T>): Promise<T> {
    const run = tail.then(fn, fn);
    tail = run.then(
      () => undefined,
      () => undefined
    );
    return run;
  };
}

export class WebSqliteDatabase {
  private readonly enqueue: ReturnType<typeof createGate>;
  private saveTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly db: Database) {
    this.enqueue = createGate();
  }

  private schedulePersist() {
    if (typeof localStorage === 'undefined') return;
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => {
      this.saveTimer = null;
      try {
        const data = this.db.export();
        localStorage.setItem(STORAGE_KEY, uint8ToBase64(data));
      } catch (e) {
        console.warn('[life-rpg] web sqlite persist failed', e);
      }
    }, 250);
  }

  async execAsync(source: string): Promise<void> {
    await this.enqueue(async () => {
      this.db.exec(source);
      this.schedulePersist();
    });
  }

  async runAsync(sql: string, ...params: BindParam[]): Promise<{ lastInsertRowId: number; changes: number }> {
    return this.enqueue(async () => {
      if (params.length) {
        this.db.run(sql, params as SqlValue[]);
      } else {
        this.db.run(sql);
      }
      const changes = this.db.getRowsModified();
      const r = this.db.exec('SELECT last_insert_rowid() as id');
      const lastInsertRowId = Number(r[0]?.values[0]?.[0] ?? 0);
      this.schedulePersist();
      return { changes, lastInsertRowId };
    });
  }

  async getAllAsync<T>(sql: string, ...params: BindParam[]): Promise<T[]> {
    return this.enqueue(async () => {
      const stmt = this.db.prepare(sql);
      try {
        if (params.length) {
          stmt.bind(params as SqlValue[]);
        }
        const rows: T[] = [];
        while (stmt.step()) {
          rows.push(stmt.getAsObject() as T);
        }
        return rows;
      } finally {
        stmt.free();
      }
    });
  }

  async getFirstAsync<T>(sql: string, ...params: BindParam[]): Promise<T | null> {
    const rows = await this.getAllAsync<T>(sql, ...params);
    return rows[0] ?? null;
  }

  close() {
    this.db.close();
  }
}

export async function getDatabase(): Promise<WebSqliteDatabase> {
  if (!dbSingleton) {
    dbSingleton = (async () => {
      const SQL = await initSqlJs({
        locateFile: (file: string) =>
          `https://cdnjs.cloudflare.com/ajax/libs/sql.js/${SQL_JS_VERSION}/${file}`,
      });

      let db: Database;
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          try {
            db = new SQL.Database(base64ToUint8(raw));
          } catch {
            db = new SQL.Database();
          }
        } else {
          db = new SQL.Database();
        }
      } else {
        db = new SQL.Database();
      }

      const wrap = new WebSqliteDatabase(db);
      await wrap.execAsync('PRAGMA foreign_keys = ON;');
      await ensureMigrations(wrap);
      return wrap;
    })();
  }
  return dbSingleton;
}

export function resetDatabaseSingletonForTests() {
  dbSingleton = null;
}
