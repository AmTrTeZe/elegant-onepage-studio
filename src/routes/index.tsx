import { createFileRoute } from "@tanstack/react-router";
import { FormEvent, useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TRADEMARK — Accès local pour technologies globales" },
      {
        name: "description",
        content:
          "Cabinet spécialisé dans l’introduction de technologies à fort impact sur des marchés internationaux à fort potentiel.",
      },
      { property: "og:title", content: "TRADEMARK — Accès local pour technologies globales" },
      {
        property: "og:description",
        content:
          "Cabinet spécialisé dans l’introduction de technologies à fort impact sur des marchés internationaux à fort potentiel.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
          if (approche && approche.contains(target)) holdApproche();
          observer.unobserve(entry.target);
        });
      },
      // On déclenche seulement quand l'élément entre réellement dans l'écran.
      { threshold: 0.01, rootMargin: "-90px 0px -12% 0px" },
    );
    items.forEach((item) => {
      if (item !== introFooter) observer.observe(item);
    });
    return () => {
      observer.disconnect();
      if (unlockTimer !== undefined) clearTimeout(unlockTimer);
      releaseApproche();
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
    const calibrate = () => {
      panels.forEach((panel) => {
        if (!desktop.matches) {
          panel.style.top = "";
          return;
        }
        panel.style.top = `${Math.min(0, window.innerHeight - panel.offsetHeight)}px`;
      });
      measure();
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
    const destinationOf = (target: HTMLElement) => {
      const base = naturalTops.get(target) ?? target.offsetTop;
      const limit = document.documentElement.scrollHeight - window.innerHeight;
      return Math.max(0, Math.min(limit, base - (desktop.matches ? 0 : header.offsetHeight)));
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
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", calibrate);
    window.addEventListener("resize", sync);
    document.addEventListener("click", onAnchorClick);
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", calibrate);
      window.removeEventListener("resize", sync);
      document.removeEventListener("click", onAnchorClick);
      if (scrollFrame !== undefined) cancelAnimationFrame(scrollFrame);
    };
  }, []);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(true);
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
        </nav>
      </header>

      <section className="panel panel-light intro" id="introduction">
        <div className="page-shell">
          <SectionHeader number="01" title="Introduction" side="Paris · Casablanca · Abidjan" />
          <h1 className="display display-intro display-sweep" data-reveal="title">
            <span>Et si vos angles</span><span>morts devenaient</span><span>des relais de</span><span>croissance ?</span>
          </h1>
          <div className="intro-footer" data-reveal="body">
            <p>TRADEMARK est un cabinet spécialisé dans l’introduction de technologies à fort impact sur des marchés internationaux à fort potentiel, au-delà des géographies prioritaires de leurs éditeurs.</p>
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
           <h2 className="display display-section" data-reveal="title"><span>Business enabler for</span><span>new markets</span></h2>
           <div className="network-copy" data-reveal="body">
            <p className="lead">Pénétrer un nouveau marché exige plus qu’une démarche commerciale : il faut en comprendre les acteurs, les circuits de décision et disposer des bons relais.</p>
            <div className="body-copy"><p>L’expérience de nos équipes au sein de grands réseaux internationaux de conseil et de communication nous a permis de constituer, dans plusieurs pays, un réseau de contacts et de relais locaux de confiance, profondément ancrés dans leurs écosystèmes économiques.</p><p>Ces relais nous donnent accès aux bons niveaux de décision des entreprises leaders, nous aident à qualifier les enjeux locaux et nous permettent d’identifier plus rapidement les opportunités pertinentes, en organisant des introductions auprès des directions générales, technologiques et opérationnelles concernées.</p></div>
          </div>
           <p className="micro-title" data-reveal="label">Trois leviers combinés</p>
          <div className="lever-grid">
             <article data-reveal="item"><h3>Compréhension<br />du marché</h3><p>Transformer un marché peu ou pas adressé en opportunité de croissance.</p></article>
             <article data-reveal="item"><h3>Relais<br />locaux</h3></article>
             <article data-reveal="item"><h3>Accès aux<br />décideurs</h3></article>
          </div>
        </div>
      </section>

      <section className="panel panel-dark" id="intervention">
        <div className="page-shell">
          <SectionHeader number="05" title="Intervention" side="Périmètre" />
           <h2 className="display display-section" data-reveal="title"><span>Local access for</span><span>global technologies</span></h2>
           <p className="intervention-intro body-copy" data-reveal="body">TRADEMARK permet aux entreprises technologiques d’aborder des marchés qu’elles ne pourraient pas nécessairement adresser avec leurs seules équipes, sans engager en amont les coûts de prospection, de réseau et de présence locale qu’exigerait une approche directe.</p>
           <div className="scope-grid" data-reveal="item">
            <div><p className="micro-title">Ce que nous prenons en charge</p><ul><li>Identification des opportunités</li><li>Qualification des comptes</li><li>Accès aux décideurs</li><li>Organisation des introductions</li></ul></div>
            <div className="muted-scope"><p className="micro-title">Ce qui vous revient</p><ul><li>Modèle de déploiement</li><li>Contractualisation</li><li>Delivery et support</li><li>Développement du marché</li></ul></div>
          </div>
           <p className="closing-line" data-reveal="lead">Notre rôle s’arrête là où commence celui de l’éditeur.</p>
        </div>
      </section>

      <section className="panel panel-light contact" id="contact">
        <div className="page-shell">
          <SectionHeader number="06" title="Contact" side="Paris · Casablanca · Abidjan" />
           <p className="contact-lead" data-reveal="lead">Vous développez une technologie éprouvée, à ROI rapide, et certains marchés<br className="desktop-break" /> restent hors de vos priorités immédiates ?</p>
           <h2 className="display contact-title" data-reveal="title">Parlons-en.</h2>
          <div className="contact-grid">
             <aside className="offices" data-reveal="body">
              <p className="micro-title">Nos bureaux</p>
              <h3>Paris</h3><p>134-136 boulevard Brune<br />75014 Paris</p>
              <h3>Casablanca</h3><p>Appartement n°4, Résidence Hamza<br />Quartier Palmier — 20340</p>
              <h3>Abidjan</h3><p>II Plateaux Vallon, villa lot 522<br />parcelle 222, Cocody</p>
              <a href="mailto:contact@trademark-conseil.fr">contact@trademark-conseil.fr</a>
            </aside>
             <form onSubmit={submit} data-reveal="body">
              <p className="micro-title">Écrivez-nous</p>
              <div className="form-grid">
                <label>Prénom<input name="firstName" required /></label>
                <label>Nom<input name="lastName" required /></label>
                <label>Entreprise<input name="company" required /></label>
                <label>E-mail<input type="email" name="email" required /></label>
                <label className="full">Objet<textarea name="message" rows={2} required /></label>
              </div>
              <button type="submit">Envoyer</button>
              {sent && <p className="form-status" role="status">Merci. Votre message est prêt à être transmis.</p>}
            </form>
          </div>
          <footer><a className="brand" href="#introduction">TRADEMARK</a><div><span>© 2026</span><span>Mentions légales</span><span>Confidentialité</span></div></footer>
        </div>
      </section>
    </main>
  );
}