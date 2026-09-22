<?php
/**
 * TRADEMARK — Archivage de la preuve de consentement (RGPD / CNIL).
 * À déposer à la racine du site OVH, à côté de contact.php.
 *
 * Reçoit le choix de l'internaute au format JSON et l'enregistre dans un
 * journal horodaté, afin de pouvoir prouver le consentement (ou le refus)
 * pendant la durée légale. Aucune donnée directement identifiante n'est
 * stockée : l'adresse IP est conservée sous forme de condensat (hachée).
 */

declare(strict_types=1);

// Aucun détail technique ne doit apparaître dans la réponse envoyée au navigateur.
@ini_set('display_errors', '0');
@ini_set('log_errors', '1');
error_reporting(0);

header('Content-Type: application/json; charset=utf-8');

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'message' => 'Méthode non autorisée.'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Sel propre à votre installation (déjà généré aléatoirement, à conserver tel quel).
const CONSENT_SALT = '40608f84512872da96a83713c639e66ff27ebaac62c48bb3';
const CONSENT_LOG  = __DIR__ . '/consent-log/consent.log';

$raw = file_get_contents('php://input') ?: '';
$payload = json_decode($raw, true);

if (!is_array($payload) || !isset($payload['choices']) || !is_array($payload['choices'])) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'message' => 'Requête invalide.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$allowed = ['necessaire', 'mesure', 'fonctionnel', 'marketing'];
$choices = [];
foreach ($allowed as $key) {
    $choices[$key] = !empty($payload['choices'][$key]);
}
$choices['necessaire'] = true; // toujours actif

$id = preg_replace('/[^A-Za-z0-9\-]/', '', (string) ($payload['id'] ?? '')) ?: bin2hex(random_bytes(8));
$version = (int) ($payload['version'] ?? 1);

$entry = [
    'date'       => gmdate('c'),
    'id'         => substr($id, 0, 64),
    'version'    => $version,
    'choices'    => $choices,
    'ip_hash'    => hash('sha256', CONSENT_SALT . ($_SERVER['REMOTE_ADDR'] ?? '')),
    'user_agent' => substr((string) ($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 200),
];

$directory = dirname(CONSENT_LOG);
if (!is_dir($directory)) {
    @mkdir($directory, 0750, true);
}
// Protection du journal contre tout accès public.
$htaccess = $directory . '/.htaccess';
if (!file_exists($htaccess)) {
    @file_put_contents($htaccess, "Require all denied\n");
}

$line = json_encode($entry, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . PHP_EOL;
$written = @file_put_contents(CONSENT_LOG, $line, FILE_APPEND | LOCK_EX);

if ($written === false) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'message' => 'Enregistrement impossible.'], JSON_UNESCAPED_UNICODE);
    exit;
}

echo json_encode(['ok' => true, 'id' => $entry['id'], 'date' => $entry['date']], JSON_UNESCAPED_UNICODE);
