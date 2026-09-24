import { createFileRoute, Link } from "@tanstack/react-router";
import LegalPage from "@/components/LegalPage";

const title = "Mentions légales | TRADEMARK";
const description = "Mentions légales du site TRADEMARK : éditeur, directeur de la publication, hébergeur, propriété intellectuelle et responsabilité.";

export const Route = createFileRoute("/mentions-legales")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
    links: [
      { rel: "canonical", href: "https://www.tmrk.fr/mentions-legales/" },
      { rel: "alternate", hrefLang: "fr", href: "https://www.tmrk.fr/mentions-legales/" },
      { rel: "alternate", hrefLang: "en", href: "https://www.tmrk.fr/en/legal-notice/" },
    ],
  }),
  component: LegalNotice,
});

function LegalNotice() {
  return (
    <LegalPage language="fr" eyebrow="Informations légales" title="Mentions légales" updated="Dernière mise à jour : 24 septembre 2026" alternatePath="/en/legal-notice/">
      <section><h2>Éditeur du site</h2><p>Le site www.tmrk.fr est édité par :</p><p><strong>TRADEMARK</strong><br />Société par actions simplifiée unipersonnelle (SASU) au capital de 1 000 euros<br />Siège social : 134-136 boulevard Brune, 75014 Paris, France<br />Immatriculée au registre du commerce et des sociétés de Paris sous le numéro <strong>[À COMPLÉTER : n° SIREN]</strong><br />Numéro de TVA intracommunautaire : <strong>[À COMPLÉTER : FR + n°]</strong><br />E-mail : <a href="mailto:contact@tmrk.fr">contact@tmrk.fr</a><br />Téléphone : <strong>[À COMPLÉTER]</strong></p></section>
      <section><h2>Directeur de la publication</h2><p>Franck Maury, Président de TRADEMARK.</p></section>
      <section><h2>Hébergeur</h2><p><strong>OVH SAS</strong><br />Société par actions simplifiée au capital de 50 000 000 euros<br />2 rue Kellermann, 59100 Roubaix, France<br />RCS Lille Métropole 424 761 419<br />Téléphone : 1007<br />Site : <a href="https://www.ovhcloud.com" rel="noreferrer">www.ovhcloud.com</a></p></section>
      <section><h2>Propriété intellectuelle</h2><p>Tous les éléments de ce site (textes, mise en page, nom et logo TRADEMARK) appartiennent à TRADEMARK ou sont utilisés avec l’accord de leurs auteurs. Ils sont protégés par le droit d’auteur et le droit des marques.</p><p>Vous ne pouvez pas les copier, les modifier ou les réutiliser, en tout ou en partie, sans l’accord écrit de TRADEMARK. Les courtes citations restent autorisées, à condition d’indiquer la source.</p></section>
      <section><h2>Contenu du site et responsabilité</h2><p>Les informations publiées sur ce site sont données pour information. Elles ne constituent ni une offre commerciale ni un conseil.</p><p>Nous les rédigeons et les mettons à jour avec soin, sans pouvoir garantir qu’elles soient toujours complètes et exactes. TRADEMARK ne peut pas être tenue responsable d’une décision prise sur la seule base de ces informations, ni d’une interruption ou d’un problème technique du site.</p></section>
      <section><h2>Liens vers d’autres sites</h2><p>Ce site peut contenir des liens vers d’autres sites. TRADEMARK ne contrôle pas ces sites et n’est pas responsable de leur contenu.</p></section>
      <section><h2>Données personnelles et cookies</h2><p>Pour savoir quelles données nous recueillons, pourquoi, et quels sont vos droits, consultez notre <Link to="/confidentialite/">politique de confidentialité</Link>.</p><p>Vous pouvez modifier vos choix concernant les cookies à tout moment grâce au lien « Gestion des cookies », en bas de chaque page.</p></section>
      <section><h2>Droit applicable</h2><p>Les présentes mentions légales sont soumises au droit français.</p></section>
    </LegalPage>
  );
}