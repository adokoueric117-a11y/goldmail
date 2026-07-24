import { NextResponse } from "next/server";
import { getSmtpConfig, saveSmtpConfig } from "@/lib/smtp-server";

export async function GET() {
  const cfg = getSmtpConfig();
  return NextResponse.json({
    host: cfg.host,
    port: String(cfg.port),
    user: cfg.user,
    pass: cfg.pass ? "••••••••" : "",
    from: cfg.from,
    secure: cfg.secure,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { host, port, user, pass, from, secure } = body;

    const currentCfg = getSmtpConfig();

    const updatedPass =
      pass === "••••••••" || pass === undefined ? currentCfg.pass : pass;

    saveSmtpConfig({
      host: host ?? "",
      port: parseInt(port || "587", 10),
      user: user ?? "",
      pass: updatedPass ?? "",
      from: from ?? "",
      secure: Boolean(secure),
    });

    return NextResponse.json({ success: true, message: "Configuration SMTP enregistrée avec succès." });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || "Erreur sauvegarde" }, { status: 500 });
  }
}
