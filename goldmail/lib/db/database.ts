/**
 * lib/db/database.ts
 * Singleton sql.js — SQLite compilé en WebAssembly, persisté dans IndexedDB via localforage.
 * Toute l'app lit/écrit dans cette base locale (offline-first).
 */
import type { Database, SqlJsStatic } from "sql.js";
import localforage from "localforage";

const DB_KEY = "goldmail_sqlite_v2";

let _SQL: SqlJsStatic | null = null;
let _db: Database | null = null;
let _initPromise: Promise<Database> | null = null;

// ─── Initialisation ──────────────────────────────────────────────────────────
async function loadSQL(): Promise<SqlJsStatic> {
  if (_SQL) return _SQL;
  const initSqlJs = (await import("sql.js")).default;
  _SQL = await initSqlJs({
    locateFile: (file: string) => (file.endsWith(".wasm") ? "/sql-wasm.wasm" : `/${file}`),
  });
  return _SQL;
}

async function loadOrCreateDB(SQL: SqlJsStatic): Promise<Database> {
  const stored = await localforage.getItem<ArrayBuffer>(DB_KEY);
  if (stored) {
    const uint8 = new Uint8Array(stored);
    return new SQL.Database(uint8);
  }
  return new SQL.Database();
}

function applyMigrations(db: Database) {
  db.run(`
    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY DEFAULT 1,
      full_name TEXT,
      job_title TEXT,
      company TEXT,
      phone TEXT,
      website TEXT,
      logo_base64 TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS signatures (
      id TEXT PRIMARY KEY,
      profile_id INTEGER DEFAULT 1,
      name TEXT NOT NULL,
      template_id TEXT NOT NULL,
      socials TEXT,
      is_default INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS emails (
      id TEXT PRIMARY KEY,
      profile_id INTEGER DEFAULT 1,
      subject TEXT NOT NULL DEFAULT '',
      message TEXT NOT NULL DEFAULT '',
      signature_id TEXT,
      recipient_email TEXT,
      sent_at TEXT,
      send_status TEXT DEFAULT 'draft',
      status TEXT DEFAULT 'draft',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS custom_templates (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      badge TEXT NOT NULL,
      description TEXT,
      default_subject TEXT NOT NULL,
      default_recipient TEXT,
      text TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
}

/** Retourne la base initialisée (lazy singleton) */
export async function getDB(): Promise<Database> {
  if (_db) return _db;
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    const SQL = await loadSQL();
    const db = await loadOrCreateDB(SQL);
    applyMigrations(db);
    _db = db;
    return db;
  })();

  return _initPromise;
}

/** Persiste la DB dans IndexedDB après chaque mutation */
export async function persistDB(): Promise<void> {
  if (!_db) return;
  const data = _db.export();
  const buffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
  await localforage.setItem(DB_KEY, buffer);
}

/** Génère un UUID v4 simple */
export function uuid(): string {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
      });
}
