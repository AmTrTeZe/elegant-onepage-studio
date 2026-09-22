<?php
/**
 * TRADEMARK — Traitement du formulaire de contact
 * À déposer à la racine du site OVH, à côté de la page contenant le formulaire.
 * Le formulaire appelle ce fichier en POST et attend une réponse JSON.
 */

declare(strict_types=1);

// Aucun détail technique ne doit apparaître dans la réponse envoyée au navigateur.
@ini_set('display_errors', '0');
@ini_set('log_errors', '1');
error_reporting(0);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

const DESTINATAIRE = 'contact@tmrk.fr';
const EXPEDITEUR   = 'contact@tmrk.fr'; // adresse du domaine OVH pour l'en-tête From
const MAX_NOM      = 100;
const MAX_MESSAGE  = 2000;

// Limitation de débit : 3 envois maximum par fenêtre glissante d'1 heure.
const RL_MAX_ENVOIS   = 3;
const RL_FENETRE_SEC  = 3600;
const RL_SEL          = 'kR7zP4vX9mQ2wL8sN5dF1hJ6bT3yU0cG'; // sel de hachage — ne pas diffuser
const RL_DOSSIER      = __DIR__ . '/contact-rate';

/** Réponse JSON standardisée puis arrêt. */
function repondre(int $code, bool $ok, string $message, array $erreurs = []): void
{
    http_response_code($code);
    echo json_encode(['ok' => $ok, 'message' => $message, 'errors' => $erreurs], JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Limitation de débit silencieuse, sans IP en clair ni session PHP :
 * un fichier par empreinte hachée contient les horodatages des envois.
 * Renvoie true si un nouvel envoi est autorisé (et l'enregistre alors).
 */
function envoiAutorise(): bool
{
    $empreinte = hash('sha256', RL_SEL . '|' . ($_SERVER['REMOTE_ADDR'] ?? 'inconnu'));
    $fichier = RL_DOSSIER . '/' . $empreinte . '.log';

    if (!is_dir(RL_DOSSIER)) {
        @mkdir(RL_DOSSIER, 0750, true);
        // Empêche toute consultation du dossier depuis le web.
        @file_put_contents(RL_DOSSIER . '/.htaccess', "Require all denied\n");
    }

    $maintenant = time();
    $seuil = $maintenant - RL_FENETRE_SEC;

    $horodatages = [];
    if (is_file($fichier)) {
        foreach ((array)file($fichier, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $ligne) {
            $t = (int)$ligne;
            if ($t >= $seuil) {
                $horodatages[] = $t;
            }
        }
    }

    if (count($horodatages) >= RL_MAX_ENVOIS) {
        return false;
    }

    $horodatages[] = $maintenant;
    @file_put_contents($fichier, implode("\n", $horodatages) . "\n", LOCK_EX);
    return true;
}

/** Nettoie une chaîne : supprime les retours chariot (anti-injection d'en-têtes) et espaces superflus. */
function nettoyer(string $valeur): string
{
    $valeur = str_replace(["\r", "\n", "%0a", "%0d"], ' ', $valeur);
    return trim($valeur);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    repondre(405, false, 'Méthode non autorisée.');
}

// Lecture du corps JSON ou du POST classique
$donnees = [];
$corps = file_get_contents('php://input');
if ($corps) {
    $json = json_decode($corps, true);
    if (is_array($json)) {
        $donnees = $json;
    }
}
if (!$donnees) {
    $donnees = $_POST;
}

// Honeypot : champ invisible piège à robots — s'il est rempli, on fait semblant de réussir.
if (!empty($donnees['telephone'])) {
    repondre(200, true, 'Merci. Votre message a bien été transmis.');
}

$prenom    = nettoyer((string)($donnees['firstName'] ?? ''));
$nom       = nettoyer((string)($donnees['lastName'] ?? ''));
$entreprise = nettoyer((string)($donnees['company'] ?? ''));
$email     = nettoyer((string)($donnees['email'] ?? ''));
$objet     = trim((string)($donnees['message'] ?? ''));

// Contrôles serveur (les mêmes messages que côté navigateur)
$erreurs = [];
if ($prenom === '' || mb_strlen($prenom) > MAX_NOM) {
    $erreurs['firstName'] = 'Merci d’indiquer votre prénom.';
}
if ($nom === '' || mb_strlen($nom) > MAX_NOM) {
    $erreurs['lastName'] = 'Merci d’indiquer votre nom.';
}
if ($entreprise === '' || mb_strlen($entreprise) > MAX_NOM) {
    $erreurs['company'] = 'Merci d’indiquer le nom de votre entreprise.';
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 255) {
    $erreurs['email'] = 'Merci d’indiquer une adresse e-mail valide.';
}
if ($objet === '' || mb_strlen($objet) > MAX_MESSAGE) {
    $erreurs['message'] = 'Merci de préciser l’objet de votre demande.';
}

if ($erreurs) {
    repondre(422, false, 'Certains champs sont à corriger.', $erreurs);
}

// Limitation de débit : au-delà du quota, message générique sans détail technique.
if (!envoiAutorise()) {
    repondre(429, false, 'Votre demande n’a pas pu aboutir pour le moment. Merci de réessayer un peu plus tard.');
}

// Composition du message
$sujet = 'Contact site — ' . $entreprise . ' (' . $prenom . ' ' . $nom . ')';
$lignes = [
    'Nouveau message depuis le formulaire du site.',
    '',
    'Prénom : ' . $prenom,
    'Nom : ' . $nom,
    'Entreprise : ' . $entreprise,
    'E-mail : ' . $email,
    '',
    'Objet :',
    $objet,
    '',
    '—',
    'Envoyé le ' . date('d/m/Y à H:i') . ' depuis ' . ($_SERVER['REMOTE_ADDR'] ?? 'adresse inconnue'),
];
$corpsMail = implode("\r\n", $lignes);

$entetes = implode("\r\n", [
    'From: Site TRADEMARK <' . EXPEDITEUR . '>',
    'Reply-To: ' . $prenom . ' ' . $nom . ' <' . $email . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8',
]);

$envoye = mail(DESTINATAIRE, mb_encode_mimeheader($sujet, 'UTF-8'), $corpsMail, $entetes);

if (!$envoye) {
    repondre(500, false, 'Une erreur est survenue lors de l’envoi. Merci de réessayer dans quelques instants.');
}

repondre(200, true, 'Merci. Votre message a bien été transmis.');
