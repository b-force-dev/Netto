# Vindbaarheid: Netto in Google en in deelvoorbeelden

Dit document legt uit wat er is gedaan zodat zoekmachines Netto kunnen vinden en
begrijpen, en wat alleen de eigenaar zelf kan doen.

## Wat er nu automatisch gebeurt

Bij elke publicatie op `main` draait `tools/bouw_routes.py`. Dat script gebruikt
`tools/seo.py`, en maakt daarmee:

| Wat | Waar | Toelichting |
|---|---|---|
| Eigen kop per pagina | `daily/`, `how-to-play/`, `about/`, `race/`, ... | Eigen `<title>`, beschrijving, canonical-adres en deelkaart (Open Graph en Twitter) |
| `sitemap.xml` | site-root | Alleen de blijvende pagina's (11 stuks), niet de ruim 300 losse puzzels en datums |
| `robots.txt` | site-root | Alles mag, met een verwijzing naar de sitemap |
| `404.html` | site-root | Vriendelijke tweetalige pagina met knoppen naar de Daily en de startpagina |
| `noindex` | instellingen, statistieken, admin, online race, fotoverantwoording, Open AEC, losse puzzels en datums | Deze pagina's horen niet in zoekresultaten |

Alle teksten voor zoekmachines staan op één plek: `tools/seo.py` (de tabel `PAGES`).
Wil je een titel of beschrijving aanpassen, doe het daar en draai daarna:

```bash
python tools/seo.py --bron-bijwerken   # schrijft de kop van index.html opnieuw
python tools/sync_website.py
```

De workflow controleert met `python tools/seo.py --bron-controleren` dat je dat
niet vergeten bent.

### De taalkeuze

- De standaardtaal van het spel is Engels. Daarom is de vaste kop Engels, met
  `<html lang="en">`.
- Kiest een speler Nederlands, dan zet `js/i18n.js` de taal (`lang="nl"`), de titel en
  de beschrijving om naar het Nederlands. De Nederlandse tekst staat in het
  attribuut `data-nl` op het element zelf.
- Er is geen `hreflang`, want er zijn geen aparte adressen per taal. De taal zit
  in de browser van de speler, niet in de URL.

### Gestructureerde gegevens (JSON-LD)

- Startpagina: `WebSite` en `VideoGame` (gratis, 1 tot meerdere spelers, in de browser).
- `how-to-play/`: `FAQPage` met drie vragen. De antwoorden zijn dezelfde tekst als
  op de pagina zelf.
- Overige vaste pagina's: een `BreadcrumbList`.

Let op: Google toont FAQ-resultaten tegenwoordig vrijwel alleen voor overheids- en
gezondheidssites. De gegevens staan er toch, omdat ze geen kwaad kunnen en andere
zoekmachines en AI-samenvattingen ze gebruiken.

### Leesbare tekst zonder JavaScript

- Elke pagina heeft een `<noscript>`-blok met een kopje, een korte uitleg en echte
  links. Bij `how-to-play/` en `about/` staat daar de volledige uitleg in.
- Onderaan de startpagina staat een zichtbaar blok "What is Netto?" met uitleg en
  echte links naar de vaste pagina's. Een gewone klik opent het scherm in de app,
  een zoekmachine volgt de link naar de echte pagina.

### Overig

- `og-image.png` (de afbeelding bij gedeelde links) is nu Engels, passend bij de
  standaardtaal. Opnieuw maken kan met `python tools/maak_deelafbeelding.py`.
- `admin.html` en `stats.html` hebben `noindex` in de pagina zelf.
- De losse hulppagina's `_demo_reveal.html`, `_measure*.html` en `_shot.html` bestaan
  niet (meer) in de repo en worden niet gepubliceerd; er was dus niets te verwijderen.
  Gepubliceerd wordt alleen wat in `tools/sync_website.py` staat.

### Bewuste keuzes

- **Losse puzzels (`puzzles/12/`) en datums (`daily/26-11-12/`) staan op `noindex`.**
  Ze zijn allemaal hetzelfde scherm met een andere puzzel erin; voor Google is dat
  veel bijna-dubbele inhoud. Wil je ze toch laten indexeren, pas dan `meta_for()`
  in `tools/seo.py` aan.
- **De sitemap heeft geen `lastmod`.** De site verandert niet elke dag van inhoud
  als bestand, en een verkeerde datum doet meer kwaad dan geen datum.
- **`admin/` staat niet in `robots.txt`.** Een `Disallow` verhindert dat Google de
  `noindex` leest, en verraadt het adres. `noindex` is hier de betere beveiliging
  tegen vindbaarheid. (Echte beveiliging is de login.)

## Wat alleen de eigenaar kan doen

1. **Google Search Console**
   1. Ga naar <https://search.google.com/search-console> en log in.
   2. Kies "Property toevoegen" en dan **URL-voorvoegsel** met
      `https://b-force-dev.github.io/nettoo/`.
   3. Verifieer. De eenvoudigste manier voor GitHub Pages is de
      **HTML-tag**: Google geeft een `<meta name="google-site-verification" ...>`.
      Zet die in `index.html` (hij blijft staan bij het opnieuw genereren, zolang hij
      buiten het blok `seo:begin ... seo:end` staat), en publiceer.
2. **Sitemap indienen**: in Search Console, "Sitemaps", vul `sitemap.xml` in en
   klik op Verzenden. Controleer na een paar dagen of de status "Geslaagd" is.
3. **Indexering aanvragen**: gebruik "URL-inspectie" voor de startpagina en klik op
   "Indexering aanvragen". Doe hetzelfde voor `how-to-play/`.
4. **Bing**: voeg de site toe op <https://www.bing.com/webmasters>. Je kunt daar de
   Search Console-gegevens in één keer importeren.
5. **Deelvoorbeeld testen**: plak het adres in WhatsApp, Slack of
   <https://www.opengraph.xyz> en kijk of titel en afbeelding kloppen. Een dienst
   onthoudt het oude voorbeeld soms dagen; dat is normaal.

### Een eigen domein (aanbevolen)

Het adres `b-force-dev.github.io/nettoo/` werkt, maar heeft twee nadelen voor
vindbaarheid: Google geeft `robots.txt` alleen aandacht in de root van een domein
(dus niet in `/nettoo/robots.txt`), en een eigen naam wordt eerder onthouden en
aangeklikt.

1. Koop een domein, bijvoorbeeld `netto.game` (kies zelf).
2. In de GitHub-repo: Settings, Pages, "Custom domain". Vul het domein in en zet
   "Enforce HTTPS" aan. Stel bij je domeinregistrar de DNS-records in zoals GitHub
   aangeeft.
3. Pas **één regel** aan in `tools/seo.py`:
   `SITE_URL = "https://jouwdomein.example/"` (met slash aan het eind).
4. Draai `python tools/seo.py --bron-bijwerken` en `python tools/sync_website.py` en
   push. Alle adressen in canonical, deelkaarten, sitemap en robots.txt volgen.
5. Zet de nieuwe site in Search Console als nieuwe property en gebruik daar
   "Adreswijziging" als het oude adres al was geïndexeerd.
6. Optioneel: zet hetzelfde adres in `GEPUBLICEERD` in `js/core.js`. Dat is alleen het
   adres dat in deelknoppen wordt gebruikt als je lokaal speelt.

## Wat meer helpt dan techniek

De techniek staat nu goed; wat nu telt is dat andere sites naar Netto verwijzen.
Zet de link in profielen, op Product Hunt, Reddit (r/WebGames, r/trivia),
Hacker News ("Show HN") en laat de Daily-score delen. Eén goede link doet meer dan
elke extra metatag.
