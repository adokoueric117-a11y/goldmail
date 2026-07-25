"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, FileText, Image as ImageIcon, PenLine, Printer, Sparkles } from "lucide-react";
import Image from "next/image";
import { getProfile } from "@/lib/db/profile";
import { getSignatures } from "@/lib/db/signatures";
import SignaturePreview from "@/components/signatures/SignaturePreview";
import type { Profile, Signature } from "@/types/database";

const templates = [
  { name: "Lettre professionnelle", text: "Madame, Monsieur,\n\nJe me permets de vous contacter afin de \n\nJe vous remercie par avance de l'attention portée à cette demande et reste à votre disposition pour tout complément d'information.\n\nCordialement," },
  { name: "Proposition commerciale", text: "Madame, Monsieur,\n\nNous avons le plaisir de vous présenter notre proposition, préparée pour répondre à vos besoins.\n\nNous restons à votre disposition pour échanger sur ses modalités.\n\nCordialement," },
  { name: "Attestation", text: "Je soussigné(e), certifie par la présente que :\n\n\n\nLa présente attestation est délivrée pour servir et valoir ce que de droit.\n\nFait le " },
];

export default function DocumentsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [signatureId, setSignatureId] = useState("");
  const [recipient, setRecipient] = useState("");
  const [body, setBody] = useState(templates[0].text);
  const [date, setDate] = useState(() => new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }));

  useEffect(() => { Promise.all([getProfile(), getSignatures()]).then(([p, s]) => { setProfile(p); setSignatures(s); const preferred = s.find((item) => item.is_default) ?? s[0]; if (preferred) setSignatureId(preferred.id); }); }, []);
  const signature = useMemo(() => signatures.find((item) => item.id === signatureId) ?? null, [signatures, signatureId]);
  const profileData = { full_name: profile?.full_name, job_title: profile?.job_title, company: profile?.company, phone: profile?.phone, logo_base64: profile?.logo_base64 };

  return <div className="max-w-7xl mx-auto space-y-6 py-2">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><div className="flex items-center gap-2 text-gold text-sm font-semibold"><FileText size={16} /> Documents</div><h1 className="text-2xl font-bold mt-1">Rédigez un document professionnel</h1><p className="text-sm text-base-content/55 mt-1">Votre logo et votre signature sont intégrés automatiquement.</p></div><button onClick={() => window.print()} className="btn gap-2 font-semibold" style={{ backgroundColor: "oklch(72% 0.15 85)", color: "oklch(12% 0.02 85)", border: "none" }}><Download size={16} /> Exporter en PDF</button></div>
    <div className="grid xl:grid-cols-[390px_minmax(0,1fr)] gap-6 items-start"><aside className="card-gold rounded-2xl p-5 space-y-5 print:hidden">
      <div><p className="text-sm font-semibold">Modèle de départ</p><div className="grid gap-2 mt-3">{templates.map((template) => <button key={template.name} onClick={() => { setBody(template.text); }} className="btn btn-sm btn-ghost justify-start text-base-content/70"><Sparkles size={14} className="text-gold" />{template.name}</button>)}</div></div>
      <label className="form-control"><span className="label-text text-xs font-medium text-base-content/65 mb-1">Destinataire</span><textarea value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder={"Nom\nFonction\nEntreprise"} className="textarea textarea-bordered bg-base-200 border-base-300 min-h-22 text-sm" /></label>
      <label className="form-control"><span className="label-text text-xs font-medium text-base-content/65 mb-1">Date</span><input value={date} onChange={(e) => setDate(e.target.value)} className="input input-bordered bg-base-200 border-base-300 text-sm" /></label>
      <label className="form-control"><span className="label-text text-xs font-medium text-base-content/65 mb-1">Contenu</span><textarea value={body} onChange={(e) => setBody(e.target.value)} className="textarea textarea-bordered bg-base-200 border-base-300 min-h-64 text-sm leading-relaxed" /></label>
      <label className="form-control"><span className="label-text text-xs font-medium text-base-content/65 mb-1"><PenLine size={13} className="inline mr-1" />Signature</span><select value={signatureId} onChange={(e) => setSignatureId(e.target.value)} className="select select-bordered bg-base-200 border-base-300 text-sm"><option value="">Sans signature</option>{signatures.map((item) => <option key={item.id} value={item.id}>{item.name}{item.is_default ? " (par défaut)" : ""}</option>)}</select></label>
      <p className="text-xs text-base-content/45 flex gap-2"><Printer size={14} className="shrink-0" />Dans la fenêtre suivante, choisissez « Enregistrer au format PDF ».</p>
    </aside><section className="rounded-2xl bg-base-300/40 p-3 sm:p-7 overflow-auto print:p-0 print:bg-white"><article className="document-paper mx-auto bg-white text-[#1e2430] shadow-xl min-h-[1050px] max-w-[794px] p-10 sm:p-16 print:shadow-none print:min-h-0 print:max-w-none">
      <header className="flex items-start justify-between gap-6 border-b-2 pb-7" style={{ borderColor: "#c9a227" }}><div>{profile?.logo_base64 ? <Image src={profile.logo_base64} alt="Logo de l'entreprise" width={155} height={80} className="object-contain object-left max-h-20 w-auto" unoptimized /> : <div className="flex items-center gap-2 text-[#a37c13] font-bold"><ImageIcon size={20} /> Votre logo</div>}<p className="text-xs text-slate-500 mt-3">{profile?.company || "Nom de votre entreprise"}</p></div><p className="text-sm text-right text-slate-600">{date}</p></header>
      <div className="mt-10 whitespace-pre-line text-sm leading-6 text-slate-600">{recipient || "Destinataire\nFonction\nEntreprise"}</div><div className="mt-8 whitespace-pre-line text-[15px] leading-8">{body || "Commencez à rédiger votre document…"}</div>{signature && <div className="mt-12 pt-6 border-t border-slate-200"><SignaturePreview templateId={signature.template_id} profile={profileData} socials={(signature.socials as Record<string, string>) ?? {}} /></div>}<footer className="mt-16 pt-5 border-t border-slate-200 text-center text-xs text-slate-400">{profile?.company}{profile?.website ? ` · ${profile.website}` : ""}</footer>
    </article></section></div>
  </div>;
}