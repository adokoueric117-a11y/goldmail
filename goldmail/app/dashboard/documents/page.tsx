"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Download,
  FileText,
  Image as ImageIcon,
  PenLine,
  Printer,
  Search,
  Building2,
  ShieldAlert,
  CheckSquare,
  UserPlus,
  UserMinus,
  FileWarning,
  Award,
  Calendar,
  TrendingUp,
  CalendarCheck,
  Plus,
  Handshake,
  HeartHandshake,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { getProfile } from "@/lib/db/profile";
import { getSignatures } from "@/lib/db/signatures";
import { getCustomTemplates, deleteCustomTemplate } from "@/lib/db/custom_templates";
import SignaturePreview from "@/components/signatures/SignaturePreview";
import AddTemplateModal from "@/components/templates/AddTemplateModal";
import { HR_TEMPLATES, type HRTemplate } from "@/lib/templates";
import type { Profile, Signature } from "@/types/database";

const CATEGORIES = [
  "Tous",
  "RH & Juridique",
  "Management",
  "Communication",
  "Partenariat & Institution",
  "Urgence & Crise",
] as const;

export default function DocumentsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [signatureId, setSignatureId] = useState("");
  
  // Modèles pré-rédigés & personnalisés
  const [customTemplates, setCustomTemplates] = useState<HRTemplate[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Modèle sélectionné
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("licenciement");
  const [selectedCategory, setSelectedCategory] = useState<string>("Tous");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Champs du document
  const [documentSubject, setDocumentSubject] = useState<string>(HR_TEMPLATES[0].defaultSubject);
  const [recipient, setRecipient] = useState<string>(HR_TEMPLATES[0].defaultRecipient);
  const [body, setBody] = useState<string>(HR_TEMPLATES[0].text);
  const [date, setDate] = useState<string>(() =>
    new Date().toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  );

  const loadData = async () => {
    const [p, s, customs] = await Promise.all([
      getProfile(),
      getSignatures(),
      getCustomTemplates(),
    ]);
    setProfile(p);
    setSignatures(s);
    setCustomTemplates(customs);

    const preferred = s.find((item) => item.is_default) ?? s[0];
    if (preferred) setSignatureId(preferred.id);
  };

  useEffect(() => {
    loadData();
  }, []);

  const signature = useMemo(
    () => signatures.find((item) => item.id === signatureId) ?? null,
    [signatures, signatureId]
  );

  const profileData = {
    full_name: profile?.full_name,
    job_title: profile?.job_title,
    company: profile?.company,
    phone: profile?.phone,
    logo_base64: profile?.logo_base64,
  };

  // Fusion des modèles système + personnalisés
  const allTemplates = useMemo(() => {
    return [...HR_TEMPLATES, ...customTemplates];
  }, [customTemplates]);

  // Filtrage des modèles
  const filteredTemplates = useMemo(() => {
    return allTemplates.filter((tpl) => {
      const matchCat = selectedCategory === "Tous" || tpl.category === selectedCategory;
      const matchSearch =
        searchQuery.trim() === "" ||
        tpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tpl.badge.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [allTemplates, selectedCategory, searchQuery]);

  const handleSelectTemplate = (tpl: HRTemplate) => {
    setSelectedTemplateId(tpl.id);
    setDocumentSubject(tpl.defaultSubject);
    setRecipient(tpl.defaultRecipient);
    setBody(tpl.text);
  };

  const handleDeleteCustom = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteCustomTemplate(id);
    setCustomTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  const handleCustomCreated = (newTpl: HRTemplate) => {
    setCustomTemplates((prev) => [newTpl, ...prev]);
    handleSelectTemplate(newTpl);
  };

  const getTemplateIcon = (id: string) => {
    switch (id) {
      case "licenciement":
        return <FileWarning size={16} className="text-red-400 shrink-0" />;
      case "depart":
        return <UserMinus size={16} className="text-amber-400 shrink-0" />;
      case "bienvenue":
        return <UserPlus size={16} className="text-emerald-400 shrink-0" />;
      case "recadrage":
        return <ShieldAlert size={16} className="text-orange-400 shrink-0" />;
      case "felicitations":
        return <Award size={16} className="text-yellow-400 shrink-0" />;
      case "taches":
        return <CheckSquare size={16} className="text-blue-400 shrink-0" />;
      case "entretien_annuel":
        return <Calendar size={16} className="text-purple-400 shrink-0" />;
      case "conges":
        return <CalendarCheck size={16} className="text-teal-400 shrink-0" />;
      case "resultats":
        return <TrendingUp size={16} className="text-indigo-400 shrink-0" />;
      case "crise":
        return <ShieldAlert size={16} className="text-rose-500 shrink-0" />;
      case "partenariat":
        return <Handshake size={16} className="text-sky-400 shrink-0" />;
      case "remerciement_autorite":
        return <HeartHandshake size={16} className="text-[#c9a227] shrink-0" />;
      default:
        return <FileText size={16} className="text-gold shrink-0" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 py-2">
      {/* En-tête de la page */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-gold text-sm font-semibold">
            <FileText size={16} /> Générateur de Documents RH &amp; Institutionnels
          </div>
          <h1 className="text-2xl font-bold mt-1 text-base-content">
            Documents &amp; emails pré-rédigés
          </h1>
          <p className="text-sm text-base-content/60 mt-1">
            Complétez les variables entre [crochets] et exportez directement en PDF officiel avec logo et signature.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn btn-sm btn-outline border-gold/40 text-gold hover:bg-gold/10 gap-1.5 font-medium"
          >
            <Plus size={15} /> Nouveau modèle
          </button>

          <button
            onClick={() => window.print()}
            className="btn gap-2 font-semibold shadow-lg hover:scale-105 transition-transform"
            style={{
              backgroundColor: "oklch(72% 0.15 85)",
              color: "oklch(12% 0.02 85)",
              border: "none",
            }}
          >
            <Download size={16} /> Exporter en PDF
          </button>
        </div>
      </div>

      {/* Grid principal */}
      <div className="grid xl:grid-cols-[410px_minmax(0,1fr)] gap-6 items-start">
        {/* Panneau latéral d'édition & sélection */}
        <aside className="card-gold rounded-2xl p-5 space-y-5 print:hidden">
          {/* Recherche & Catégories */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-base-content flex items-center gap-1.5">
                <FileText size={15} className="text-gold" /> Modèles disponibles ({allTemplates.length})
              </span>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="text-xs text-gold hover:underline font-medium flex items-center gap-1"
              >
                <Plus size={13} /> Créer
              </button>
            </div>

            {/* Barre de recherche */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
              <input
                type="text"
                placeholder="Rechercher un modèle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input input-sm input-bordered w-full pl-9 bg-base-200 border-base-300 text-xs"
              />
            </div>

            {/* Filles de catégories */}
            <div className="flex flex-wrap gap-1 pt-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`btn btn-xs rounded-full transition-colors ${
                    selectedCategory === cat
                      ? "btn-warning text-black font-semibold"
                      : "btn-ghost text-base-content/60 bg-base-200/60"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Liste défilante des modèles */}
            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar border border-base-300/50 rounded-xl p-1 bg-base-200/30">
              {filteredTemplates.length === 0 ? (
                <p className="text-xs text-center py-4 text-base-content/40">Aucun modèle trouvé.</p>
              ) : (
                filteredTemplates.map((tpl) => {
                  const isSelected = selectedTemplateId === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      onClick={() => handleSelectTemplate(tpl)}
                      className={`w-full text-left p-2.5 rounded-lg text-xs transition-all flex items-start gap-2.5 border group ${
                        isSelected
                          ? "bg-gold/15 border-gold text-base-content font-medium"
                          : "bg-base-200/50 border-transparent hover:border-base-300 hover:bg-base-200 text-base-content/75"
                      }`}
                    >
                      {getTemplateIcon(tpl.id)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-semibold truncate text-xs">{tpl.title}</span>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-base-300/80 text-base-content/60 font-normal">
                              {tpl.badge}
                            </span>
                            {tpl.isCustom && (
                              <button
                                type="button"
                                onClick={(e) => handleDeleteCustom(e, tpl.id)}
                                title="Supprimer ce modèle"
                                className="opacity-0 group-hover:opacity-100 text-error hover:bg-error/10 p-0.5 rounded transition-opacity"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-[11px] text-base-content/50 line-clamp-1 mt-0.5">
                          {tpl.description}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="divider my-1 opacity-20" />

          {/* Formulaire d'édition directe */}
          <div className="space-y-3">
            <label className="form-control">
              <span className="label-text text-xs font-semibold text-base-content/75 mb-1">
                Objet / Titre du document
              </span>
              <input
                value={documentSubject}
                onChange={(e) => setDocumentSubject(e.target.value)}
                placeholder="Ex. Proposition de partenariat..."
                className="input input-bordered input-sm bg-base-200 border-base-300 text-xs font-medium"
              />
            </label>

            <div className="grid grid-cols-2 gap-2">
              <label className="form-control">
                <span className="label-text text-xs font-medium text-base-content/65 mb-1">
                  Date du document
                </span>
                <input
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input input-bordered input-sm bg-base-200 border-base-300 text-xs"
                />
              </label>

              <label className="form-control">
                <span className="label-text text-xs font-medium text-base-content/65 mb-1">
                  <PenLine size={12} className="inline mr-1" /> Signature
                </span>
                <select
                  value={signatureId}
                  onChange={(e) => setSignatureId(e.target.value)}
                  className="select select-bordered select-sm bg-base-200 border-base-300 text-xs"
                >
                  <option value="">Sans signature</option>
                  {signatures.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                      {item.is_default ? " (par défaut)" : ""}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="form-control">
              <span className="label-text text-xs font-medium text-base-content/65 mb-1">
                Destinataire (Coordonnées / Service)
              </span>
              <textarea
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder={"À l'attention de M. le Directeur\nInstitution Cible\nAdresse"}
                className="textarea textarea-bordered bg-base-200 border-base-300 min-h-16 text-xs leading-relaxed"
              />
            </label>

            <label className="form-control">
              <span className="label-text text-xs font-medium text-base-content/65 mb-1">
                Texte du document (remplacez les éléments entre [crochets])
              </span>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="textarea textarea-bordered bg-base-200 border-base-300 min-h-64 text-xs leading-relaxed font-mono"
              />
            </label>
          </div>

          <div className="p-3 rounded-xl bg-gold/10 border border-gold/20 text-xs text-base-content/70 flex gap-2.5 items-start">
            <Printer size={16} className="shrink-0 text-gold mt-0.5" />
            <div>
              <p className="font-semibold text-base-content">Export PDF instantané</p>
              <p className="text-[11px] text-base-content/60 mt-0.5">
                Cliquez sur « Exporter en PDF », puis choisissez « Enregistrer au format PDF » dans la fenêtre d&apos;impression.
              </p>
            </div>
          </div>
        </aside>

        {/* SECTION PRÉVISUALISATION / DOCUMENT A4 */}
        <section className="rounded-2xl bg-base-300/40 p-2 sm:p-6 overflow-auto print:p-0 print:bg-white print:m-0">
          <article className="document-paper mx-auto bg-white text-[#1e2430] shadow-2xl min-h-[1050px] max-w-[794px] p-8 sm:p-14 print:shadow-none print:min-h-0 print:max-w-none print:p-6 print:m-0 rounded-lg">
            {/* EN-TÊTE CORPORATE */}
            <header className="flex items-start justify-between gap-6 border-b-2 pb-6" style={{ borderColor: "#c9a227" }}>
              <div>
                {profile?.logo_base64 ? (
                  <Image
                    src={profile.logo_base64}
                    alt="Logo de l'entreprise"
                    width={160}
                    height={80}
                    className="object-contain object-left max-h-20 w-auto"
                    unoptimized
                  />
                ) : (
                  <div className="flex items-center gap-2 text-[#a37c13] font-bold text-lg">
                    <Building2 size={24} /> {profile?.company || "VOTRE ENTREPRISE"}
                  </div>
                )}
                <p className="text-xs text-slate-500 font-medium mt-2">
                  {profile?.company || "Raison sociale de l'entreprise"}
                </p>
                {profile?.phone && <p className="text-[11px] text-slate-400">Tél : {profile.phone}</p>}
              </div>

              <div className="text-right">
                <p className="text-sm font-semibold text-slate-700">{date}</p>
                <p className="text-xs text-slate-400 mt-1">Réf. Doc : RH-{new Date().getFullYear()}-OFFICIEL</p>
              </div>
            </header>

            {/* BLOC DESTINATAIRE */}
            <div className="mt-8 flex justify-end">
              <div className="bg-slate-50/80 p-4 rounded-md border border-slate-200/60 min-w-[260px] max-w-[340px] text-xs leading-5 text-slate-700 whitespace-pre-line shadow-sm">
                <span className="font-semibold text-slate-500 block text-[10px] uppercase tracking-wider mb-1">
                  Destinataire
                </span>
                {recipient || "À l'attention de la Direction\nOrganisme / Institution"}
              </div>
            </div>

            {/* OBJET DU DOCUMENT */}
            {documentSubject && (
              <div className="mt-8 p-3 rounded bg-amber-500/10 border-l-4 border-[#c9a227] text-slate-900 font-bold text-sm">
                {documentSubject}
              </div>
            )}

            {/* CORPS DU DOCUMENT */}
            <div className="mt-8 whitespace-pre-line text-[14px] leading-7 text-slate-800 font-serif">
              {body || "Sélectionnez un modèle pré-rédigé ci-contre ou saisissez votre contenu..."}
            </div>

            {/* SIGNATURE CORPORATE */}
            {signature && (
              <div className="mt-12 pt-6 border-t border-slate-200">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Signature officielle
                </p>
                <SignaturePreview
                  templateId={signature.template_id}
                  profile={profileData}
                  socials={(signature.socials as Record<string, string>) ?? {}}
                />
              </div>
            )}

            {/* PIED DE PAGE CORPORATE */}
            <footer className="mt-16 pt-5 border-t border-slate-200 text-center text-[11px] text-slate-400 flex flex-col items-center gap-1">
              <p className="font-medium text-slate-500">
                {profile?.company || "Entreprise"} — Document Officiel
              </p>
              {profile?.website && <p className="text-slate-400">{profile.website}</p>}
            </footer>
          </article>
        </section>
      </div>

      {/* Modal d'ajout de modèle personnalisé */}
      <AddTemplateModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleCustomCreated}
      />
    </div>
  );
}