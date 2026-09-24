import { createFileRoute, Link } from "@tanstack/react-router";
import LegalPage from "@/components/LegalPage";

const title = "Legal Notice | TRADEMARK";
const description = "TRADEMARK website legal notice: publisher, publication director, hosting provider, intellectual property and liability.";

export const Route = createFileRoute("/en/legal-notice")({
  head: () => ({
    meta: [
      { title }, { name: "description", content: description },
      { property: "og:type", content: "website" }, { property: "og:title", content: title },
      { property: "og:description", content: description }, { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: title }, { name: "twitter:description", content: description },
    ],
    links: [
      { rel: "canonical", href: "https://www.tmrk.fr/en/legal-notice/" },
      { rel: "alternate", hrefLang: "fr", href: "https://www.tmrk.fr/mentions-legales/" },
      { rel: "alternate", hrefLang: "en", href: "https://www.tmrk.fr/en/legal-notice/" },
    ],
  }),
  component: LegalNotice,
});

function LegalNotice() {
  return (
    <LegalPage language="en" eyebrow="Legal information" title="Legal notice" updated="Last updated: 24 September 2026" alternatePath="/mentions-legales">
      <section><h2>Website publisher</h2><p>The website www.tmrk.fr is published by:</p><p><strong>TRADEMARK</strong><br />A French simplified single-shareholder company (SASU) with share capital of €1,000<br />Registered office: 134-136 boulevard Brune, 75014 Paris, France<br />Registered with the Paris Trade and Companies Register under number <strong>[TO BE COMPLETED: SIREN number]</strong><br />Intra-Community VAT number: <strong>[TO BE COMPLETED: FR + number]</strong><br />Email: <a href="mailto:contact@tmrk.fr">contact@tmrk.fr</a><br />Telephone: <strong>[TO BE COMPLETED]</strong></p></section>
      <section><h2>Publication director</h2><p>Franck Maury, President of TRADEMARK.</p></section>
      <section><h2>Hosting provider</h2><p><strong>OVH SAS</strong><br />A French simplified joint-stock company with share capital of €50,000,000<br />2 rue Kellermann, 59100 Roubaix, France<br />Lille Métropole Trade and Companies Register 424 761 419<br />Telephone: 1007<br />Website: <a href="https://www.ovhcloud.com" rel="noreferrer">www.ovhcloud.com</a></p></section>
      <section><h2>Intellectual property</h2><p>All elements of this website (texts, layout, TRADEMARK name and logo) belong to TRADEMARK or are used with the permission of their authors. They are protected by copyright and trademark law.</p><p>You may not copy, modify or reuse them, in whole or in part, without TRADEMARK’s prior written consent. Short quotations remain permitted, provided the source is acknowledged.</p></section>
      <section><h2>Website content and liability</h2><p>The information published on this website is provided for information purposes only. It does not constitute a commercial offer or advice.</p><p>We prepare and update it with care but cannot guarantee that it will always be complete and accurate. TRADEMARK may not be held liable for a decision made solely on the basis of this information, or for any interruption or technical issue affecting the website.</p></section>
      <section><h2>Links to other websites</h2><p>This website may contain links to other websites. TRADEMARK does not control these websites and is not responsible for their content.</p></section>
      <section><h2>Personal data and cookies</h2><p>To learn what data we collect, why we collect it and what your rights are, please read our <Link to="/en/privacy">privacy policy</Link>.</p><p>You can change your cookie choices at any time using the “Cookie settings” link at the bottom of each page.</p></section>
      <section><h2>Governing law</h2><p>This legal notice is governed by French law.</p></section>
    </LegalPage>
  );
}