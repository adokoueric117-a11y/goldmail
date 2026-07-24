/**
 * lib/db/profile.ts
 * CRUD pour le profil utilisateur unique (stocké en SQLite local).
 */
import { getDB, persistDB } from "./database";
import type { Profile } from "@/types/database";

const DEFAULT_ID = 1;

export async function getProfile(): Promise<Profile | null> {
  const db = await getDB();
  const result = db.exec("SELECT * FROM profile WHERE id = 1 LIMIT 1");
  if (!result.length || !result[0].values.length) return null;

  const cols = result[0].columns;
  const row = result[0].values[0];
  const obj: Record<string, unknown> = {};
  cols.forEach((c, i) => (obj[c] = row[i]));
  return obj as unknown as Profile;
}

export async function upsertProfile(fields: {
  full_name?: string;
  job_title?: string;
  company?: string;
  phone?: string;
  website?: string;
  logo_base64?: string;
}): Promise<{ error: string | null }> {
  try {
    const db = await getDB();
    const now = new Date().toISOString();

    // Upsert : insérer si absent, mettre à jour si présent
    db.run(
      `INSERT INTO profile (id, full_name, job_title, company, phone, website, logo_base64, updated_at)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         full_name   = COALESCE(excluded.full_name, full_name),
         job_title   = COALESCE(excluded.job_title, job_title),
         company     = COALESCE(excluded.company, company),
         phone       = COALESCE(excluded.phone, phone),
         website     = COALESCE(excluded.website, website),
         logo_base64 = COALESCE(excluded.logo_base64, logo_base64),
         updated_at  = excluded.updated_at`,
      [
        fields.full_name ?? null,
        fields.job_title ?? null,
        fields.company ?? null,
        fields.phone ?? null,
        fields.website ?? null,
        fields.logo_base64 ?? null,
        now,
      ]
    );

    await persistDB();
    return { error: null };
  } catch (e) {
    console.error("[db/profile] upsertProfile error:", e);
    return { error: String(e) };
  }
}

export async function saveLogo(base64: string): Promise<{ error: string | null }> {
  try {
    const db = await getDB();
    const now = new Date().toISOString();

    db.run(
      `INSERT INTO profile (id, logo_base64, updated_at)
       VALUES (1, ?, ?)
       ON CONFLICT(id) DO UPDATE SET logo_base64 = excluded.logo_base64, updated_at = excluded.updated_at`,
      [base64, now]
    );

    await persistDB();
    return { error: null };
  } catch (e) {
    return { error: String(e) };
  }
}
