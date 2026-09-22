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

/** Réponse JSON standardisée puis arrêt. */
function repondre(int $code, bool $ok, string $message, array $erreurs = []): void
{
    http_response_code($code);
    echo json_encode(['ok' => $ok, 'message' => $message, 'errors' => $erreurs], JSON_UNESCAPED_UNICODE);
    exit;
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
