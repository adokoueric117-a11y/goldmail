/**
 * lib/templates.ts
 * Bibliothèque centrale de modèles d'emails et documents professionnels pré-rédigés.
 * Spécialement conçue pour les chefs d'entreprise, managers, RH et relations institutionnelles.
 */

export interface HRTemplate {
  id: string;
  title: string;
  category: "RH & Juridique" | "Communication" | "Management" | "Partenariat & Institution" | "Urgence & Crise";
  badge: string;
  description: string;
  defaultSubject: string;
  defaultRecipient: string;
  text: string;
  isCustom?: boolean;
}

export const HR_TEMPLATES: HRTemplate[] = [
  {
    id: "licenciement",
    title: "Convocation à un entretien de licenciement",
    category: "RH & Juridique",
    badge: "Cadre Légal",
    description: "Convoquer officiellement un salarié à un entretien préalable à une fin de contrat (conforme au Code du travail).",
    defaultSubject: "Convocation à un entretien préalable de licenciement — [Nom du salarié]",
    defaultRecipient: "[Nom du salarié]\n[Poste du salarié]\n[Adresse / Service]",
    text: `[Nom et Prénom du salarié]
[Adresse / Service du salarié]

À [Nom de la ville], le [Date du jour]

OBJET : Convocation à un entretien préalable à un éventuel licenciement

Madame, Monsieur,

Par la présente, nous vous informons que nous sommes amenés à envisager à votre égard une mesure de licenciement.

En application des dispositions légales et réglementaires en vigueur (article L. 1232-2 du Code du travail), nous vous prions de bien vouloir vous présenter le :

• Date : [Date de l'entretien]
• Heure : [Heure de l'entretien]
• Lieu : [Bureau / Salle de réunion / Adresse]

Cet entretien a pour objet de vous exposer les motifs de la mesure envisagée et de recueillir vos explications.

Nous vous rappelons que vous avez la possibilité de vous faire assister lors de cet entretien par une personne de votre choix appartenant au personnel de l'entreprise (ou par un conseiller du salarié inscrit sur la liste préfectorale tenue à votre disposition à la Mairie de [Ville] ou à l'Inspection du Travail).

Dans l'attente de cet entretien, nous vous prions d'agréer, Madame, Monsieur, l'expression de nos salutations distinguées.

[Nom du responsable / Boss]
[Intitulé de poste / Direction]
[Nom de l'entreprise]`,
  },
  {
    id: "depart",
    title: "Annonce de départ d'un collaborateur",
    category: "Communication",
    badge: "Vie d'équipe",
    description: "Informer toute l'équipe du départ prochain d'un salarié et organiser la transition.",
    defaultSubject: "Information d'entreprise — Départ de [Nom du collaborateur]",
    defaultRecipient: "À l'ensemble des collaborateurs\n[Nom de l'entreprise]",
    text: `Chères équipes, Chers collègues,

Je vous informe aujourd'hui du départ prochain de [Nom et Prénom du collaborateur], [Intitulé du poste], qui a décidé de donner une nouvelle orientation à sa carrière professionnelle.

Son dernier jour effectif au sein de [Nom de l'entreprise] sera le [Date effective de départ].

Durant ces [Nombre d'années/mois] passées parmi nous, [Prénom du collaborateur] a grandement contribué aux projets [Citer 1 ou 2 projets majeurs] et à la dynamique collective. Je tiens à le/la remercier chaleureusement pour son engagement.

Afin d'assurer une transition parfaitement fluide :
• La reprise de ses dossiers sera assurée par [Nom du collaborateur relais] à compter du [Date].
• Vos demandes opérationnelles habituelles peuvent être adressées à [Contact relais].

Un pot de départ sera organisé le [Date et Heure] en salle [Nom de la salle / Espace détente] pour lui témoigner notre sympathie et lui souhaiter une excellente continuation.

Nous lui souhaitons toute la réussite possible dans ses nouveaux projets !

Bien cordialement,

[Nom du Boss / Direction]
[Intitulé de poste]
[Nom de l'entreprise]`,
  },
  {
    id: "bienvenue",
    title: "Bienvenue à une nouvelle recrue",
    category: "Communication",
    badge: "Onboarding",
    description: "Présenter un nouveau salarié à l'ensemble de l'entreprise le jour de son arrivée.",
    defaultSubject: "Bienvenue dans l'équipe à [Nom de la nouvelle recrue] !",
    defaultRecipient: "À l'attention de l'ensemble de l'équipe\n[Nom de l'entreprise]",
    text: `Chères équipes,

C'est avec grand plaisir que nous accueillons aujourd'hui [Nom et Prénom de la nouvelle recrue] au sein de notre entreprise en tant que [Intitulé du poste].

[Prénom de la nouvelle recrue] rejoint l'équipe [Nom du département/équipe] sous la responsabilité de [Nom du manager de l'équipe].

Riche d'une expérience reconnue en [Domaine d'expertise / Spécialité], [Prénom] aura principalement pour missions :
• [Mission principale 1]
• [Mission principale 2]
• [Mission principale 3]

Pendant ses premières semaines, [Nom du mentor / Parrain] l'accompagnera dans son intégration.

N'hésitez pas à lui rendre visite à son bureau (situé au [Étage / Bureau]) ou à échanger avec lui/elle lors de notre café d'accueil de ce matin à [Heure].

Souhaitons tous ensemble un chaleureux bienvenue à [Prénom] !

Amicalement,

[Nom du Boss / Direction HR]
[Fonction]
[Nom de l'entreprise]`,
  },
  {
    id: "recadrage",
    title: "Recadrage ou rappel à l'ordre",
    category: "Management",
    badge: "Discipline & Cadre",
    description: "Signaler officiellement à un salarié un problème de comportement, de retard ou de travail.",
    defaultSubject: "Rappel à l'ordre professionnel — Respect du cadre et des procédures",
    defaultRecipient: "[Nom et Prénom du salarié]\n[Intitulé du poste]\n[Service / Département]",
    text: `[Nom et Prénom du salarié]
[Intitulé du poste]

À [Nom de la ville], le [Date du jour]

OBJET : Notification de rappel à l'ordre professionnel

Madame, Monsieur,

Par le présent courrier, je souhaite attirer formellement votre attention sur des manquements constatés concernant [Préciser la nature du problème : retards répététifs / non-respect des règles d'organisation / qualité de travail / comportement].

En effet, il a été constaté en date du [Date des faits ou période] les éléments suivants :
[Description factuelle, claire et objective des faits reprochés].

De tels agissements perturbent l'organisation de l'équipe et ne correspondent pas aux exigences de rigueur et de professionnalisme en vigueur au sein de [Nom de l'entreprise].

Nous vous rappelons qu'il est impératif de veiller au respect strict des consignes suivantes :
1. [Attente / Correction exigée n°1]
2. [Attente / Correction exigée n°2]

Un entretien d'étape sera planifié le [Date du rendez-vous de suivi] afin d'évaluer le rétablissement de la situation. Nous comptons sur votre professionnalisme pour redresser ces points immédiatement.

Veuillez agréer, Madame, Monsieur, l'expression de nos salutations distinguées.

[Nom du Responsable / Boss]
[Fonction]
[Nom de l'entreprise]`,
  },
  {
    id: "felicitations",
    title: "Félicitations collectives de l'équipe",
    category: "Management",
    badge: "Reconnaissance",
    description: "Remercier toute l'équipe après la réussite d'un projet majeur ou l'atteinte des objectifs.",
    defaultSubject: "Félicitations à toute l'équipe pour la réussite de [Nom du projet / Objectif] !",
    defaultRecipient: "À l'ensemble des équipes\n[Nom de l'entreprise]",
    text: `Chère équipe,

Je prends la parole aujourd'hui pour vous adresser mes félicitations les plus chaleureuses et exprimer ma grande fierté suite à l'atteinte de nos objectifs [Trimestre / Projet XYZ].

Grâce au travail de chacun, à votre rigueur et à votre solidarité, nous avons franchi une étape majeure :
• [Résultat remarquable 1 : ex. Dépasser l'objectif de X%]
• [Résultat remarquable 2 : ex. Livrer le projet dans les délais et sans incident]
• [Résultat remarquable 3 : ex. Obtenir la satisfaction totale de nos clients]

Cette belle réussite démontre la force de notre collectif et la valeur remarquable de vos efforts quotidiens.

Pour vous remercier personnellement et célébrer ensemble ce succès mérité, j'ai le plaisir de vous convier à [Événement : un repas d'équipe / pot de célébration] le [Date et Heure] à [Lieu].

Encore bravo et merci à toutes et à tous !

Bien chaleureusement,

[Nom du Boss / Fondateur / Dirigeant]
[Fonction]
[Nom de l'entreprise]`,
  },
  {
    id: "taches",
    title: "Attribution des tâches et instructions",
    category: "Management",
    badge: "Organisation",
    description: "Donner les instructions de travail et les priorités de la semaine à son équipe.",
    defaultSubject: "Feuille de route et attribution des tâches — Semaine du [Date]",
    defaultRecipient: "À l'équipe [Nom de l'équipe / Service]\n[Nom de l'entreprise]",
    text: `Bonjour à tous,

Voici la feuille de route et l'attribution des tâches prioritaires pour la semaine du [Date de début] au [Date de fin].

🎯 OBJECTIF MAJEUR DE LA SEMAINE :
[Description synthétique du cap prioritaire de la semaine]

📋 RÉPARTITION DES TÂCHES ET RESPONSABILITÉS :

1. Projet [Nom du Projet A] :
   • Action à mener : [Description concise de la tâche]
   • Responsable : [Nom du collaborateur]
   • Échéance : [Date / Heure]

2. Projet [Nom du Projet B] :
   • Action à mener : [Description concise de la tâche]
   • Responsable : [Nom du collaborateur]
   • Échéance : [Date / Heure]

3. Support & Opérations courantes :
   • Action à mener : [Description concise de la tâche]
   • Responsable : [Nom du collaborateur]
   • Échéance : [Date / Heure]

📅 REPOINTS DE L'ÉQUIPE :
• Point d'étape mi-semaine : [Date et Heure]
• Bilan hebdomadaire : [Date et Heure]

Merci de revenir vers moi en cas de doute ou de besoin de clarification. Bon travail à toutes et tous !

[Nom du Manager / Boss]
[Fonction]
[Nom de l'entreprise]`,
  },
  {
    id: "entretien_annuel",
    title: "Convocation à l'entretien annuel",
    category: "RH & Juridique",
    badge: "Évaluation RH",
    description: "Fixer le rendez-vous du bilan de fin d'année ou d'évaluation avec un salarié.",
    defaultSubject: "Convocation — Entretien annuel d'évaluation [Année] — [Nom du salarié]",
    defaultRecipient: "[Nom et Prénom du salarié]\n[Intitulé du poste]\n[Service]",
    text: `[Nom et Prénom du salarié]
[Intitulé du poste]

À [Nom de la ville], le [Date du jour]

OBJET : Convocation à l'entretien annuel d'évaluation [Année]

Madame, Monsieur,

L'entretien annuel d'évaluation est un rendez-vous privilégié dans l'entreprise pour dresser le bilan de l'année écoulée, mesurer l'atteinte de vos objectifs et définir vos perspectives d'évolution pour l'année à venir.

Afin de mener à bien cet échange, nous avons le plaisir de vous convoquer à votre entretien annuel d'évaluation :

• Date : [Date de l'entretien]
• Horaires : De [Heure de début] à [Heure de fin]
• Lieu : [Salle de réunion / Bureau / Visioconférence]
• Évaluateur : [Nom et Fonction du responsable]

Vous trouverez ci-joint le formulaire d'auto-évaluation à préparer en amont de notre rendez-vous. Merci de bien vouloir le renseigner d'ici le [Date limite de retour].

Dans l'attente de notre entretien, veuillez agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

[Nom du Responsable / Direction RH]
[Fonction]
[Nom de l'entreprise]`,
  },
  {
    id: "conges",
    title: "Validation ou refus de congés",
    category: "RH & Juridique",
    badge: "Administration RH",
    description: "Donner l'accord ou le refus officiel suite à la demande de vacances d'un employé.",
    defaultSubject: "Notification officielle — Demande de congés du [Date début] au [Date fin]",
    defaultRecipient: "[Nom et Prénom du salarié]\n[Poste du salarié]\n[Service]",
    text: `[Nom et Prénom du salarié]
[Intitulé du poste]

À [Nom de la ville], le [Date du jour]

OBJET : Notification relative à votre demande de congés payés

Madame, Monsieur,

Suite à votre demande de congés transmise le [Date de la demande] pour la période du [Date de début] au [Date de fin inclus] (représentant [Nombre] jours ouvrés), nous vous notifions la décision de la direction :

[X] ACCORD : Votre demande de congés payés est OFFICIELLEMENT VALIDÉE.
(Nous vous remercions de veiller à transmettre vos dossiers en cours à [Nom du collègue référent] avant votre départ).

[ ] REFUS : Votre demande ne peut malheureusement pas être acceptée.
Motif : [Explication motivée : nécessité de service / forte charge opérationnelle / quota d'absences simultanées atteint]. Nous vous invitons à soumettre de nouvelles dates.

Nous restons à votre disposition pour tout renseignement complémentaire.

Cordialement,

[Nom du Responsable RH / Boss]
[Fonction]
[Nom de l'entreprise]`,
  },
  {
    id: "resultats",
    title: "Annonce des résultats de l'entreprise",
    category: "Communication",
    badge: "Stratégie",
    description: "Partager les chiffres, les bénéfices et la stratégie future de la société avec l'équipe.",
    defaultSubject: "Bilan et résultats stratégiques de l'entreprise — [Trimestre / Année]",
    defaultRecipient: "À l'ensemble des collaborateurs\n[Nom de l'entreprise]",
    text: `Chers collaborateurs, Chères équipes,

Je tenais à partager avec l'ensemble des membres de notre entreprise les résultats financiers et opérationnels relatifs à la période [Période concernée : T1 / Semestre / Année].

📊 CHIFFRES CLÉS ET BILAN DE PERFORMANCE :
• Chiffre d'affaires réalisé : [Montant] € (soit une progression de +[X]% vs période précédente).
• Nombre de nouveaux clients / partenariats signés : [Nombre].
• Taux de réussite des projets stratégiques : [Pourcentage]%.

🚀 ORIENTATIONS STRATÉGIQUES FUTURES :
Pour la période à venir, nos efforts se concentreront sur trois priorités fondamentales :
1. [Axe stratégique 1 : ex. Expansion commerciale / Innovation produit]
2. [Axe stratégique 2 : ex. Optimisation des processus et qualité]
3. [Axe stratégique 3 : ex. Renforcement de la marque employeur]

Ces résultats positifs sont le résultat direct de l'implication de chacune et chacun d'entre vous.

Une réunion générale d'information (Town Hall) se tiendra le [Date et Heure] en salle [Nom de la salle / Visioconférence] pour approfondir ces chiffres et échanger ensemble.

Merci à toutes et à tous pour votre fidélité et votre détermination.

Bien cordialement,

[Nom du Dirigeant / Boss]
[Président / Directeur Général]
[Nom de l'entreprise]`,
  },
  {
    id: "crise",
    title: "Gestion de crise et consignes urgentes",
    category: "Urgence & Crise",
    badge: "Urgent",
    description: "Informer les équipes d'un problème urgent et donner les consignes de sécurité ou d'organisation.",
    defaultSubject: "[URGENT] Consignes de sécurité et gestion de crise — [Nature de la crise]",
    defaultRecipient: "DIFFUSION URGENTE À L'ENSEMBLE DU PERSONNEL\n[Nom de l'entreprise]",
    text: `MESSAGE URGENT — DIRECTION DE L'ENTREPRISE

À [Nom de la ville], le [Date du jour] à [Heure]

OBJET : Incident critique / Directives immédiates de sécurité et d'organisation

Chers collaborateurs,

En raison de [Préciser la nature exacte de l'incident : panne informatique majeure / alerte sécurité / sinistre technique / événement sanitaire], la direction active immédiatement le plan de gestion de crise d'entreprise.

CONSIGNES DE SÉCURITÉ ET D'ORGANISATION À RESPECTER IMMÉDIATEMENT :

1. Organisation du travail :
   • [Consigne n°1 : ex. Télétravail généralisé obligatoire / Évacuation immédiate des locaux / Interdiction d'accès aux serveurs].

2. Continuité des services essentiels :
   • [Consigne n°2 : ex. Bascule sur la messagerie de secours / Reporter les rendez-vous extérieurs].

3. Contacts d'urgence et référents :
   • Cellule de crise technique : [Nom et N° téléphone d'urgence]
   • Coordination RH & Santé : [Nom et N° téléphone / Email]

Une cellule de suivi permanente est en place. Une nouvelle communication d'étape vous sera adressée aujourd'hui à [Heure du prochain point].

Merci d'appliquer scrupuleusement ces consignes et d'en accuser réception auprès de vos managers respectifs.

La Direction,

[Nom du Responsable de Crise / Boss]
[Fonction]
[Nom de l'entreprise]`,
  },
  {
    id: "partenariat",
    title: "Demande de partenariat institutionnel",
    category: "Partenariat & Institution",
    badge: "Institutionnel",
    description: "Document/Email officiel adressé à une autre institution pour proposer une collaboration ou convention.",
    defaultSubject: "Proposition de partenariat et collaboration institutionnelle — [Nom de votre organisation]",
    defaultRecipient: "À Monsieur/Madame le Directeur / Président\n[Nom de l'Institution Cible]\n[Adresse / Ville]",
    text: `À l'attention de Monsieur/Madame le Directeur / Président
[Nom de l'Institution / Organisme Cible]
[Adresse de l'institution cible]

À [Nom de la ville], le [Date du jour]

OBJET : Proposition de partenariat et collaboration stratégique

Monsieur le Directeur / Madame la Présidente,

C'est avec un grand intérêt pour vos actions et vos réalisations institutionnelles que je m'adresse à vous au nom de [Nom de votre entreprise / organisation].

Acteur engagé dans le secteur de [Préciser le secteur d'activité : éducation, technologie, santé, développement économique], notre structure développe des initiatives visant à [Décrire la vision/mission de votre organisation].

Au vu des synergies évidentes entre nos missions respectives et l'expertise de [Nom de l'institution cible], nous souhaiterions vous proposer l'établissement d'un partenariat stratégique axé sur :

1. [Axe de collaboration n°1 : ex. Co-organisation de programmes et événements]
2. [Axe de collaboration n°2 : ex. Développement de projets de recherche / formation conjointe]
3. [Axe de collaboration n°3 : ex. Partage de ressources et synergies opérationnelles]

Un tel partenariat permettrait à nos deux institutions d'amplifier l'impact de leurs actions au bénéfice de [Préciser les bénéficiaires : usagers, étudiants, clients, citoyens].

Afin de vous présenter plus en détail les modalités envisagées et d'échanger sur les opportunités d'une convention d'accord (MOU), nous serions honorés de vous rencontrer lors d'un entretien, à votre convenance, dans vos locaux ou par visioconférence.

Dans l'attente de votre retour, nous vous prions d'agréer, Monsieur le Directeur / Madame la Présidente, l'expression de notre très haute considération.

[Nom du Dirigeant / Boss]
[Fonction : Président / Directeur Général]
[Nom de votre entreprise / institution]`,
  },
  {
    id: "remerciement_autorite",
    title: "Remerciements officiels à une autorité",
    category: "Partenariat & Institution",
    badge: "Officiel",
    description: "Lettre/Email officiel pour remercier un ministre, maire, préfet ou responsable institutionnel.",
    defaultSubject: "Remerciements officiels — [Objet de l'événement / soutien accordé]",
    defaultRecipient: "À Monsieur/Madame [Titre officiel : le Maire / le Préfet / le Ministre]\n[Nom de l'Institution]\n[Adresse officielle]",
    text: `À l'attention de Monsieur / Madame [Titre officiel : le Maire / le Préfet / le Directeur Régional]
[Nom du Ministère / Mairie / Préfecture / Institution]
[Adresse officielle]

À [Nom de la ville], le [Date du jour]

OBJET : Lettre de remerciements officiels

Monsieur [le Maire / le Préfet / le Directeur], / Madame [la Maire / la Préfète / la Directrice],

Au nom de l'ensemble de la direction et des équipes de [Nom de votre entreprise / organisation], je tiens à vous adresser nos plus sincères et chaleureux remerciements pour [Préciser l'objet : votre présence à l'inauguration / l'accord de la subvention / votre soutien déterminant dans le projet XYZ].

Votre engagement et l'attention que vous avez portée à notre initiative témoignent de votre volonté constante d'encourager [Préciser la cause : le développement économique local, l'innovation, l'emploi].

Grâce à cet appui institutionnel précieux, notre structure a pu :
• [Résultat ou concrétisation n°1 : ex. Poser la première pierre de nos nouveaux locaux]
• [Résultat ou concrétisation n°2 : ex. Sécuriser les emplois créés dans le territoire]

Soyez assuré(e) que nous restons pleinement mobilisés pour poursuivre le développement de nos activités dans le respect des valeurs d'excellence et de service que nous partageons.

En vous renouvelant l'hommage de nos remerciements les plus respectueux, nous vous prions d'agréer, Monsieur / Madame [Titre officiel], l'expression de notre très haute considération.

[Nom du Dirigeant / Boss]
[Fonction : Président / Directeur Général]
[Nom de l'entreprise / organisation]`,
  },
];
