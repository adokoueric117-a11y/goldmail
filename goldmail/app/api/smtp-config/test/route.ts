import { NextResponse } from "next/server";
import { getSmtpConfig, createSmtpTransporter } from "@/lib/smtp-server";

export async function POST() {
  try {
    const config = getSmtpConfig();
    if (!config.host) {
      return NextResponse.json(
        { error: "Veuillez d'abord configurer et enregistrer l'hôte SMTP." },
        { status: 400 }
      );
    }

    const transporter = createSmtpTransporter(config);
    await transporter.verify();

    return NextResponse.json({
      success: true,
      message: "Connexion au serveur SMTP réussie !",
    });
  } catch (err: unknown) {
    const error = err as NodeJS.ErrnoException & { responseCode?: number; code?: string; hostname?: string };
    console.error("[smtp-test] Error:", error);

    let userMessage = "Échec du test de connexion SMTP.";

    if (error.code === "EAUTH" || error.responseCode === 535) {
      userMessage = "Identifiants SMTP invalides (nom d'utilisateur ou mot de passe incorrect).";
    } else if (error.code === "ENOTFOUND") {
      userMessage = `Serveur SMTP introuvable (${error.hostname || "hôte"}). Vérifiez l'hôte.`;
    } else if (error.code === "ECONNREFUSED") {
      userMessage = "Connexion refusée par le serveur SMTP. Vérifiez le port (587 ou 465).";
    } else if (error.code === "ETIMEDOUT" || error.message?.includes("timeout")) {
      userMessage = "Délai d'attente dépassé. Le serveur SMTP ne répond pas.";
    } else if (error.message) {
      userMessage = `Erreur SMTP : ${error.message}`;
    }

    return NextResponse.json({ error: userMessage }, { status: 500 });
  }
}
