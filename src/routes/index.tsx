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
    const items = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
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
          <h1 className="display display-intro" data-reveal="title">
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
            {criteria.map(([number, title, copy], index) => (
               <article className="criterion" data-reveal="item" style={{ "--delay": `${index * 70}ms` } as React.CSSProperties} key={number}>
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