import { NextResponse } from "next/server";
import { getSmtpConfig, createSmtpTransporter } from "@/lib/smtp-server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { recipientEmail, subject, htmlBody } = body;

    // Validation des entrées
    if (!recipientEmail || !EMAIL_REGEX.test(String(recipientEmail).trim())) {
      return NextResponse.json(
        { error: "Adresse email du destinataire invalide." },
        { status: 400 }
      );
    }

    if (!subject || !String(subject).trim()) {
      return NextResponse.json(
        { error: "L'objet de l'email ne peut pas être vide." },
        { status: 400 }
      );
    }

    if (!htmlBody || !String(htmlBody).trim()) {
      return NextResponse.json(
        { error: "Le corps du message ne peut pas être vide." },
        { status: 400 }
      );
    }

    const config = getSmtpConfig();
    if (!config.host) {
      return NextResponse.json(
        {
          error:
            "Serveur SMTP non configuré. Veuillez aller dans Paramètres > Configuration SMTP pour renseigner l'hôte, le port et vos identifiants.",
        },
        { status: 400 }
      );
    }

    const transporter = createSmtpTransporter(config);

    const fromAddress = config.from.includes("<")
      ? config.from
      : config.user
      ? `${config.from || "GoldMail"} <${config.user}>`
      : "GoldMail <onboarding@goldmail.local>";

    const info = await transporter.sendMail({
      from: fromAddress,
      to: recipientEmail.trim(),
      subject: subject.trim(),
      html: htmlBody,
    });

    console.log("[send-email] SMTP Send success:", info.messageId);

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      message: `Email envoyé avec succès à ${recipientEmail}`,
    });
  } catch (err: unknown) {
    const error = err as NodeJS.ErrnoException & { responseCode?: number; code?: string; hostname?: string };
    console.error("[send-email] SMTP Error:", error);

    let userMessage = "Erreur lors de l'envoi via SMTP.";

    if (error.code === "EAUTH" || error.responseCode === 535) {
      userMessage = "Identifiants SMTP invalides (nom d'utilisateur ou mot de passe d'application incorrect).";
    } else if (error.code === "ENOTFOUND") {
      userMessage = `Serveur SMTP introuvable (${error.hostname || "hôte"}). Vérifiez l'adresse de l'hôte.`;
    } else if (error.code === "ECONNREFUSED") {
      userMessage = "Connexion refusée par le serveur SMTP. Vérifiez le port (587 ou 465).";
    } else if (error.code === "ETIMEDOUT" || error.message?.includes("timeout")) {
      userMessage = "Délai d'attente dépassé (timeout). Le serveur SMTP ne répond pas.";
    } else if (error.message) {
      userMessage = `Erreur SMTP : ${error.message}`;
    }

    return NextResponse.json({ error: userMessage }, { status: 500 });
  }
}
