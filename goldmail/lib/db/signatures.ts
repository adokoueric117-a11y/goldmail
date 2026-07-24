/**
 * lib/db/signatures.ts
 * CRUD pour les signatures email (SQLite local).
 */
import { getDB, persistDB, uuid } from "./database";
import type { Signature } from "@/types/database";

function rowToSignature(cols: string[], row: (string | number | null)[]): Signature {
  const obj: Record<string, unknown> = {};
  cols.forEach((c, i) => (obj[c] = row[i]));
  return {
    id: obj.id as string,
    profile_id: String(obj.profile_id ?? "1"),
    name: obj.name as string,
    template_id: obj.template_id as string,
    socials: obj.socials ? JSON.parse(obj.socials as string) : null,
    is_default: obj.is_default === 1 || obj.is_default === "1",
    created_at: obj.created_at as string,
  };
}

export async function getSignatures(): Promise<Signature[]> {
  const db = await getDB();
  const result = db.exec(
    "SELECT * FROM signatures ORDER BY is_default DESC, created_at DESC"
  );
  if (!result.length) return [];
  const { columns, values } = result[0];
  return values.map((row) => rowToSignature(columns, row as (string | number | null)[]));
}

export async function createSignature(fields: {
  name: string;
  template_id: string;
  socials?: Record<string, string>;
}): Promise<{ id: string | null; error: string | null }> {
  try {
    const db = await getDB();
    const id = uuid();
    const now = new Date().toISOString();
    const socialsJson = fields.socials ? JSON.stringify(fields.socials) : null;

    db.run(
      `INSERT INTO signatures (id, profile_id, name, template_id, socials, is_default, created_at)
       VALUES (?, 1, ?, ?, ?, 0, ?)`,
      [id, fields.name, fields.template_id, socialsJson, now]
    );

    await persistDB();
    return { id, error: null };
  } catch (e) {
    return { id: null, error: String(e) };
  }
}

export async function updateSignature(
  id: string,
  fields: {
    name?: string;
    template_id?: string;
    socials?: Record<string, string>;
    is_default?: boolean;
  }
): Promise<{ error: string | null }> {
  try {
    const db = await getDB();

    // Si on définit comme default, retirer le flag des autres
    if (fields.is_default) {
      db.run("UPDATE signatures SET is_default = 0 WHERE id != ?", [id]);
    }

    const sets: string[] = [];
    const params: (string | number | null)[] = [];

    if (fields.name !== undefined) { sets.push("name = ?"); params.push(fields.name); }
    if (fields.template_id !== undefined) { sets.push("template_id = ?"); params.push(fields.template_id); }
    if (fields.socials !== undefined) { sets.push("socials = ?"); params.push(JSON.stringify(fields.socials)); }
    if (fields.is_default !== undefined) { sets.push("is_default = ?"); params.push(fields.is_default ? 1 : 0); }

    if (sets.length > 0) {
      params.push(id);
      db.run(`UPDATE signatures SET ${sets.join(", ")} WHERE id = ?`, params);
    }

    await persistDB();
    return { error: null };
  } catch (e) {
    return { error: String(e) };
  }
}

export async function deleteSignature(id: string): Promise<{ error: string | null }> {
  try {
    const db = await getDB();
    db.run("DELETE FROM signatures WHERE id = ?", [id]);
    await persistDB();
    return { error: null };
  } catch (e) {
    return { error: String(e) };
  }
}
