import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

export interface SmtpServerConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  secure: boolean;
}

const CONFIG_FILE = path.join(process.cwd(), "smtp-config.json");

export function getSmtpConfig(): SmtpServerConfig {
  // 1. Env vars priority
  if (process.env.SMTP_HOST) {
    return {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      user: process.env.SMTP_USER || "",
      pass: process.env.SMTP_PASS || "",
      from: process.env.SMTP_FROM || process.env.SMTP_USER || "GoldMail",
      secure: process.env.SMTP_SECURE === "true" || process.env.SMTP_PORT === "465",
    };
  }

  // 2. Local config file fallback
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      const fileData = fs.readFileSync(CONFIG_FILE, "utf-8");
      const parsed = JSON.parse(fileData);
      return {
        host: parsed.host || "",
        port: parseInt(parsed.port || "587", 10),
        user: parsed.user || "",
        pass: parsed.pass || "",
        from: parsed.from || parsed.user || "GoldMail",
        secure: Boolean(parsed.secure),
      };
    } catch (e) {
      console.error("[smtp-server] Error reading smtp-config.json:", e);
    }
  }

  return {
    host: "",
    port: 587,
    user: "",
    pass: "",
    from: "",
    secure: false,
  };
}

export function saveSmtpConfig(config: Partial<SmtpServerConfig>): void {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
}

export function createSmtpTransporter(config?: SmtpServerConfig) {
  const cfg = config || getSmtpConfig();

  if (!cfg.host) {
    throw new Error("Serveur SMTP non configuré. Veuillez renseigner les paramètres SMTP dans Paramètres.");
  }

  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure, // true for 465, false for 587
    auth: cfg.user ? { user: cfg.user, pass: cfg.pass } : undefined,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
}
