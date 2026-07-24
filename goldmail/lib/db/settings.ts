/**
 * lib/db/settings.ts
 * Paires clé/valeur pour les préférences utilisateur (thème, SMTP config).
 * Stockées dans la table `settings` de la DB SQLite locale.
 */
import { getDB, persistDB } from "./database";

export async function getSetting(key: string): Promise<string | null> {
  const db = await getDB();
  const result = db.exec("SELECT value FROM settings WHERE key = ?", [key]);
  if (!result.length || !result[0].values.length) return null;
  return result[0].values[0][0] as string | null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDB();
  db.run(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    [key, value]
  );
  await persistDB();
}
