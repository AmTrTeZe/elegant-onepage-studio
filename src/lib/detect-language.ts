import { getConsent } from "@/components/ConsentManager";

/* Détection de la langue du navigateur à l'arrivée sur le site :
   français pour les navigateurs francophones, anglais pour toutes les
   autres langues. Le choix explicite fait via le sélecteur FR/EN est
   mémorisé et prime ensuite sur la détection automatique. */

const CHOICE_KEY = "tmrk-lang-choice";

function readChoice(): string | null {
  try {
    return sessionStorage.getItem(CHOICE_KEY) ?? localStorage.getItem(CHOICE_KEY);
  } catch {
    return null;
  }
}

function saveChoice(language: "fr" | "en") {
  try {
    sessionStorage.setItem(CHOICE_KEY, language);
  } catch {
    /* stockage indisponible */
  }
  // Préférence de langue conservée au-delà de la session uniquement
  // si le visiteur a consenti aux cookies de confort de navigation.
  try {
    if (getConsent().fonctionnel) localStorage.setItem(CHOICE_KEY, language);
  } catch {
    /* stockage indisponible */
  }
}

/** À appeler au clic sur le sélecteur FR/EN : mémorise le choix explicite. */
export function rememberLanguageChoice(language: "fr" | "en") {
  saveChoice(language);
}

/** Redirection automatique selon la langue du navigateur (une seule fois, au chargement). */
export function detectAndRedirect() {
  if (typeof window === "undefined") return;
  const { pathname, search, hash } = window.location;
  if (pathname !== "/" && pathname !== "/en") return;
  if (readChoice()) return; // le visiteur a déjà choisi : on respecte son choix

  const languages =
    navigator.languages && navigator.languages.length > 0
      ? navigator.languages
      : [navigator.language || "fr"];
  const french = languages.some((tag) => tag.toLowerCase().startsWith("fr"));

  if (pathname === "/" && !french) {
    window.location.replace(`/en${search}${hash}`);
  } else if (pathname === "/en" && french) {
    window.location.replace(`/${search}${hash}`);
  }
}
