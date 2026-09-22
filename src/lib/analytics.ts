/* Google Analytics (gtag.js) — chargé uniquement après consentement
   « Mesure d'audience » (bandeau cookies), conformément au RGPD / CNIL.
   L'identifiant de mesure est récupéré côté serveur (secret), jamais
   écrit en dur dans le code du navigateur. */

import { getConsent } from "@/components/ConsentManager";

let measurementId = "";
let booted = false;

type GtagFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GtagFn;
  }
}

function loadGtagLibrary() {
  if (document.getElementById("tmrk-ga")) return;
  const script = document.createElement("script");
  script.async = true;
  script.id = "tmrk-ga";
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    anonymize_ip: true,
  });
}

function applyConsent() {
  const allowed = getConsent().mesure;
  // Blocage immédiat de la mesure si le consentement est refusé ou retiré.
  (window as unknown as Record<string, unknown>)[`ga-disable-${measurementId}`] = !allowed;
  if (allowed) loadGtagLibrary();
}

/** À appeler une seule fois, avec l'identifiant de mesure renvoyé par le serveur. */
export function setupAnalytics(id: string) {
  if (!id || booted || typeof window === "undefined") return;
  measurementId = id;
  booted = true;

  // Le stub gtag doit exister avant tout appel (page_view, consentement…).
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || ((...args: unknown[]) => window.dataLayer!.push(args));

  applyConsent();
  window.addEventListener("tmrk:consent", applyConsent);
}

/** Page vue à chaque changement d'URL (navigation FR/EN, ancres). */
export function trackPageView(path: string) {
  if (!booted || typeof window.gtag !== "function") return;
  if (!getConsent().mesure) return;
  window.gtag("event", "page_view", { page_path: path });
}
