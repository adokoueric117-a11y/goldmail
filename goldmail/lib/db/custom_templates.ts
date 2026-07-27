/**
 * lib/db/custom_templates.ts
 * CRUD pour les modèles personnalisés créés par l'utilisateur (SQLite local).
 */
import { getDB, persistDB, uuid } from "./database";
import type { HRTemplate } from "@/lib/templates";

function rowToTemplate(cols: string[], row: (string | number | null)[]): HRTemplate {
  const obj: Record<string, unknown> = {};
  cols.forEach((c, i) => (obj[c] = row[i]));
  return {
    id: String(obj.id),
    title: String(obj.title),
    category: (obj.category as HRTemplate["category"]) || "Management",
    badge: String(obj.badge || "Personnalisé"),
    description: String(obj.description || "Modèle personnalisé"),
    defaultSubject: String(obj.default_subject || ""),
    defaultRecipient: String(obj.default_recipient || ""),
    text: String(obj.text || ""),
    isCustom: true,
  };
}

export async function getCustomTemplates(): Promise<HRTemplate[]> {
  try {
    const db = await getDB();
    const result = db.exec("SELECT * FROM custom_templates ORDER BY created_at DESC");
    if (!result.length) return [];
    const { columns, values } = result[0];
    return values.map((row) => rowToTemplate(columns, row as (string | number | null)[]));
  } catch (e) {
    console.error("[db/custom_templates] getCustomTemplates error:", e);
    return [];
  }
}

export async function createCustomTemplate(fields: {
  title: string;
  category: "RH & Juridique" | "Communication" | "Management" | "Partenariat & Institution" | "Urgence & Crise";
  badge?: string;
  description?: string;
  defaultSubject: string;
  defaultRecipient?: string;
  text: string;
}): Promise<{ id: string | null; error: string | null }> {
  try {
    const db = await getDB();
    const id = "custom_" + uuid();
    const now = new Date().toISOString();
    const badge = fields.badge || "Personnalisé";
    const description = fields.description || "Modèle personnalisé créé par l'utilisateur.";

    db.run(
      `INSERT INTO custom_templates (id, title, category, badge, description, default_subject, default_recipient, text, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        fields.title,
        fields.category,
        badge,
        description,
        fields.defaultSubject,
        fields.defaultRecipient ?? "",
        fields.text,
        now,
      ]
    );

    await persistDB();
    return { id, error: null };
  } catch (e) {
    return { id: null, error: String(e) };
  }
}

export async function deleteCustomTemplate(id: string): Promise<{ error: string | null }> {
  try {
    const db = await getDB();
    db.run("DELETE FROM custom_templates WHERE id = ?", [id]);
    await persistDB();
    return { error: null };
  } catch (e) {
    return { error: String(e) };
  }
}
