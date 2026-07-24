/**
 * SignaturePreview — rendu HTML de la signature selon le template choisi.
 * Ce composant produit le HTML qui sera intégré dans l'email final.
 */
interface SignaturePreviewProps {
  templateId: string;
  profile: {
    full_name?: string | null;
    job_title?: string | null;
    company?: string | null;
    phone?: string | null;
    logo_base64?: string | null;
    logo_url?: string | null;
  };
  socials?: Record<string, string>;
}

export default function SignaturePreview({
  templateId,
  profile,
  socials = {},
}: SignaturePreviewProps) {
  const name = profile.full_name ?? "Votre Nom";
  const title = profile.job_title ?? "Votre Titre";
  const company = profile.company ?? "";
  const phone = profile.phone ?? "";
  const logo = profile.logo_base64 ?? profile.logo_url ?? null;
  const socialLinks = Object.entries(socials).filter(([, v]) => v.trim() !== "");

  const goldColor = "#C9A227";

  if (templateId === "minimal") {
    return (
      <div
        className="rounded-xl overflow-hidden border border-base-300 bg-white text-gray-800 p-4"
        style={{ fontFamily: "Arial, sans-serif", fontSize: "13px" }}
      >
        <p style={{ margin: 0, fontWeight: 700, color: "#111" }}>{name}</p>
        <p style={{ margin: "2px 0 0", color: "#666", fontSize: "12px" }}>
          {[title, company].filter(Boolean).join(" · ")}
        </p>
        {phone && (
          <p style={{ margin: "2px 0 0", color: "#888", fontSize: "11px" }}>
            {phone}
          </p>
        )}
        {socialLinks.length > 0 && (
          <div style={{ marginTop: "8px", display: "flex", gap: "10px" }}>
            {socialLinks.map(([key, url]) => (
              <a key={key} href={url} style={{ color: goldColor, fontSize: "11px" }}>
                {key}
              </a>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (templateId === "bold") {
    return (
      <div
        className="rounded-xl overflow-hidden border border-base-300 bg-white"
        style={{ fontFamily: "Arial, sans-serif", fontSize: "13px" }}
      >
        <div style={{ background: "#111", padding: "12px 16px" }}>
          {logo ? (
            <img
              src={logo}
              alt="Logo"
              style={{ height: "32px", objectFit: "contain" }}
            />
          ) : (
            <span style={{ color: goldColor, fontWeight: 800, fontSize: "16px" }}>
              {company || name}
            </span>
          )}
        </div>
        <div style={{ padding: "12px 16px" }}>
          <p style={{ margin: 0, fontWeight: 700, color: "#111", fontSize: "14px" }}>
            {name}
          </p>
          <p style={{ margin: "2px 0", color: goldColor, fontWeight: 600, fontSize: "12px" }}>
            {title}
          </p>
          {phone && (
            <p style={{ margin: "4px 0 0", color: "#555", fontSize: "11px" }}>
              {phone}
            </p>
          )}
          {socialLinks.length > 0 && (
            <div style={{ marginTop: "8px", display: "flex", gap: "10px" }}>
              {socialLinks.map(([key, url]) => (
                <a key={key} href={url} style={{ color: "#555", fontSize: "11px" }}>
                  {key}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default — "classic"
  return (
    <div
      className="rounded-xl overflow-hidden border border-base-300 bg-white p-4"
      style={{ fontFamily: "Arial, sans-serif", fontSize: "13px" }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
        {/* Logo ou initiales */}
        <div>
          {logo ? (
            <img
              src={logo}
              alt="Logo"
              style={{ width: "48px", height: "48px", objectFit: "contain", borderRadius: "6px" }}
            />
          ) : (
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "6px",
                background: "#111",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: goldColor,
                fontWeight: 800,
                fontSize: "16px",
              }}
            >
              {(name[0] ?? "G").toUpperCase()}
            </div>
          )}
        </div>

        {/* Infos */}
        <div style={{ borderLeft: `3px solid ${goldColor}`, paddingLeft: "12px" }}>
          <p style={{ margin: 0, fontWeight: 700, color: "#111", fontSize: "14px" }}>
            {name}
          </p>
          <p style={{ margin: "2px 0 0", color: "#555", fontSize: "12px" }}>
            {[title, company].filter(Boolean).join(" — ")}
          </p>
          {phone && (
            <p style={{ margin: "2px 0 0", color: "#888", fontSize: "11px" }}>
              {phone}
            </p>
          )}
          {socialLinks.length > 0 && (
            <div style={{ marginTop: "6px", display: "flex", gap: "8px" }}>
              {socialLinks.map(([key, url]) => (
                <a key={key} href={url} style={{ color: goldColor, fontSize: "11px" }}>
                  {key}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Génère le HTML de signature à insérer dans l'email exporté.
 * Utilisé par ExportPanel.
 */
export function generateSignatureHtml(
  templateId: string,
  profile: SignaturePreviewProps["profile"],
  socials: Record<string, string> = {}
): string {
  const name = profile.full_name ?? "";
  const title = profile.job_title ?? "";
  const company = profile.company ?? "";
  const phone = profile.phone ?? "";
  const logo = profile.logo_base64 ?? profile.logo_url ?? "";
  const goldColor = "#C9A227";
  const socialLinks = Object.entries(socials).filter(([, v]) => v.trim() !== "");

  const socialsHtml = socialLinks.length
    ? `<div style="margin-top:8px;">${socialLinks.map(([key, url]) => `<a href="${url}" style="color:${goldColor};font-size:11px;margin-right:8px;">${key}</a>`).join("")}</div>`
    : "";

  if (templateId === "minimal") {
    return `<div style="font-family:Arial,sans-serif;font-size:13px;color:#333;"><strong>${name}</strong><br/><span style="color:#666;font-size:12px;">${[title, company].filter(Boolean).join(" · ")}</span>${phone ? `<br/><span style="color:#888;font-size:11px;">${phone}</span>` : ""}${socialsHtml}</div>`;
  }

  if (templateId === "bold") {
    return `<table style="font-family:Arial,sans-serif;border-collapse:collapse;"><tr><td style="background:#111;padding:10px 14px;border-radius:6px 6px 0 0;">${logo ? `<img src="${logo}" alt="Logo" style="height:28px;"/>` : `<span style="color:${goldColor};font-weight:800;font-size:15px;">${company || name}</span>`}</td></tr><tr><td style="padding:10px 14px;border:1px solid #eee;border-radius:0 0 6px 6px;"><strong style="font-size:13px;">${name}</strong><br/><span style="color:${goldColor};font-size:12px;font-weight:600;">${title}</span>${phone ? `<br/><span style="color:#666;font-size:11px;">${phone}</span>` : ""}${socialsHtml}</td></tr></table>`;
  }

  // Classic
  const logoHtml = logo
    ? `<img src="${logo}" alt="Logo" style="width:44px;height:44px;object-fit:contain;border-radius:4px;"/>`
    : `<div style="width:44px;height:44px;border-radius:6px;background:#111;display:flex;align-items:center;justify-content:center;color:${goldColor};font-weight:800;font-size:16px;">${(name[0] ?? "G").toUpperCase()}</div>`;

  return `<table style="font-family:Arial,sans-serif;border-collapse:collapse;"><tr><td style="padding-right:14px;vertical-align:top;">${logoHtml}</td><td style="border-left:3px solid ${goldColor};padding-left:12px;vertical-align:top;"><strong style="color:#111;font-size:14px;">${name}</strong><br/><span style="color:#555;font-size:12px;">${[title, company].filter(Boolean).join(" — ")}</span>${phone ? `<br/><span style="color:#888;font-size:11px;">${phone}</span>` : ""}${socialsHtml}</td></tr></table>`;
}
