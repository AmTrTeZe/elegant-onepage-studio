import { createFileRoute } from "@tanstack/react-router";
import { FormEvent, useEffect, useRef, useState } from "react";
import ConsentManager from "@/components/ConsentManager";

type FieldName = "firstName" | "lastName" | "company" | "email" | "message";
type FieldErrors = Partial<Record<FieldName, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(fields: Record<FieldName, string>): FieldErrors {
  const errors: FieldErrors = {};
  if (!fields.firstName.trim()) errors.firstName = "Please enter your first name.";
  if (!fields.lastName.trim()) errors.lastName = "Please enter your last name.";
  if (!fields.company.trim()) errors.company = "Please enter your company name.";
  if (!EMAIL_PATTERN.test(fields.email.trim()))
    errors.email = "Please enter a valid email address.";
  if (!fields.message.trim()) errors.message = "Please tell us how we can help.";
  return errors;
}

const EN_DESCRIPTION =
  "TRADEMARK helps B2B tech companies enter high-potential international markets: opportunity qualification, trusted local networks, decision-maker access.";
const EN_OG_DESCRIPTION =
  "TRADEMARK helps proven B2B technologies access high-potential international markets through qualification, trusted local networks and decision-maker access.";
const EN_OG_TITLE = "What if your blind spots became growth engines?";

const EN_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://www.tmrk.fr/#organization",
  name: "TRADEMARK",
  url: "https://www.tmrk.fr/",
  email: "contact@tmrk.fr",
  logo: "https://www.tmrk.fr/logo-512.png",
  description:
    "Firm specialised in bringing high-impact B2B technologies to high-potential international markets.",
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
};

export const Route = createFileRoute("/en")({
  head: () => ({
    meta: [
      { title: "International Market Entry & Access for B2B Tech | TRADEMARK" },
      { name: "description", content: EN_DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "TRADEMARK" },
      { property: "og:locale", content: "en_GB" },
      { property: "og:locale:alternate", content: "fr_FR" },
      { property: "og:url", content: "https://www.tmrk.fr/en/" },
      { property: "og:title", content: EN_OG_TITLE },
      { property: "og:description", content: EN_OG_DESCRIPTION },
      { property: "og:image", content: "https://www.tmrk.fr/og-en.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: `TRADEMARK — ${EN_OG_TITLE}` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: EN_OG_TITLE },
      { name: "twitter:description", content: EN_OG_DESCRIPTION },
      { name: "twitter:image", content: "https://www.tmrk.fr/og-en.png" },
    ],
    links: [{ rel: "canonical", href: "https://www.tmrk.fr/en/" }],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(EN_JSON_LD) },
    ],
  }),
  component: Index,
});

const criteria = [
  ["01", "Proven", "Solutions already deployed, with verifiable client references."],
  ["02", "High practical value", "A direct answer to an identified operational friction."],
  ["03", "Fast to deploy", "Up and running in weeks, not years."],
  ["04", "Plug & play", "Light integration, with no overhaul of existing systems."],
  ["05", "System-agnostic", "Compatible with the technical environments already in place."],
  ["06", "Demonstrable ROI", "A measurable return on investment within months."],
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
        body: JSON.stringify({ ...fields, telephone: String(data.get("telephone") ?? ""), language: "en" }),
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
      if (result.errors) setErrors(validate(fields));
      setSubmitError("We were unable to send your message. Please check the information provided and try again.");
    } catch {
      setSubmitError(
        "We were unable to send your message. Please try again in a few moments.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#introduction" aria-label="TRADEMARK — home">TRADEMARK</a>
        <nav aria-label="Main navigation">
          <a href="#approche">Approach</a>
          <a href="#reseau">Network</a>
          <a href="#intervention">Engagement</a>
          <a href="#contact">Contact</a>
          <span className="language-switch">
            <a className="language-link" href="/" hrefLang="fr" aria-label="Version française">FR</a>
            <span aria-hidden="true">/</span>
            <a className="language-link is-active" href="/en/" aria-current="page">EN</a>
          </span>
        </nav>
      </header>

      <section className="panel panel-light intro" id="introduction">
        <div className="page-shell">
          <SectionHeader number="01" title="Introduction" side="Offices · Paris · Casablanca · Abidjan" />
          <h1 className="display display-intro display-sweep" data-reveal="title">
            <span>What if your blind</span><span>spots became</span><span>growth engines?</span>
          </h1>
          <div className="intro-footer" data-reveal="body">
            <p>TRADEMARK specialises in bringing high-impact technologies to high-potential international markets, beyond the geographies their vendors cover directly.</p>
            <a className="text-link" href="#contact">Let’s talk <span aria-hidden="true">→</span></a>
          </div>
        </div>
      </section>

      <section className="panel panel-dark" id="contexte">
        <div className="page-shell">
          <SectionHeader number="02" title="Context" side="The challenge" />
           <h2 className="display display-section" data-reveal="title"><span>Growth demands</span><span>choices.</span></h2>
           <div className="two-cols body-copy" data-reveal="body">
            <p>For technology start-ups, growth demands choices. With funding harder to secure and the path to profitability under closer scrutiny, resources naturally concentrate on a few priority markets able to support rapid scale-up.</p>
            <p>This discipline is necessary. But it also leaves aside markets where the needs are real, where the commercial potential is genuine, and which internal teams cannot reasonably address without a local presence, network or partner.</p>
          </div>
           <p className="closing-line" data-reveal="lead">This is precisely where <strong>TRADEMARK</strong> comes in.</p>
        </div>
      </section>

      <section className="panel panel-light" id="approche">
        <div className="page-shell">
          <SectionHeader number="03" title="Approach" side="Method" />
           <h2 className="display display-section" data-reveal="title"><span>Start from the need,</span><span>not the technology</span></h2>
           <div className="two-cols body-copy approach-copy" data-reveal="body">
            <p>Our DNA as an independent firm specialising in innovation strategy and organisational performance shapes our approach: we start from the operational friction local companies face, then identify the technologies that can genuinely resolve it.</p>
            <p>This discipline lets us focus on technologies whose value proposition meets a concrete need and whose impact can be demonstrated quickly.</p>
          </div>
           <p className="micro-title" data-reveal="label">Our selection criteria</p>
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
          <SectionHeader number="04" title="Network" side="Access to decision-makers" />
           <h2 className="display display-section" data-reveal="title"><span>Opening</span><span>new markets</span></h2>
           <div className="network-copy" data-reveal="body">
            <p className="lead">Entering a new market takes more than a sales effort: you need to understand its players and decision-making circuits, and to have the right local partners.</p>
            <div className="body-copy"><p>Our teams’ experience within major international consulting and communications networks has allowed us to build, in several countries, a network of trusted local contacts and partners deeply rooted in their economic ecosystems.</p><p>These partners give us access to the right decision-making levels in leading companies, help us assess local issues and identify relevant opportunities faster, by arranging introductions to the relevant executive, technology and operations leadership.</p></div>
          </div>
           <p className="micro-title" data-reveal="label">Three combined levers</p>
          <div className="lever-grid">
             <article data-reveal="item"><h3>Market<br />understanding</h3></article>
             <article data-reveal="item"><h3>Trusted local<br />networks</h3></article>
             <article data-reveal="item"><h3>Access to<br />decision-makers</h3></article>
          </div>
        </div>
      </section>

      <section className="panel panel-dark" id="intervention">
        <div className="page-shell">
          <SectionHeader number="05" title="Engagement" side="Scope" />
           <h2 className="display display-section" data-reveal="title"><span>Local access for</span><span>global technologies</span></h2>
           <p className="intervention-intro body-copy" data-reveal="body">TRADEMARK enables technology companies to approach markets they could not necessarily address with their own teams, without committing upfront to the prospecting, networking and local-presence costs a direct approach would require.</p>
           <div className="scope-grid" data-reveal="item">
            <div><p className="micro-title">What we take on</p><ul><li>Identifying opportunities</li><li>Qualifying accounts</li><li>Access to decision-makers</li><li>Arranging introductions</li></ul></div>
            <div className="muted-scope"><p className="micro-title">What remains yours</p><ul><li>Deployment model</li><li>Contracting</li><li>Deployment and support</li><li>Market development</li></ul></div>
          </div>
           <p className="closing-line" data-reveal="lead">Our role ends where the vendor’s begins.</p>
        </div>
      </section>

      <section className="panel panel-light contact" id="contact">
        <div className="page-shell">
          <SectionHeader number="06" title="Contact" side="Offices · Paris · Casablanca · Abidjan" />
           <p className="contact-lead" data-reveal="lead">Do you have a proven, fast-ROI technology, with some markets<br className="desktop-break" /> still outside your immediate priorities?</p>
           <h2 className="display contact-title" data-reveal="title">Let’s talk.</h2>
          <div className="contact-grid">
             <aside className="offices" data-reveal="body">
              <h3 className="micro-title">Our offices</h3>
              <h3>Paris</h3><p>134-136 boulevard Brune<br />75014 Paris</p>
               <h3>Casablanca</h3><p>Apartment 4, Hamza Residence<br />Palmier District — 20340</p>
               <h3>Abidjan</h3><p>II Plateaux Vallon, villa lot 522<br />plot 222, Cocody</p>
              <a href="mailto:contact@tmrk.fr">contact@tmrk.fr</a>
            </aside>
              <form ref={formRef} onSubmit={submit} data-reveal="body" noValidate>
              <p className="micro-title">Write to us</p>
              {sent ? (
                <div className="form-thanks" role="status">
                  <p className="form-thanks-title">Thank you, we will get back to you shortly.</p>
                  <p>Your message has been sent and our team will review it carefully.</p>
                </div>
              ) : (
                <>
                  <div className="form-grid">
                    <label htmlFor="en-firstName">First name<input id="en-firstName" name="firstName" type="text" autoComplete="given-name" maxLength={100} />{errors.firstName && <span className="field-error">{errors.firstName}</span>}</label>
                    <label htmlFor="en-lastName">Last name<input id="en-lastName" name="lastName" type="text" autoComplete="family-name" maxLength={100} />{errors.lastName && <span className="field-error">{errors.lastName}</span>}</label>
                    <label htmlFor="en-company">Company<input id="en-company" name="company" type="text" autoComplete="organization" maxLength={100} />{errors.company && <span className="field-error">{errors.company}</span>}</label>
                    <label htmlFor="en-email">Email<input id="en-email" type="email" name="email" autoComplete="email" maxLength={255} />{errors.email && <span className="field-error">{errors.email}</span>}</label>
                    <label className="full" htmlFor="en-message">Subject<textarea id="en-message" name="message" rows={2} maxLength={2000} />{errors.message && <span className="field-error">{errors.message}</span>}</label>
                    <input className="hp-field" type="text" name="telephone" tabIndex={-1} autoComplete="off" aria-hidden="true" />
                  </div>
                  <button type="submit" disabled={sending}>{sending ? "Sending…" : "Send"}</button>
                  {submitError && <p className="form-error" role="alert">{submitError}</p>}
                </>
              )}
            </form>
          </div>
          <footer><a className="brand" href="#introduction">TRADEMARK</a><div><span>© 2026</span><span className="language-switch"><a className="language-link" href="/" hrefLang="fr">FR</a><span aria-hidden="true">/</span><a className="language-link is-active" href="/en/" aria-current="page">EN</a></span><span>Legal notice</span><span>Privacy</span><button type="button" className="footer-link" onClick={() => window.dispatchEvent(new Event("tmrk:open-consent"))}>Cookie settings</button></div></footer>
        </div>
      </section>
      <ConsentManager language="en" />
    </main>
  );
}