import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import ConsentManager from "@/components/ConsentManager";

type LegalPageProps = {
  language: "fr" | "en";
  eyebrow: string;
  title: string;
  updated: string;
  children: ReactNode;
  alternatePath: "/mentions-legales/" | "/confidentialite/" | "/en/legal-notice/" | "/en/privacy/";
};

export default function LegalPage({ language, eyebrow, title, updated, children, alternatePath }: LegalPageProps) {
  const english = language === "en";

  return (
    <main className="legal-page">
      <header className="site-header legal-header" data-theme="light">
        <Link className="brand" to={english ? "/en/" : "/"}>TRADEMARK</Link>
        <nav aria-label={english ? "Legal page navigation" : "Navigation des pages juridiques"}>
          <Link to={english ? "/en/" : "/"}>{english ? "Home" : "Accueil"}</Link>
          <span className="language-switch">
            {english ? (
              <>
                <Link className="language-link" to={alternatePath} hrefLang="fr">FR</Link>
                <span aria-hidden="true">/</span>
                <span className="language-link is-active" aria-current="page">EN</span>
              </>
            ) : (
              <>
                <span className="language-link is-active" aria-current="page">FR</span>
                <span aria-hidden="true">/</span>
                <Link className="language-link" to={alternatePath} hrefLang="en">EN</Link>
              </>
            )}
          </span>
        </nav>
      </header>

      <article className="legal-shell">
        <div className="legal-heading">
          <p className="legal-eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="legal-updated">{updated}</p>
        </div>
        <div className="legal-content">{children}</div>
      </article>

      <footer className="legal-footer">
        <Link className="brand" to={english ? "/en/" : "/"}>TRADEMARK</Link>
        <div>
          <span>© 2026</span>
          <Link to={english ? "/en/legal-notice/" : "/mentions-legales/"}>{english ? "Legal notice" : "Mentions légales"}</Link>
          <Link to={english ? "/en/privacy/" : "/confidentialite/"}>{english ? "Privacy" : "Confidentialité"}</Link>
          <button type="button" className="footer-link" onClick={() => window.dispatchEvent(new Event("tmrk:open-consent"))}>
            {english ? "Cookie settings" : "Gestion des cookies"}
          </button>
        </div>
      </footer>
      <ConsentManager language={language} />
    </main>
  );
}