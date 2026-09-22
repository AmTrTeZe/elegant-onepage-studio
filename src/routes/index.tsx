import { createFileRoute } from "@tanstack/react-router";
import { FormEvent, useEffect, useRef, useState } from "react";
import ConsentManager from "@/components/ConsentManager";

type FieldName = "firstName" | "lastName" | "company" | "email" | "message";
type FieldErrors = Partial<Record<FieldName, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(fields: Record<FieldName, string>): FieldErrors {
  const errors: FieldErrors = {};
  if (!fields.firstName.trim()) errors.firstName = "Merci d’indiquer votre prénom.";
  if (!fields.lastName.trim()) errors.lastName = "Merci d’indiquer votre nom.";
  if (!fields.company.trim()) errors.company = "Merci d’indiquer le nom de votre entreprise.";
  if (!EMAIL_PATTERN.test(fields.email.trim()))
    errors.email = "Merci d’indiquer une adresse e-mail valide.";
  if (!fields.message.trim()) errors.message = "Merci de préciser l’objet de votre demande.";
  return errors;
}

const FR_DESCRIPTION =
  "TRADEMARK aide les entreprises technologiques B2B à ouvrir de nouveaux marchés internationaux : qualification, relais locaux et accès aux décideurs.";
const FR_OG_DESCRIPTION =
  "TRADEMARK ouvre l'accès à des marchés internationaux à fort potentiel pour des entreprises technologiques B2B : qualification, relais locaux et accès aux décideurs.";
const FR_OG_TITLE = "Et si vos angles morts devenaient des relais de croissance ?";

const FR_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.tmrk.fr/#organization",
      name: "TRADEMARK",
      url: "https://www.tmrk.fr/",
      email: "contact@tmrk.fr",
      logo: "https://www.tmrk.fr/logo-512.png",
      description:
        "Cabinet spécialisé dans l’introduction de technologies B2B à fort impact sur des marchés internationaux à haut potentiel.",
      areaServed: "Worldwide",
      knowsLanguage: ["fr", "en"],
      address: [
        {
          "@type": "PostalAddress",
          streetAddress: "134-136 boulevard Brune",
          postalCode: "75014",
          addressLocality: "Paris",
          addressCountry: "FR",
        },
        {
          "@type": "PostalAddress",
          streetAddress: "Appartement n°4, Résidence Hamza, Quartier Palmier",
          postalCode: "20340",
          addressLocality: "Casablanca",
          addressCountry: "MA",
        },
        {
          "@type": "PostalAddress",
          streetAddress: "II Plateaux Vallon, villa lot 522, parcelle 222, Cocody",
          addressLocality: "Abidjan",
          addressCountry: "CI",
        },
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://www.tmrk.fr/#website",
      url: "https://www.tmrk.fr/",
      name: "TRADEMARK",
      alternateName: "tmrk.fr",
      inLanguage: "fr-FR",
      publisher: { "@id": "https://www.tmrk.fr/#organization" },
    },
  ],
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Accès aux marchés internationaux | Technologies B2B | TRADEMARK" },
      { name: "description", content: FR_DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "TRADEMARK" },
      { property: "og:locale", content: "fr_FR" },
      { property: "og:locale:alternate", content: "en_GB" },
      { property: "og:url", content: "https://www.tmrk.fr/" },
      { property: "og:title", content: FR_OG_TITLE },
      { property: "og:description", content: FR_OG_DESCRIPTION },
      { property: "og:image", content: "https://www.tmrk.fr/og-fr.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: `TRADEMARK — ${FR_OG_TITLE}` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: FR_OG_TITLE },
      { name: "twitter:description", content: FR_OG_DESCRIPTION },
      { name: "twitter:image", content: "https://www.tmrk.fr/og-fr.png" },
    ],
    links: [{ rel: "canonical", href: "https://www.tmrk.fr/" }],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(FR_JSON_LD) },
    ],
  }),
  component: Index,
});

const criteria = [
  ["01", "Éprouvée", "Des solutions déjà déployées, avec des références clients vérifiables."],
  ["02", "Forte valeur d’usage", "Une réponse directe à une friction opérationnelle identifiée."],
  ["03", "Rapidement déployable", "Une mise en service qui se compte en semaines, pas en années."],
  ["04", "Plug & play", "Une intégration légère, sans refonte du système existant."],
  ["05", "Agnostique", "Compatible avec les environnements techniques déjà en place."],
  ["06", "ROI démontrable", "Un retour sur investissement mesurable en quelques mois."],
];

function SectionHeader({ number, title, side }: { number: string; title: string; side: string }) {
  return (
    <div className="section-header" data-reveal="label">
      <span>{number} — {title}</span>
      <span>{side}</span>
    </div>
  );
}

function Index() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const items = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    // Cascade par section : l'ordre local sert de décalage d'apparition.
    const counters = new Map<Element, number>();
    items.forEach((item) => {
      const panel = item.closest(".panel") ?? document.body;
      const index = counters.get(panel) ?? 0;
      counters.set(panel, index + 1);
      item.style.setProperty("--stagger", `${Math.min(index, 5) * 110}ms`);
    });

    const introFooter = document.querySelector<HTMLElement>(".intro-footer");

    // Section APPROCHE : le défilement est suspendu le temps que les six
    // critères finissent de se mettre en place, pour ne pas couper la cascade.
    const approche = document.getElementById("approche");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let approcheLocked = false;
    let approcheDone = reduceMotion;
    let unlockTimer: ReturnType<typeof setTimeout> | undefined;
    // On ne bloque que la descente vers RÉSEAU : remonter reste possible.
    const blockDown = (event: WheelEvent) => {
      if (event.deltaY > 0) event.preventDefault();
    };
    const blockTouch = (event: Event) => event.preventDefault();
    const blockKeys = (event: KeyboardEvent) => {
      const keys = ["ArrowDown", "PageDown", "End", " ", "Spacebar"];
      if (keys.includes(event.key)) event.preventDefault();
    };
    const releaseApproche = () => {
      if (!approcheLocked) return;
      approcheLocked = false;
      window.removeEventListener("wheel", blockDown);
      window.removeEventListener("touchmove", blockTouch);
      window.removeEventListener("keydown", blockKeys);
    };
    // Section RÉSEAU : même principe — une fois la section calée en haut,
    // la descente vers INTERVENTION est suspendue le temps que les trois
    // leviers finissent de se placer. Remonter reste possible.
    const reseau = document.getElementById("reseau");
    let reseauLocked = false;
    let reseauDone = reduceMotion;
    let reseauUnlockTimer: ReturnType<typeof setTimeout> | undefined;
    const releaseReseau = () => {
      if (!reseauLocked) return;
      reseauLocked = false;
      window.removeEventListener("wheel", blockDown);
      window.removeEventListener("touchmove", blockTouch);
      window.removeEventListener("keydown", blockKeys);
    };
    const holdReseau = () => {
      if (reseauDone || reseauLocked) return;
      reseauDone = true;
      reseauLocked = true;
      window.addEventListener("wheel", blockDown, { passive: false });
      window.addEventListener("touchmove", blockTouch, { passive: false });
      window.addEventListener("keydown", blockKeys);
      reseau
        ?.querySelectorAll<HTMLElement>("[data-reveal]")
        .forEach((el) => el.classList.add("is-visible"));
      // Dernier levier (700ms) + son animation (1100ms).
      reseauUnlockTimer = setTimeout(releaseReseau, 1900);
    };

    const holdApproche = () => {
      if (approcheDone || approcheLocked) return;
      approcheDone = true;
      approcheLocked = true;
      window.addEventListener("wheel", blockDown, { passive: false });
      window.addEventListener("touchmove", blockTouch, { passive: false });
      window.addEventListener("keydown", blockKeys);
      // Les blocs de la section sont révélés immédiatement pendant le maintien.
      approche
        ?.querySelectorAll<HTMLElement>("[data-reveal]")
        .forEach((el) => el.classList.add("is-visible"));
      // Durée de la cascade : dernier critère (1750ms) + son animation (1100ms).
      unlockTimer = setTimeout(releaseApproche, 2950);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const target = entry.target as HTMLElement;
          target.classList.add("is-visible");
          // Le bloc « TRADEMARK est un cabinet… » suit la fin de l'animation
          // du grand titre : il est révélé en même temps que le titre.
          if (target.classList.contains("display-sweep") && introFooter) {
            introFooter.classList.add("is-visible");
          }
          observer.unobserve(entry.target);
        });
      },
      // On déclenche seulement quand l'élément entre réellement dans l'écran.
      { threshold: 0.01, rootMargin: "-90px 0px -12% 0px" },
    );
    items.forEach((item) => {
      if (item !== introFooter) observer.observe(item);
    });

    // Une section courte est prête lorsqu'elle est calée en haut. Une section
    // plus haute que l'écran doit d'abord défiler jusqu'à son bas : le maintien
    // ne peut donc pas masquer sa dernière partie.
    const isReadingEdgeReached = (panel: HTMLElement) => {
      const rect = panel.getBoundingClientRect();
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
      return panel.offsetHeight > viewportHeight + 2
        ? rect.bottom <= viewportHeight + 2
        : rect.top <= 2;
    };
    const watchApproche = () => {
      if (approcheDone || !approche) return;
      if (isReadingEdgeReached(approche)) holdApproche();
    };
    const watchReseau = () => {
      if (reseauDone || !reseau) return;
      if (isReadingEdgeReached(reseau)) holdReseau();
    };
    window.addEventListener("scroll", watchApproche, { passive: true });
    watchApproche();
    window.addEventListener("scroll", watchReseau, { passive: true });
    watchReseau();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", watchApproche);
      window.removeEventListener("scroll", watchReseau);
      if (unlockTimer !== undefined) clearTimeout(unlockTimer);
      if (reseauUnlockTimer !== undefined) clearTimeout(reseauUnlockTimer);
      releaseApproche();
      releaseReseau();
    };
  }, []);

  useEffect(() => {
    const header = document.querySelector<HTMLElement>(".site-header");
    if (!header) return;
    const panels = Array.from(document.querySelectorAll<HTMLElement>(".panel"));
    const desktop = window.matchMedia("(min-width: 761px)");

    // Position naturelle de chaque section dans le document : les sections
    // étant collantes, offsetTop suit la position figée et devient inutilisable.
    const naturalTops = new Map<HTMLElement, number>();
    const measure = () => {
      let cursor = 0;
      panels.forEach((panel) => {
        naturalTops.set(panel, cursor);
        const gap = parseFloat(getComputedStyle(panel).marginBottom) || 0;
        cursor += panel.offsetHeight + gap;
      });
    };

    // Cale chaque section : une section plus haute que l'écran ne se fige
    // qu'une fois son bas atteint, pour être lue en entier avant d'être recouverte.
    let calibrationFrame: number | undefined;
    const calibrate = () => {
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
      panels.forEach((panel) => {
        if (!desktop.matches) {
          panel.style.top = "";
          return;
        }
        panel.style.top = `${Math.min(0, viewportHeight - panel.offsetHeight)}px`;
      });
      measure();
    };
    const scheduleCalibration = () => {
      if (calibrationFrame !== undefined) cancelAnimationFrame(calibrationFrame);
      calibrationFrame = requestAnimationFrame(() => {
        calibrate();
        sync();
        calibrationFrame = undefined;
      });
    };

    const sync = () => {
      const headerH = header.offsetHeight;
      let theme: "light" | "dark" = "light";
      for (const panel of panels) {
        if (panel.getBoundingClientRect().top <= headerH + 1) {
          theme = panel.classList.contains("panel-dark") ? "dark" : "light";
        }
      }
      header.dataset["theme"] = theme;
    };
    // Le saut d'ancre natif visait une position déjà figée : on utilise la
    // position naturelle mesurée de la section visée, dans les deux sens.
    // Rapprochement du contenu sous le menu à l'arrivée (ordinateur uniquement).
    const arrivalOffset: Record<string, number> = { approche: 20, reseau: 20, intervention: 20 };
    const destinationOf = (target: HTMLElement) => {
      const base = naturalTops.get(target) ?? target.offsetTop;
      const limit = document.documentElement.scrollHeight - window.innerHeight;
      const offset = desktop.matches ? (arrivalOffset[target.id] ?? 0) : 0;
      return Math.max(0, Math.min(limit, base + offset - (desktop.matches ? 0 : header.offsetHeight)));
    };
    let scrollFrame: number | undefined;
    const scrollToTarget = (top: number) => {
      if (scrollFrame !== undefined) cancelAnimationFrame(scrollFrame);
      const start = window.scrollY;
      const distance = top - start;
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const duration = reduceMotion ? 0 : Math.min(1100, Math.max(650, Math.abs(distance) * 0.22));
      const previousBehavior = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = "auto";

      if (duration === 0) {
        window.scrollTo(0, top);
        document.documentElement.style.scrollBehavior = previousBehavior;
        return;
      }

      const startedAt = performance.now();
      const step = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / duration);
        const eased = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        window.scrollTo(0, start + distance * eased);
        if (progress < 1) {
          scrollFrame = requestAnimationFrame(step);
          return;
        }
        window.scrollTo(0, top);
        scrollFrame = undefined;
        document.documentElement.style.scrollBehavior = previousBehavior;
      };
      scrollFrame = requestAnimationFrame(step);
    };
    const onAnchorClick = (event: MouseEvent) => {
      const link = (event.target as HTMLElement | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey) return;
      const href = link.getAttribute("href");
      if (!href) return;
      const id = href.slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      event.preventDefault();
      // Un seul trajet contrôlé évite l'arrêt du défilement natif entre deux
      // panneaux collants lors d'un retour depuis une section plus basse.
      scrollToTarget(destinationOf(target));
      history.replaceState(null, "", `#${id}`);
    };



    calibrate();
    sync();
    const resizeObserver = new ResizeObserver(scheduleCalibration);
    panels.forEach((panel) => resizeObserver.observe(panel));
    document.fonts?.ready.then(scheduleCalibration).catch(() => undefined);
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", scheduleCalibration);
    window.visualViewport?.addEventListener("resize", scheduleCalibration);
    document.addEventListener("click", onAnchorClick);
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", scheduleCalibration);
      window.visualViewport?.removeEventListener("resize", scheduleCalibration);
      document.removeEventListener("click", onAnchorClick);
      resizeObserver.disconnect();
      if (calibrationFrame !== undefined) cancelAnimationFrame(calibrationFrame);
      if (scrollFrame !== undefined) cancelAnimationFrame(scrollFrame);
    };
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const fields: Record<FieldName, string> = {
      firstName: String(data.get("firstName") ?? ""),
      lastName: String(data.get("lastName") ?? ""),
      company: String(data.get("company") ?? ""),
      email: String(data.get("email") ?? ""),
      message: String(data.get("message") ?? ""),
    };
    const found = validate(fields);
    setErrors(found);
    setSubmitError(null);
    if (Object.keys(found).length > 0) return;

    setSending(true);
    try {
      const response = await fetch("/contact.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, telephone: String(data.get("telephone") ?? "") }),
      });
      const result = (await response.json()) as {
        ok: boolean;
        message: string;
        errors?: FieldErrors;
      };
      if (result.ok) {
        form.reset();
        setErrors({});
        setSent(true);
        return;
      }
      if (result.errors) setErrors(result.errors);
      setSubmitError(result.message);
    } catch {
      setSubmitError(
        "Une erreur est survenue lors de l’envoi. Merci de réessayer dans quelques instants.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#introduction" aria-label="TRADEMARK — accueil">TRADEMARK</a>
        <nav aria-label="Navigation principale">
          <a href="#approche">Approche</a>
          <a href="#reseau">Réseau</a>
          <a href="#intervention">Intervention</a>
          <a href="#contact">Contact</a>
          <span className="language-switch">
            <a className="language-link is-active" href="/" aria-current="page">FR</a>
            <span aria-hidden="true">/</span>
            <a className="language-link" href="/en/" hrefLang="en" aria-label="English version">EN</a>
          </span>
        </nav>
      </header>

      <section className="panel panel-light intro" id="introduction">
        <div className="page-shell">
          <SectionHeader number="01" title="Introduction" side="Bureaux · Paris · Casablanca · Abidjan" />
          <h1 className="display display-intro display-sweep" data-reveal="title">
            <span>Et si vos angles</span><span>morts devenaient</span><span>des relais de</span><span>croissance ?</span>
          </h1>
          <div className="intro-footer" data-reveal="body">
            <p>TRADEMARK est un cabinet spécialisé dans l’introduction de technologies à fort impact sur des marchés internationaux à haut potentiel, au-delà des géographies directement couvertes par leurs éditeurs.</p>
            <a className="text-link" href="#contact">Parlons-en <span aria-hidden="true">→</span></a>
          </div>
        </div>
      </section>

      <section className="panel panel-dark" id="contexte">
        <div className="page-shell">
          <SectionHeader number="02" title="Contexte" side="Le constat" />
           <h2 className="display display-section" data-reveal="title"><span>La croissance</span><span>impose des choix.</span></h2>
           <div className="two-cols body-copy" data-reveal="body">
            <p>Pour les startups technologiques, la croissance impose des choix. Dans un environnement où les financements sont plus exigeants et la trajectoire vers la rentabilité davantage scrutée, les ressources se concentrent naturellement sur quelques marchés prioritaires capables de soutenir rapidement le passage à l’échelle.</p>
            <p>Cette discipline est nécessaire. Mais elle laisse aussi de côté des marchés où les besoins existent, où le potentiel commercial est réel et que les équipes internes ne peuvent raisonnablement adresser sans présence, réseau ou relais local.</p>
          </div>
           <p className="closing-line" data-reveal="lead">C’est précisément là que <strong>TRADEMARK</strong> intervient.</p>
        </div>
      </section>

      <section className="panel panel-light" id="approche">
        <div className="page-shell">
          <SectionHeader number="03" title="Approche" side="Méthode" />
           <h2 className="display display-section" data-reveal="title"><span>Partir du besoin, pas</span><span>de la technologie</span></h2>
           <div className="two-cols body-copy approach-copy" data-reveal="body">
            <p>Notre ADN de cabinet indépendant spécialisé en stratégie d’innovation et en performance des organisations structure notre approche : nous partons des frictions opérationnelles rencontrées par les entreprises locales pour identifier les technologies capables de réellement les résoudre.</p>
            <p>Cette exigence nous permet de concentrer nos efforts sur les technologies dont la proposition de valeur répond à un besoin concret et dont l’impact peut être rapidement démontré.</p>
          </div>
           <p className="micro-title" data-reveal="label">Nos critères de sélection</p>
          <div className="criteria-grid">
            {criteria.map(([number, title, copy]) => (
               <article className="criterion" data-reveal="item" key={number}>
                <span>{number}</span><h3>{title}</h3><p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="panel panel-light" id="reseau">
        <div className="page-shell">
          <SectionHeader number="04" title="Réseau" side="Accès aux décideurs" />
           <h2 className="display display-section" data-reveal="title"><span>Ouvrir de</span><span>nouveaux marchés</span></h2>
           <div className="network-copy" data-reveal="body">
            <p className="lead">Pénétrer un nouveau marché exige plus qu’une démarche commerciale : il faut en comprendre les acteurs, les circuits de décision et disposer des bons relais.</p>
            <div className="body-copy"><p>L’expérience de nos équipes au sein de grands réseaux internationaux de conseil et de communication nous a permis de constituer, dans plusieurs pays, un réseau de contacts et de relais locaux de confiance, profondément ancrés dans leurs écosystèmes économiques.</p><p>Ces relais nous donnent accès aux bons niveaux de décision des entreprises leaders, nous aident à qualifier les enjeux locaux et nous permettent d’identifier plus rapidement les opportunités pertinentes, en organisant des introductions auprès des directions générales, technologiques et opérationnelles concernées.</p></div>
          </div>
           <p className="micro-title" data-reveal="label">Trois leviers combinés</p>
          <div className="lever-grid">
             <article data-reveal="item"><h3>Compréhension<br />du marché</h3></article>
             <article data-reveal="item"><h3>Relais<br />locaux</h3></article>
             <article data-reveal="item"><h3>Accès aux<br />décideurs</h3></article>
          </div>
        </div>
      </section>

      <section className="panel panel-dark" id="intervention">
        <div className="page-shell">
          <SectionHeader number="05" title="Intervention" side="Périmètre" />
           <h2 className="display display-section" data-reveal="title"><span>Relais locaux pour</span><span>technologies globales</span></h2>
           <p className="intervention-intro body-copy" data-reveal="body">TRADEMARK permet aux entreprises technologiques d’aborder des marchés qu’elles ne pourraient pas nécessairement adresser avec leurs seules équipes, sans engager en amont les coûts de prospection, de réseau et de présence locale qu’exigerait une approche directe.</p>
           <div className="scope-grid" data-reveal="item">
            <div><p className="micro-title">Ce que nous prenons en charge</p><ul><li>Identification des opportunités</li><li>Qualification des comptes</li><li>Accès aux décideurs</li><li>Organisation des introductions</li></ul></div>
            <div className="muted-scope"><p className="micro-title">Ce qui vous revient</p><ul><li>Modèle de déploiement</li><li>Contractualisation</li><li>Déploiement et support</li><li>Développement du marché</li></ul></div>
          </div>
           <p className="closing-line" data-reveal="lead">Notre rôle s’arrête là où commence celui de l’éditeur.</p>
        </div>
      </section>

      <section className="panel panel-light contact" id="contact">
        <div className="page-shell">
          <SectionHeader number="06" title="Contact" side="Bureaux · Paris · Casablanca · Abidjan" />
           <p className="contact-lead" data-reveal="lead">Vous développez une technologie éprouvée, à ROI rapide, et certains marchés<br className="desktop-break" /> restent hors de vos priorités immédiates ?</p>
           <h2 className="display contact-title" data-reveal="title">Parlons-en.</h2>
          <div className="contact-grid">
             <aside className="offices" data-reveal="body">
              <h3 className="micro-title">Nos bureaux</h3>
              <h3>Paris</h3><p>134-136 boulevard Brune<br />75014 Paris</p>
              <h3>Casablanca</h3><p>Appartement n°4, Résidence Hamza<br />Quartier Palmier — 20340</p>
              <h3>Abidjan</h3><p>II Plateaux Vallon, villa lot 522<br />parcelle 222, Cocody</p>
              <a href="mailto:contact@tmrk.fr">contact@tmrk.fr</a>
            </aside>
              <form ref={formRef} onSubmit={submit} data-reveal="body" noValidate>
              <p className="micro-title">Écrivez-nous</p>
              {sent ? (
                <div className="form-thanks" role="status">
                  <p className="form-thanks-title">Merci, nous revenons vers vous rapidement.</p>
                  <p>Votre message a bien été transmis. Notre équipe en prendra connaissance avec attention.</p>
                </div>
              ) : (
                <>
                  <div className="form-grid">
                    <label htmlFor="fr-firstName">Prénom<input id="fr-firstName" name="firstName" type="text" autoComplete="given-name" maxLength={100} />{errors.firstName && <span className="field-error">{errors.firstName}</span>}</label>
                    <label htmlFor="fr-lastName">Nom<input id="fr-lastName" name="lastName" type="text" autoComplete="family-name" maxLength={100} />{errors.lastName && <span className="field-error">{errors.lastName}</span>}</label>
                    <label htmlFor="fr-company">Entreprise<input id="fr-company" name="company" type="text" autoComplete="organization" maxLength={100} />{errors.company && <span className="field-error">{errors.company}</span>}</label>
                    <label htmlFor="fr-email">E-mail<input id="fr-email" type="email" name="email" autoComplete="email" maxLength={255} />{errors.email && <span className="field-error">{errors.email}</span>}</label>
                    <label className="full" htmlFor="fr-message">Objet<textarea id="fr-message" name="message" rows={2} maxLength={2000} />{errors.message && <span className="field-error">{errors.message}</span>}</label>
                    <input className="hp-field" type="text" name="telephone" tabIndex={-1} autoComplete="off" aria-hidden="true" />
                  </div>
                  <button type="submit" disabled={sending}>{sending ? "Envoi en cours…" : "Envoyer"}</button>
                  {submitError && <p className="form-error" role="alert">{submitError}</p>}
                </>
              )}
            </form>
          </div>
          <footer><a className="brand" href="#introduction">TRADEMARK</a><div><span>© 2026</span><span className="language-switch"><a className="language-link is-active" href="/" aria-current="page">FR</a><span aria-hidden="true">/</span><a className="language-link" href="/en/" hrefLang="en">EN</a></span><span>Mentions légales</span><span>Confidentialité</span><button type="button" className="footer-link" onClick={() => window.dispatchEvent(new Event("tmrk:open-consent"))}>Gestion des cookies</button></div></footer>
        </div>
      </section>
      <ConsentManager />
    </main>
  );
}