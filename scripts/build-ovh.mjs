#!/usr/bin/env node
/**
 * Build statique pour un hébergement OVH mutualisé (FTP/SFTP, sans Node.js).
 *
 * 1. Lance le build de production Vite / TanStack Start (le pré-rendu est activé
 *    dans vite.config.ts : "/" et "/en/" produisent un vrai fichier HTML complet).
 * 2. Rassemble uniquement les fichiers à servir dans ./ovh-dist.
 * 3. Vérifie la présence des pages pré-rendues et des assets publics obligatoires.
 *
 * Aucun fichier de l'application n'est modifié : ce script ne fait que copier.
 */
import { spawnSync } from "node:child_process";
import { cp, mkdir, readFile, rm, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
// TanStack Start / Nitro génère les fichiers publics (pages pré-rendues + assets)
// dans .output/public. C'est la source de l'export statique.
const clientDir = path.join(root, ".output", "public");
const outDir = path.join(root, "ovh-dist");
// Fichiers serveur optionnels (contact.php, consent.php, .htaccess…) à déposer
// tels quels à la racine web OVH. Aucun rewrite SPA n'est généré.
const extraDir = path.join(root, "ovh-extra");

function run(cmd, args) {
  const res = spawnSync(cmd, args, { stdio: "inherit", cwd: root, shell: process.platform === "win32" });
  if (res.status !== 0) {
    console.error(`\n[build:ovh] Échec de : ${cmd} ${args.join(" ")}`);
    process.exit(res.status ?? 1);
  }
}

console.log("[build:ovh] 1/3 — build de production + pré-rendu…");
run(process.execPath, [path.join(root, "node_modules", "vite", "bin", "vite.js"), "build"]);

if (!existsSync(clientDir)) {
  console.error("[build:ovh] .output/public est introuvable : le build n'a rien produit.");
  process.exit(1);
}

console.log("[build:ovh] 2/3 — assemblage de ovh-dist…");
await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });
await cp(clientDir, outDir, { recursive: true });

if (existsSync(extraDir)) {
  await cp(extraDir, outDir, { recursive: true });
  console.log("[build:ovh]   + fichiers de ovh-extra/ (PHP, .htaccess éventuel)");
}

console.log("[build:ovh] 3/3 — vérifications…");
const required = [
  "index.html",
  path.join("en", "index.html"),
  "robots.txt",
  "sitemap.xml",
  "favicon.svg",
  "favicon-48.png",
  "favicon-96.png",
  "apple-touch-icon.png",
  "og-fr.png",
  "og-en.png",
  "logo-512.png",
];

const missing = [];
for (const rel of required) {
  try {
    const s = await stat(path.join(outDir, rel));
    if (!s.isFile() || s.size === 0) missing.push(rel);
  } catch {
    missing.push(rel);
  }
}
if (missing.length) {
  console.error(`[build:ovh] Fichiers manquants : ${missing.join(", ")}`);
  process.exit(1);
}

// Les pages doivent être de vraies pages pré-rendues, pas un fallback SPA vide.
const checks = [
  { file: "index.html", needles: ["<title>", 'rel="canonical"', 'property="og:', 'name="twitter:', "application/ld+json", 'hreflang="fr"'] },
  { file: path.join("en", "index.html"), needles: ["<title>", 'rel="canonical"', 'property="og:', 'name="twitter:', "application/ld+json", 'hreflang="en"'] },
];
for (const { file, needles } of checks) {
  const html = await readFile(path.join(outDir, file), "utf8");
  const lower = html.toLowerCase();
  const absent = needles.filter((n) => !lower.includes(n.toLowerCase()));
  if (absent.length) {
    console.error(`[build:ovh] ${file} : balises absentes -> ${absent.join(", ")}`);
    process.exit(1);
  }
  if (!/<h1[\s>]/i.test(html)) {
    console.error(`[build:ovh] ${file} : aucun <h1> dans le HTML -> page non pré-rendue.`);
    process.exit(1);
  }
  const assets = html.match(/\/assets\/[A-Za-z0-9._-]+/g) ?? [];
  const brokenAssets = [...new Set(assets)].filter((a) => !existsSync(path.join(outDir, a)));
  if (brokenAssets.length) {
    console.error(`[build:ovh] ${file} : assets référencés absents -> ${brokenAssets.join(", ")}`);
    process.exit(1);
  }
  console.log(`[build:ovh]   ✔ ${file} (HTML complet + métadonnées + assets)`);
}

console.log(`\n[build:ovh] Terminé. Dossier à téléverser à la racine web OVH : ${outDir}`);
