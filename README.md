# Spletna stran – Boštjan Gašparič, zasebni detektiv

Čisti HTML5 + CSS3 + JavaScript, brez ogrodij, brez piškotkov za sledenje.

## Struktura

```
/
├── index.html                 domača stran
├── o-meni.html                licenca, izkušnje, etika
├── za-podjetja.html           nagovor podjetij, odvetnikov, zavarovalnic
├── za-posameznike.html        nagovor posameznikov
├── postopek.html              potek sodelovanja v 7 korakih
├── vprasanja.html             16 pogostih vprašanj (+ JSON-LD FAQPage)
├── kontakt.html               diskreten obrazec
├── zasebnost.html             politika zasebnosti (GDPR)
├── 404.html
├── storitve/
│   ├── bolniska-odsotnost.html
│   ├── nelojalna-konkurenca.html
│   ├── iskanje-oseb-in-premozenja.html
│   ├── preverjanje-poslovnih-partnerjev.html
│   ├── druzinske-zadeve.html
│   └── dokazi-za-sodne-postopke.html
├── css/style.css              barve, pisave, velikosti = spremenljivke na vrhu
├── js/main.js                 meni, validacija obrazca, Formspree/PHP
├── php/poslji.php             pošiljanje obrazca (možnost A)
├── img/favicon.svg            (sem dodajte še fotografije – glejte spodaj)
├── robots.txt
├── sitemap.xml
└── .htaccess                  404, varnostne glave, predpomnjenje (Apache)
```

Glava in noga sta na vseh straneh enaki. Ko spremenite meni ali kontakt v nogi,
uporabite »Najdi in zamenjaj v vseh datotekah« (npr. v VS Code: Ctrl+Shift+H).

## 1. Dopolnite oznake za vnos

V urejevalniku z iskanjem po vseh datotekah zamenjajte vsako oznako (seznam spodaj).
Najprej `[DOMENA]` (npr. `www.gasparic-detektiv.si`, brez `https://`) in
`[TELEFON-MEDNARODNO]` (brez presledkov, npr. `+38641123456`).

## 2. Fotografije

Na mestih z `[SLIKA: …]` je v HTML tik nad označbo komentar s pripravljeno kodo:

```html
<img src="img/bostjan-gasparic-portret.webp" alt="…" width="800" height="1000" loading="lazy" decoding="async">
```

Fotografijo shranite v `img/` v formatu **WebP** (npr. squoosh.app, kakovost 75–80),
širina ~800 px, nato zamenjajte `<div class="img-placeholder …">` s to vrstico.
Na domači strani portret v glavi (hero) naložite **brez** `loading="lazy"`, ker je takoj viden.

Potrebne slike:
- `bostjan-gasparic-portret.webp` (4:5) – domača stran
- `bostjan-gasparic-pisarna.webp` (16:9) – domača stran
- `bostjan-gasparic-o-meni.webp` (4:5) – stran O meni
- `og-slika.jpg` 1200 × 630 px – predogled ob deljenju povezave (JPG zaradi združljivosti z omrežji)

## 3. Kontaktni obrazec – izberite eno možnost

### Možnost A: PHP (privzeto)
Deluje na skoraj vseh slovenskih gostovanjih (Hostko, Domenca, Neoserv …).
1. V `php/poslji.php` nastavite `PREJEMNIK` in `POSILJATELJ` (naslov na vaši domeni, npr. `obrazec@vasa-domena.si` – ustvarite ga v nadzorni plošči).
2. Pošljite testno sporočilo. Če ne prispe, preverite mapo z neželeno pošto ali gostitelja vprašajte, ali `mail()` deluje; sicer uporabite možnost B ali SMTP (knjižnica PHPMailer).

### Možnost B: Formspree (brez PHP)
1. Ustvarite račun na formspree.io in nov obrazec – dobite naslov `https://formspree.io/f/xxxxxxx`.
2. V `kontakt.html` zamenjajte `action="php/poslji.php"` z `action="https://formspree.io/f/xxxxxxx"`.
3. `main.js` to zazna samodejno in pošlje v ozadju, obiskovalec ostane na strani.
4. V nastavitvah Formspree vklopite zaščito pred spamom in v polje »honeypot« vpišite `spletna_stran`.
5. Mapo `php/` lahko izbrišete. V `zasebnost.html` pustite alinejo o Formspree (prenos v ZDA).

## 4. Objava na gostovanje

**Prek upravitelja datotek (cPanel / Plesk / DirectAdmin):**
1. Prijavite se v nadzorno ploščo gostovanja → *File Manager*.
2. Odprite mapo `public_html` (ali `httpdocs` / `www`).
3. Naložite ZIP vseh datotek iz te mape (ne mape same!) in ga razširite tam (*Extract*).
4. Preverite, da `index.html` leži neposredno v `public_html`.

**Prek FTP (FileZilla):**
1. V nadzorni plošči ustvarite FTP-uporabnika ali uporabite obstoječe podatke (strežnik, uporabnik, geslo, vrata 21 ali SFTP 22).
2. V FileZilli: *Datoteka → Upravitelj strani → Nova stran*, vnesite podatke, protokol **SFTP ali FTP z eksplicitnim TLS**.
3. Levo odprite to mapo, desno `public_html`, označite vse datoteke in jih povlecite na desno.
4. Prepričajte se, da je prenesena tudi skrita datoteka `.htaccess` (*Strežnik → Prisili prikaz skritih datotek*).

**Po objavi:**
1. V nadzorni plošči vklopite brezplačen SSL (Let's Encrypt), nato v `.htaccess` odkomentirajte preusmeritev na HTTPS.
2. Odprite stran na telefonu, preverite meni, gumb za klic in pošljite testno sporočilo.
3. Preverite strukturirane podatke: search.google.com/test/rich-results
4. Dodajte stran v Google Search Console in oddajte `https://vasa-domena.si/sitemap.xml`.
5. Ustvarite profil Google Business Profile z enakim naslovom in telefonom kot na strani.

## 5. Spreminjanje videza

Vse barve, pisave in velikosti so na vrhu `css/style.css` v razdelku `:root`.
Npr. drug poudarni ton: spremenite `--c-accent` in `--c-accent-hover`
(na temnem ozadju ohranite kontrast vsaj 4.5 : 1 – preverite na webaim.org/resources/contrastchecker).

## 6. Pravno

Besedila so napisana v skladu z ZDD-2 (Uradni list RS, št. 95/2024) in GDPR, a niso
pravni nasvet. Pred objavo naj jih pregleda odvetnik – zlasti strani storitev
(oznaki `[PREVERITE …]`) in politiko zasebnosti.
