import { useCallback, useEffect, useState } from "react";

/* Gestion des consentements — conforme RGPD / recommandations CNIL :
   refus aussi simple que l'acceptation, choix granulaire, aucun dépôt avant
   consentement, preuve horodatée, durée de validité de 6 mois, retrait possible
   à tout moment. Le choix est conservé côté navigateur (localStorage) et dans un
   cookie de première partie, afin d'être lisible par le serveur (multi-supports). */

export type ConsentCategory = "necessaire" | "mesure" | "fonctionnel" | "marketing";

export type ConsentChoices = Record<ConsentCategory, boolean>;

type ConsentRecord = {
  version: number;
  id: string;
  date: string;
  choices: ConsentChoices;
};

const VERSION = 1;
const STORAGE_KEY = "tmrk-consent";
const COOKIE_NAME = "tmrk_consent";
const VALIDITY_DAYS = 182; // 6 mois

const DEFAULT_CHOICES: ConsentChoices = {
  necessaire: true,
  mesure: false,
  fonctionnel: false,
  marketing: false,
};

const CATEGORIES_FR: {
  key: ConsentCategory;
  title: string;
  description: string;
  locked?: boolean;
}[] = [
  {
    key: "necessaire",
    title: "Strictement nécessaires",
    description:
      "Indispensables au fonctionnement du site et à la sécurité du formulaire de contact. Ils ne peuvent pas être désactivés.",
    locked: true,
  },
  {
    key: "mesure",
    title: "Mesure d’audience",
    description:
      "Statistiques anonymes de fréquentation, destinées à améliorer la lisibilité et la performance du site.",
  },
  {
    key: "fonctionnel",
    title: "Confort de navigation",
    description:
      "Mémorisation de vos préférences d’affichage et de la langue, pour une expérience continue d’une visite à l’autre.",
  },
  {
    key: "marketing",
    title: "Communication & audiences",
    description:
      "Mesure de nos actions de communication et adaptation de nos contenus professionnels. Aucun profilage publicitaire tiers.",
  },
];

const CATEGORIES_EN: typeof CATEGORIES_FR = [
  {
    key: "necessaire",
    title: "Strictly necessary",
    description:
      "Essential to the operation of the website and the security of the contact form. These cookies cannot be disabled.",
    locked: true,
  },
  {
    key: "mesure",
    title: "Audience measurement",
    description:
      "Anonymous visitor statistics used to improve the clarity and performance of the website.",
  },
  {
    key: "fonctionnel",
    title: "Browsing preferences",
    description:
      "Stores your display and language preferences to provide a consistent experience from one visit to the next.",
  },
  {
    key: "marketing",
    title: "Communications & audiences",
    description:
      "Measures the effectiveness of our communications and helps tailor our professional content. No third-party advertising profiling.",
  },
];

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]!) : null;
}

function writeCookie(name: string, value: string) {
  const expires = new Date(Date.now() + VALIDITY_DAYS * 864e5).toUTCString();
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Expires=${expires}; SameSite=Lax${secure}`;
}

function loadRecord(): ConsentRecord | null {
  const raw = localStorage.getItem(STORAGE_KEY) ?? readCookie(COOKIE_NAME);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ConsentRecord;
    if (parsed.version !== VERSION || !parsed.choices || !parsed.date) return null;
    const age = Date.now() - new Date(parsed.date).getTime();
    if (!Number.isFinite(age) || age > VALIDITY_DAYS * 864e5) return null;
    return parsed;
  } catch {
    return null;
  }
}

function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

/** Lecture du consentement en cours (utilisable avant tout chargement de script tiers). */
export function getConsent(): ConsentChoices {
  if (typeof window === "undefined") return DEFAULT_CHOICES;
  return loadRecord()?.choices ?? DEFAULT_CHOICES;
}

export default function ConsentManager({ language = "fr" }: { language?: "fr" | "en" }) {
  const [ready, setReady] = useState(false);
  const [record, setRecord] = useState<ConsentRecord | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [draft, setDraft] = useState<ConsentChoices>(DEFAULT_CHOICES);

  useEffect(() => {
    const existing = loadRecord();
    setRecord(existing);
    setDraft(existing?.choices ?? DEFAULT_CHOICES);
    setReady(true);
    const onOpen = () => {
      const current = loadRecord();
      setDraft(current?.choices ?? DEFAULT_CHOICES);
      setPanelOpen(true);
    };
    window.addEventListener("tmrk:open-consent", onOpen);
    return () => window.removeEventListener("tmrk:open-consent", onOpen);
  }, []);

  const persist = useCallback((choices: ConsentChoices) => {
    const next: ConsentRecord = {
      version: VERSION,
      id: loadRecord()?.id ?? newId(),
      date: new Date().toISOString(),
      choices: { ...choices, necessaire: true },
    };
    const serialised = JSON.stringify(next);
    try {
      localStorage.setItem(STORAGE_KEY, serialised);
    } catch {
      /* stockage indisponible : le cookie fait foi */
    }
    writeCookie(COOKIE_NAME, serialised);
    setRecord(next);
    setPanelOpen(false);
    window.dispatchEvent(new CustomEvent("tmrk:consent", { detail: next }));
    // Archivage de la preuve (facultatif côté serveur, sans blocage de l'interface)
    void fetch("/consent.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: serialised,
      keepalive: true,
    }).catch(() => undefined);
  }, []);

  const acceptAll = () =>
    persist({ necessaire: true, mesure: true, fonctionnel: true, marketing: true });
  const refuseAll = () => persist({ ...DEFAULT_CHOICES });

  if (!ready) return null;

  const bannerVisible = !record && !panelOpen;
  const english = language === "en";
  const categories = english ? CATEGORIES_EN : CATEGORIES_FR;

  return (
    <>
      {bannerVisible && (
        <section className="consent-banner" role="dialog" aria-label={english ? "Cookie management" : "Gestion des cookies"} aria-live="polite">
          <div className="consent-banner-inner">
            <div className="consent-copy">
              <p className="consent-label">{english ? "Privacy" : "Confidentialité"}</p>
              <p className="consent-text">
                {english
                  ? "We use cookies that are strictly necessary for the website to operate and, with your consent, audience measurement and communication cookies. You may accept, reject or choose by category. Your choice is retained for six months and can be changed at any time."
                  : "Nous utilisons des cookies strictement nécessaires au fonctionnement du site et, avec votre accord, des cookies de mesure d’audience et de communication. Vous pouvez accepter, refuser ou choisir catégorie par catégorie. Votre choix est conservé six mois et reste modifiable à tout moment."}
              </p>
            </div>
            <div className="consent-actions">
              <button type="button" className="consent-btn ghost" onClick={() => setPanelOpen(true)}>
                {english ? "Customise" : "Personnaliser"}
              </button>
              <button type="button" className="consent-btn ghost" onClick={refuseAll}>
                {english ? "Reject all" : "Tout refuser"}
              </button>
              <button type="button" className="consent-btn solid" onClick={acceptAll}>
                {english ? "Accept all" : "Tout accepter"}
              </button>
            </div>
          </div>
        </section>
      )}

      {panelOpen && (
        <div className="consent-overlay" role="presentation" onClick={() => setPanelOpen(false)}>
          <div
            className="consent-panel"
            role="dialog"
            aria-modal="true"
            aria-label={english ? "Privacy preferences" : "Préférences de confidentialité"}
            onClick={(event) => event.stopPropagation()}
          >
            <header className="consent-panel-head">
              <p className="consent-label">{english ? "Privacy preferences" : "Préférences de confidentialité"}</p>
              <button
                type="button"
                className="consent-close"
                aria-label={english ? "Close" : "Fermer"}
                onClick={() => setPanelOpen(false)}
              >
                ✕
              </button>
            </header>
            <p className="consent-text">
              {english
                ? "No non-essential cookie is placed before you provide consent. You can withdraw your consent at any time using the ‘Cookie settings’ link at the bottom of the page."
                : "Aucun cookie non essentiel n’est déposé avant votre accord. Vous pouvez retirer votre consentement à tout moment depuis le lien « Gestion des cookies » en bas de page."}
            </p>
            <ul className="consent-list">
              {categories.map((category) => (
                <li key={category.key}>
                  <div className="consent-row">
                    <h3>{category.title}</h3>
                    <label className="consent-switch">
                      <input
                        type="checkbox"
                        checked={category.locked ? true : draft[category.key]}
                        disabled={category.locked}
                        onChange={(event) =>
                          setDraft((previous) => ({ ...previous, [category.key]: event.target.checked }))
                        }
                      />
                      <span aria-hidden="true" />
                      <span className="consent-switch-text">
                        {category.locked
                          ? english ? "Always active" : "Toujours actif"
                          : draft[category.key]
                            ? english ? "Enabled" : "Activé"
                            : english ? "Disabled" : "Désactivé"}
                      </span>
                    </label>
                  </div>
                  <p>{category.description}</p>
                </li>
              ))}
            </ul>
            <div className="consent-actions">
              <button type="button" className="consent-btn ghost" onClick={refuseAll}>
                {english ? "Reject all" : "Tout refuser"}
              </button>
              <button type="button" className="consent-btn ghost" onClick={acceptAll}>
                {english ? "Accept all" : "Tout accepter"}
              </button>
              <button type="button" className="consent-btn solid" onClick={() => persist(draft)}>
                {english ? "Save my choices" : "Enregistrer mes choix"}
              </button>
            </div>
            {record && (
              <p className="consent-proof">
                {english ? "Choice saved on" : "Choix enregistré le"}{" "}
                {new Date(record.date).toLocaleDateString(english ? "en-GB" : "fr-FR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}{" "}
                · {english ? "reference" : "référence"} {record.id.slice(0, 8)}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
