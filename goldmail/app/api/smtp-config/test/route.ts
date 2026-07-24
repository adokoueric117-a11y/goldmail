import { NextResponse } from "next/server";
import { getSmtpConfig, createSmtpTransporter } from "@/lib/smtp-server";

export async function POST() {
  try {
    const config = getSmtpConfig();
    if (!config.host) {
      return NextResponse.json(
        { error: "Veuillez saisir un hôte SMTP avant de tester." },
        { status: 400 }
      );
    }

    const transporter = createSmtpTransporter(config);
    await transporter.verify();

    return NextResponse.json({
      ok: true,
      message: "✓ Connexion SMTP réussie ! Le serveur et les identifiants sont valides.",
    });
  } catch (err: unknown) {
    const error = err as NodeJS.ErrnoException & { responseCode?: number; code?: string; hostname?: string };
    console.error("[smtp-test] Error:", error);

    let msg = "Échec du test SMTP.";

    if (error.code === "EAUTH" || error.responseCode === 535) {
      msg = "Identifiants SMTP incorrects (nom d'utilisateur ou mot de passe d'application).";
    } else if (error.code === "ENOTFOUND") {
      msg = `Serveur introuvable (${error.hostname || "hôte"}). Vérifiez l'adresse Hôte.`;
    } else if (error.code === "ECONNREFUSED") {
      msg = "Connexion refusée. Vérifiez le port (587 avec TLS ou 465 avec SSL).";
    } else if (error.code === "ETIMEDOUT") {
      msg = "Délai d'attente dépassé (timeout) lors de la tentative de connexion au serveur SMTP.";
    } else if (error.message) {
      msg = `Erreur : ${error.message}`;
    }

    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
