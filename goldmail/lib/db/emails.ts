/**
 * lib/db/emails.ts
 * CRUD pour l'historique des emails (SQLite local).
 */
import { getDB, persistDB, uuid } from "./database";
import type { Email, WizardState } from "@/types/database";

function rowToEmail(cols: string[], row: (string | number | null)[]): Email {
  const obj: Record<string, unknown> = {};
  cols.forEach((c, i) => (obj[c] = row[i]));
  return obj as unknown as Email;
}

export async function getEmails(): Promise<Email[]> {
  const db = await getDB();
  const result = db.exec("SELECT * FROM emails ORDER BY created_at DESC");
  if (!result.length) return [];
  const { columns, values } = result[0];
  return values.map((row) => rowToEmail(columns, row as (string | number | null)[]));
}

export async function createEmail(
  state: Partial<WizardState>
): Promise<{ id: string | null; error: string | null }> {
  try {
    const db = await getDB();
    const id = uuid();
    const now = new Date().toISOString();

    db.run(
      `INSERT INTO emails (id, profile_id, subject, message, signature_id, status, send_status, created_at, updated_at)
       VALUES (?, 1, ?, ?, ?, 'draft', 'draft', ?, ?)`,
      [
        id,
        state.subject ?? "",
        state.rawMessage ?? "",
        state.signatureId ?? null,
        now,
        now,
      ]
    );

    await persistDB();
    return { id, error: null };
  } catch (e) {
    return { id: null, error: String(e) };
  }
}

export async function updateEmail(
  id: string,
  state: Partial<WizardState>
): Promise<{ error: string | null }> {
  try {
    const db = await getDB();
    const now = new Date().toISOString();

    db.run(
      `UPDATE emails SET
         subject      = ?,
         message      = ?,
         signature_id = ?,
         updated_at   = ?
       WHERE id = ?`,
      [
        state.subject ?? "",
        state.rawMessage ?? "",
        state.signatureId ?? null,
        now,
        id,
      ]
    );

    await persistDB();
    return { error: null };
  } catch (e) {
    return { error: String(e) };
  }
}

export async function finalizeEmail(id: string): Promise<{ error: string | null }> {
  try {
    const db = await getDB();
    const now = new Date().toISOString();
    db.run(
      "UPDATE emails SET status = 'completed', updated_at = ? WHERE id = ?",
      [now, id]
    );
    await persistDB();
    return { error: null };
  } catch (e) {
    return { error: String(e) };
  }
}

export async function markEmailSent(
  id: string,
  recipientEmail: string,
  status: "sent" | "failed"
): Promise<void> {
  try {
    const db = await getDB();
    const now = new Date().toISOString();
    db.run(
      `UPDATE emails SET
         recipient_email = ?,
         send_status     = ?,
         sent_at         = ?,
         status          = 'completed',
         updated_at      = ?
       WHERE id = ?`,
      [recipientEmail, status, status === "sent" ? now : null, now, id]
    );
    await persistDB();
  } catch (e) {
    console.error("[db/emails] markEmailSent error:", e);
  }
}

export async function deleteEmail(id: string): Promise<{ error: string | null }> {
  try {
    const db = await getDB();
    db.run("DELETE FROM emails WHERE id = ?", [id]);
    await persistDB();
    return { error: null };
  } catch (e) {
    return { error: String(e) };
  }
}
