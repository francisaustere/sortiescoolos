import type { SourceConfig } from "./types";

/*
 * Sources checked as ACTIVE in Nov 2026 (see docs/sources.md for evidence and excluded venues).
 * Formats are NOT verified yet: the build environment could not reach these sites.
 * Most use "auto" (WordPress events API, then JSON-LD). The weekly report shows which ones work.
 */

const MARSEILLE = "Marseille";

export const SOURCES: SourceConfig[] = [
  // ---- Aggregators (wide coverage, must prove the event is local)
  {
    id: "marseille-tourisme", name: "Office de tourisme de Marseille", kind: "auto",
    url: "https://www.marseille-tourisme.com/vivez-marseille-blog/agenda/",
    venueTags: [], requireLocalMatch: true, enabled: true, maxFollow: 120,
    note: "Couvre presque tous les lieux (base Apidae). Source pivot.",
  },
  {
    id: "openagenda-saison-med", name: "OpenAgenda – Saison Méditerranée", kind: "auto",
    url: "https://openagenda.com/fr/saison-mediterranee-2026",
    venueTags: [], requireLocalMatch: true, enabled: true,
  },
  {
    id: "agendaculturel-13", name: "Agenda culturel 13", kind: "auto",
    url: "https://13.agendaculturel.fr/marseille/",
    venueTags: [], requireLocalMatch: true, enabled: true,
  },

  // ---- Tiers-lieux & lieux planqués
  {
    id: "le-talus", name: "Le Talus", kind: "auto", url: "https://www.letalus.com/event-details/programmation",
    venueTags: ["tiers_lieu", "planque", "nature"], defaultCategories: ["fete"],
    defaultVenue: { name: "Le Talus", address: "Marseille 12e", commune: MARSEILLE }, enabled: true,
    note: "Site Wix. Le lieu rétrécit (travaux LNPCA), projet « Talus 2027 » à suivre.",
  },
  {
    id: "la-dar", name: "La Dar (centre social autogéré)", kind: "auto", url: "https://la-dar.org/",
    venueTags: ["tiers_lieu", "planque", "militant"], defaultCategories: ["fete"],
    defaultVenue: { name: "La Dar", address: "127 rue d'Aubagne, 13006 Marseille", commune: MARSEILLE }, enabled: true,
  },
  {
    id: "cite-arts-rue", name: "Cité des arts de la rue", kind: "auto", url: "https://www.lacitedesartsdelarue.net/agenda/",
    venueTags: ["tiers_lieu", "planque"], defaultCategories: ["spectacle"],
    defaultVenue: { name: "Cité des arts de la rue", address: "225 av. des Aygalades, 13015 Marseille", commune: MARSEILLE }, enabled: true,
  },
  {
    id: "friche", name: "Friche la Belle de Mai", kind: "auto", url: "https://www.lafriche.org/agenda/",
    venueTags: ["tiers_lieu"], defaultVenue: { name: "Friche la Belle de Mai", address: "41 rue Jobin, 13003 Marseille", commune: MARSEILLE }, enabled: true,
  },
  {
    id: "couvent-levat", name: "Couvent Levat", kind: "auto", url: "https://le-couvent.org/",
    venueTags: ["tiers_lieu", "planque"], defaultVenue: { name: "Couvent Levat", address: "52 rue Levat, 13003 Marseille", commune: MARSEILLE }, enabled: true,
    note: "Le jardin devient parc municipal au 1er janvier 2027 : gestion en transition.",
  },
  {
    id: "murisserie", name: "La Mûrisserie", kind: "jsonld", url: "https://shotgun.live/fr/venues/la-murisserie",
    venueTags: ["tiers_lieu"], defaultVenue: { name: "La Mûrisserie", address: "Cours Julien, 13006 Marseille", commune: MARSEILLE }, enabled: true,
  },
  {
    id: "hotel-du-nord", name: "Hôtel du Nord (balades habitants)", kind: "auto", url: "https://www.hoteldunord.coop/",
    venueTags: ["planque", "militant"], defaultCategories: ["nature"], requireLocalMatch: false, enabled: true,
  },

  // ---- Concerts, DIY, slam
  {
    id: "embobineuse", name: "L'Embobineuse", kind: "jsonld", url: "https://www.helloasso.com/associations/l-embobineuse",
    followLinks: "a[href*='/evenements/']",
    venueTags: ["planque"], defaultCategories: ["concert"],
    defaultVenue: { name: "L'Embobineuse", address: "11 bd Bouès, 13003 Marseille", commune: MARSEILLE }, enabled: true,
  },
  {
    id: "molotov", name: "Le Molotov / Le Dodu", kind: "custom", url: "https://www.lemolotov.com/",
    venueTags: [], defaultCategories: ["concert"],
    defaultVenue: { name: "Le Molotov", address: "3 place Paul-Cézanne, 13006 Marseille", commune: MARSEILLE }, enabled: true,
  },
  {
    id: "makeda", name: "Le Makeda", kind: "auto", url: "https://www.lemakeda.com/",
    venueTags: [], defaultCategories: ["concert"],
    defaultVenue: { name: "Le Makeda", address: "103 rue Ferrari, 13005 Marseille", commune: MARSEILLE }, enabled: true,
  },
  {
    id: "espace-julien", name: "L'Espace Julien", kind: "auto", url: "https://www.espace-julien.com/",
    venueTags: [], defaultCategories: ["concert"],
    defaultVenue: { name: "L'Espace Julien", address: "39 cours Julien, 13006 Marseille", commune: MARSEILLE }, enabled: true,
  },
  {
    id: "intermediaire", name: "L'Intermédiaire", kind: "jsonld", url: "https://www.songkick.com/venues/727686-lintermediaire",
    venueTags: ["planque"], defaultCategories: ["concert"],
    defaultVenue: { name: "L'Intermédiaire", address: "63 place Jean-Jaurès, 13006 Marseille", commune: MARSEILLE }, enabled: true,
  },
  {
    id: "cabaret-aleatoire", name: "Cabaret Aléatoire", kind: "jsonld", url: "https://shotgun.live/fr/venues/cabaret-aleatoire",
    venueTags: [], defaultCategories: ["fete"],
    defaultVenue: { name: "Cabaret Aléatoire", address: "41 rue Jobin, 13003 Marseille", commune: MARSEILLE }, enabled: true,
  },
  {
    id: "cite-musique", name: "Cité de la Musique", kind: "auto", url: "https://www.citemusique-marseille.com/",
    venueTags: [], defaultCategories: ["concert"],
    defaultVenue: { name: "Cité de la Musique", address: "4 rue Bernard du Bois, 13001 Marseille", commune: MARSEILLE }, enabled: true,
  },
  {
    id: "club-27", name: "Club 27", kind: "auto", url: "https://club27.fr/",
    venueTags: ["planque"], defaultCategories: ["concert"], defaultVenue: { name: "Club 27", commune: MARSEILLE }, enabled: true,
  },

  // ---- Théâtre & spectacles
  {
    id: "les-theatres", name: "Les Théâtres (Bernardines, Gymnase…)", kind: "custom", url: "https://www.lestheatres.net/fr/saison/",
    venueTags: ["institution"], defaultCategories: ["theatre"], requireLocalMatch: true, enabled: true,
  },
  {
    id: "la-criee", name: "Théâtre de La Criée", kind: "auto", url: "https://www.theatre-lacriee.com/",
    venueTags: ["institution"], defaultCategories: ["theatre"],
    defaultVenue: { name: "La Criée (hors les murs pendant travaux)", commune: MARSEILLE }, enabled: true,
  },
  {
    id: "zef", name: "Le ZEF (Merlan, Gare Franche)", kind: "auto", url: "https://www.lezef.org/",
    venueTags: ["institution"], defaultCategories: ["spectacle"], defaultVenue: { name: "Le ZEF", commune: MARSEILLE }, enabled: true,
  },
  {
    id: "actoral", name: "actoral (ex-Montévidéo)", kind: "auto", url: "https://www.actoral.org/",
    venueTags: [], defaultCategories: ["spectacle"], defaultVenue: { name: "actoral", address: "45 rue d'Aubagne, 13006 Marseille", commune: MARSEILLE }, enabled: true,
  },

  // ---- Conférences, idées, militant
  {
    id: "mille-babords", name: "Mille Bâbords", kind: "custom", url: "https://www.millebabords.org/",
    venueTags: ["militant", "planque"], defaultCategories: ["conference"],
    defaultVenue: { name: "Mille Bâbords", address: "61 rue Consolat, 13001 Marseille", commune: MARSEILLE }, enabled: true,
    note: "Lit le bloc agenda de la page d'accueil (SPIP Escal).",
  },
  {
    id: "up-marseille", name: "Université populaire de Marseille", kind: "auto", url: "https://universite-populaire-de-marseille.net/",
    venueTags: ["militant"], defaultCategories: ["conference"], defaultVenue: { name: "Université populaire", commune: MARSEILLE }, enabled: true,
  },
  {
    id: "transit", name: "Librairie Transit", kind: "jsonld", url: "https://www.helloasso.com/associations/librairie-transit",
    followLinks: "a[href*='/evenements/']",
    venueTags: ["militant"], defaultCategories: ["conference"],
    defaultVenue: { name: "Librairie Transit", address: "45 bd de la Libération, 13001 Marseille", commune: MARSEILLE }, enabled: true,
  },
  {
    id: "maupetit", name: "Librairie Maupetit", kind: "auto", url: "https://www.maupetitlibraire.fr/agenda.php",
    venueTags: [], defaultCategories: ["conference"],
    defaultVenue: { name: "Librairie Maupetit", address: "142 La Canebière, 13001 Marseille", commune: MARSEILLE }, enabled: true,
  },
  {
    id: "mucem", name: "Mucem", kind: "auto", url: "https://www.mucem.org/",
    venueTags: ["institution"], defaultVenue: { name: "Mucem", address: "7 promenade Robert-Laffont, 13002 Marseille", commune: MARSEILLE }, enabled: true,
  },
  {
    id: "alcazar", name: "Bibliothèque de l'Alcazar", kind: "auto", url: "https://www.bmvr.marseille.fr/",
    venueTags: ["institution"], defaultCategories: ["conference"],
    defaultVenue: { name: "Bibliothèque de l'Alcazar", address: "58 cours Belsunce, 13001 Marseille", commune: MARSEILLE }, enabled: true,
  },

  // ---- Sciences & sciences sociales
  {
    id: "fete-science", name: "Fête de la science – Marseille", kind: "auto",
    url: "https://www.fetedelascience.fr/festival-des-sciences-de-marseille-2026",
    venueTags: [], defaultCategories: ["sciences"], requireLocalMatch: true, enabled: true,
    note: "Annuel (octobre). Page à mettre à jour chaque année.",
  },

  // ---- Cinéma associatif
  {
    id: "videodrome2", name: "Vidéodrome 2", kind: "custom", url: "https://www.videodrome2.fr/",
    venueTags: ["planque"], defaultCategories: ["cinema"],
    defaultVenue: { name: "Vidéodrome 2", address: "49 cours Julien, 13006 Marseille", commune: MARSEILLE }, enabled: true,
  },
  {
    id: "polygone-etoile", name: "Polygone Étoilé", kind: "auto", url: "https://www.polygone-etoile.com/",
    venueTags: ["planque", "militant"], defaultCategories: ["cinema"],
    defaultVenue: { name: "Polygone Étoilé", address: "1 rue Massabo, 13002 Marseille", commune: MARSEILLE }, enabled: true,
  },

  // ---- Makers
  {
    id: "repair-cafe", name: "Repair Café Marseille", kind: "auto", url: "https://repaircafemarseille.fr/",
    venueTags: ["makers"], defaultCategories: ["makers"], defaultVenue: { name: "Repair Café (lieu variable)", commune: MARSEILLE }, enabled: true,
  },
  {
    id: "make-it-marseille", name: "Make it Marseille", kind: "auto", url: "https://www.makeitmarseille.com/",
    venueTags: ["makers"], defaultCategories: ["makers"], defaultVenue: { name: "Make it Marseille", commune: MARSEILLE }, enabled: true,
  },

  // ---- Nature & sorties originales
  {
    id: "lpo-paca", name: "LPO PACA – sorties nature", kind: "auto",
    url: "https://paca.lpo.fr/sorties-nature/agenda?sorties_nature_departement=13",
    venueTags: ["nature"], defaultCategories: ["nature"], requireLocalMatch: true, enabled: true,
  },
  {
    id: "calanques", name: "Parc national des Calanques", kind: "auto", url: "https://www.calanques-parcnational.fr/fr/agenda",
    venueTags: ["nature"], defaultCategories: ["nature"], defaultVenue: { name: "Parc national des Calanques", commune: MARSEILLE }, enabled: true,
  },
  {
    id: "andromede", name: "Andromède (Observatoire de Marseille)", kind: "auto", url: "https://andromede.id.st/",
    venueTags: ["nature", "planque"], defaultCategories: ["nature"], defaultVenue: { name: "Observatoire de Marseille", commune: MARSEILLE }, enabled: true,
  },
  {
    id: "bureau-guides", name: "Bureau des guides du GR2013", kind: "auto", url: "https://bureaudesguides-gr2013.fr/evenements/",
    venueTags: ["nature", "planque"], defaultCategories: ["nature"], requireLocalMatch: true, enabled: true,
  },

  // ---- Fil Reddit (posts à surveiller, sans date fiable)
  {
    id: "reddit-marseille", name: "r/marseille", kind: "reddit", url: "https://www.reddit.com/r/marseille/new.json?limit=100",
    venueTags: [], enabled: true, note: "Reddit bloque parfois les serveurs GitHub (erreur 403).",
  },
];
