<?php
/**
 * Obdelava kontaktnega obrazca (možnost A – PHP na gostovanju).
 * Za možnost B (Formspree) glejte README.md – takrat te datoteke ne potrebujete.
 *
 * Zaščita: honeypot polje, časovna ovira (min. 3 s), omejitev dolžine,
 * preprečevanje vrivanja glav, preprosta omejitev pogostosti po IP (seja).
 */

declare(strict_types=1);

// ====== NASTAVITVE – dopolnite ======
const PREJEMNIK   = '[E-POŠTA]';               // kamor prispejo povpraševanja
const POSILJATELJ = 'obrazec@[DOMENA]';         // naslov na VAŠI domeni (zahteva večine gostiteljev)
const ZADEVA      = 'Novo povpraševanje s spletne strani';
const NAZAJ       = '/kontakt.html';
const MIN_SEKUND  = 3;
// =====================================

function nazaj(string $param): void {
    header('Location: ' . NAZAJ . '?' . $param . '#kontaktni-obrazec', true, 303);
    exit;
}

function polje(string $ime, int $max): string {
    $v = isset($_POST[$ime]) && is_string($_POST[$ime]) ? trim($_POST[$ime]) : '';
    $v = str_replace(["\r\n", "\r"], "\n", $v);
    return mb_substr($v, 0, $max);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Location: ' . NAZAJ, true, 303);
    exit;
}

// 1. Honeypot – roboti izpolnijo skrito polje. Tiho "uspeh", da se ne učijo.
if (polje('spletna_stran', 200) !== '') {
    nazaj('poslano=1');
}

// 2. Časovna ovira – oddaja prej kot v 3 sekundah je skoraj zagotovo robot
$zacetek = (int) polje('cas_zacetka', 12);
if ($zacetek > 0 && (time() - $zacetek) < MIN_SEKUND) {
    nazaj('poslano=1');
}

// 3. Omejitev pogostosti – največ 5 oddaj na uro na sejo
session_start();
$_SESSION['oddaje'] = array_filter($_SESSION['oddaje'] ?? [], fn($t) => $t > time() - 3600);
if (count($_SESSION['oddaje']) >= 5) {
    nazaj('napaka=1');
}

// 4. Validacija (enaka pravila kot v js/main.js)
$ime      = polje('ime', 100);
$kontakt  = polje('kontakt', 150);
$tip      = polje('tip', 20);
$opis     = polje('opis', 4000);
$odziv    = polje('odziv', 200);
$soglasje = polje('soglasje', 5);

$jeEmail   = (bool) filter_var($kontakt, FILTER_VALIDATE_EMAIL);
$jeTelefon = (bool) preg_match('/^[+()\d\s\/-]{6,20}$/', $kontakt);

if (
    (!$jeEmail && !$jeTelefon) ||
    !in_array($tip, ['podjetje', 'posameznik'], true) ||
    mb_strlen($opis) < 20 ||
    $soglasje !== 'da'
) {
    nazaj('napaka=1');
}

// 5. Sestava sporočila (navadno besedilo, brez HTML)
$besedilo  = "Novo povpraševanje s spletne strani\n";
$besedilo .= str_repeat('-', 40) . "\n";
$besedilo .= 'Ime:            ' . ($ime !== '' ? $ime : '(ni navedeno)') . "\n";
$besedilo .= 'Kontakt:        ' . $kontakt . "\n";
$besedilo .= 'Naročnik:       ' . $tip . "\n";
$besedilo .= 'Način odziva:   ' . ($odziv !== '' ? $odziv : '(ni navedeno)') . "\n";
$besedilo .= 'Soglasje GDPR:  da, ' . date('d. m. Y H:i') . "\n\n";
$besedilo .= "Opis zadeve:\n" . $opis . "\n";

// 6. Glave – Reply-To samo, če je kontakt veljaven e-naslov (preprečuje vrivanje glav)
$glave = [
    'From: ' . POSILJATELJ,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'X-Mailer: PHP',
];
if ($jeEmail) {
    $glave[] = 'Reply-To: ' . str_replace(["\r", "\n"], '', $kontakt);
}

$zadeva = '=?UTF-8?B?' . base64_encode(ZADEVA) . '?=';
$ok = mail(PREJEMNIK, $zadeva, $besedilo, implode("\r\n", $glave), '-f' . POSILJATELJ);

if ($ok) {
    $_SESSION['oddaje'][] = time();
    nazaj('poslano=1');
}
nazaj('napaka=1');
