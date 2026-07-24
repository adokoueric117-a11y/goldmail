/**
 * Types TypeScript pour la base de données SQLite locale.
 * logo_base64 remplace logo_url (plus de Supabase Storage).
 */

// ─── Profil utilisateur ──────────────────────────────────────────────────────
export interface Profile {
  id: number;              // Toujours 1 (profil unique)
  full_name: string | null;
  job_title: string | null;
  company: string | null;
  phone: string | null;
  website: string | null;
  logo_base64: string | null;  // Image encodée en base64 (stockée localement)
  updated_at: string | null;
}

// ─── Signature email ─────────────────────────────────────────────────────────
export interface Signature {
  id: string;
  profile_id: string;
  name: string;
  template_id: string;
  socials: Record<string, string> | null;
  is_default: boolean;
  created_at: string;
}

// ─── Email créé ──────────────────────────────────────────────────────────────
export type EmailStatus = "draft" | "completed";
export type SendStatus = "draft" | "sent" | "failed";

export interface Email {
  id: string;
  profile_id: number;
  subject: string;
  message: string;               // Message rédigé
  signature_id: string | null;
  recipient_email: string | null;
  sent_at: string | null;
  send_status: SendStatus;
  status: EmailStatus;
  created_at: string;
  updated_at: string;
}

// ─── Formulaire du wizard ────────────────────────────────────────────────────
export interface WizardState {
  // Étape 1 — Objet & contexte
  subject: string;
  recipientContext: string;
  // Étape 2 — Message
  rawMessage: string;
  // Étape 3 — Signature
  signatureId: string | null;
  // Étape 4 — Logo (base64 local)
  logoBase64: string | null;
  // Étape 5 — Destinataire & ID sauvegarde
  recipientEmail: string;
  savedEmailId: string | null;
}

// ─── Config SMTP ─────────────────────────────────────────────────────────────
export interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  from: string;
  secure: boolean;
}
