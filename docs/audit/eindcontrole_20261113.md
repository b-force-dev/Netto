# Eindcontrole Netto — 13 november 2026

## Uitgangspunt en aanpak

- Branch: `t3/integration-journey-test`, begonnen op `origin/develop` (`dc3a325`). `AGENTS.md` gelezen, `git fetch origin` uitgevoerd. De werkmap was schoon en de branch stond gelijk aan develop.
- Zelf getest en hersteld, zonder andere agents. Niets gepusht.
- Chrome op Windows via `puppeteer-core`, geïnstalleerd buiten de repo. De preview-browser gaf tweemaal `Preview automation snapshot timed out after 15000ms`; daarom de door de opdracht toegestane fallback gebruikt.
- Bron geserveerd met Python op 127.0.0.1:8765. Daarnaast `website/` naar een tijdelijke map gekopieerd en gewijzigde bronbestanden daarover gekopieerd. `tools/bouw_routes.py --site <tijdelijke map>` maakte 700 echte routepagina's; getest op poort 8766.
- `website/`, cacheversies en de uitgesloten data-, vragen- en fotobestanden zijn niet gewijzigd. De SEO-bron is aangepast in `tools/seo.py` en met `--bron-bijwerken` gegenereerd; het gemarkeerde HTML-blok is niet handmatig bewerkt.

## Gevonden en hersteld

| Probleem | Herstel |
| --- | --- |
| Daily accepteerde decimalen tot aan de serveraanroep, terwijl de RPC positieve veilige gehele getallen vereist. | Daily controleert nu `Number.isSafeInteger` en groter dan nul vóór de aanvraag. Een lokale melding legt hele getallen en `1.5k` / `1,5k` uit. Geen stil afronden. |
| De parser accepteerde lokale scheidingstekens en k/m/b, maar oude toetsenfilters in Daily en de gedeelde Race/Connection-handler blokkeerden die bij typen. Plakken gedroeg zich daardoor anders. | Filters verwijderd. Typen en plakken gaan door dezelfde parser; foutieve volledige invoer wordt bij inleveren afgewezen. Enter blijft naar het volgende veld gaan. |
| De toast “Filled in for you” kon tijdens de reveal blijven staan. | De specifieke automatische-invultoast wordt vóór de Daily-reveal verwijderd. |
| Tour gebruikte een verouderd derde argument voor `bindWholeNumberInput` en een extra, afwijkend invoerpatroon. | Overbodig argument en tweede patroon verwijderd; gedeelde parser en expliciete controle voor gehele oefenantwoorden behouden. |
| Tour telde honden- en mensenpoten, terwijl de hero een ander voorbeeld gebruikte. | Tour en how-to-play gebruiken nu hetzelfde voorbeeld als de hero: spin 8, voetbalteam op het veld 11, standaardpiano 88; 8 × 11 = 88. Oefenuitslag en bronlink aangepast. |
| Home zei “Three questions”, Daily zei “Three answers”, ook na een dynamische update. | De Daily-kop in HTML én de eigenaar in JavaScript gelijkgetrokken met home en tour. |
| SEO-uitleg gebruikte nog 4 × 2 = 8. | Voorbeeld in de generator veranderd naar 8 × 11 = 88 en bron opnieuw gegenereerd. De score blijft overal de gemiddelde afwijkingsfactor: 1× exact; nauwkeurigheid = 100% / factor. |
| How-to-play bevatte kapotte leestekens: `don?t`, `You?ll`, `today?s`, `1.00?`, en een pijl als vraagteken. | Leestekens, vermenigvuldigingstekens en pijl hersteld, in beide talen waar nodig. |
| Engelse Race-keuzeknoppen toonden Nederlandse decimale komma's. | Vertalingen voor de losse factorteksten toegevoegd. |
| Race-foutmelding eiste hele getallen, terwijl vrij spelen decimalen accepteert. | Melding afgestemd op de bestaande lokale spelregels. Alleen Daily vereist hele getallen voor de server; Library, Race en Connection mogen positieve decimalen gebruiken. |
| Gedeelde puzzelreview en Connection-meldingen gebruikten punten voor factoren in Nederlands. | Bestaande lokale factorformatter gebruikt; Nederlandse uitleg gebruikt 1,00×. |
| Voorleeslabel “Jouw cijfers” bleef Nederlands op de Engelse terugkeerpagina door `data-i18n-skip`. | Eigenaar `home.js` zet nu het taalafhankelijke label. |
| Toastkoppen “Gekopieerd!” en “Cijfers gevraagd” waren hardcoded Nederlands. | Taalkeuze toegevoegd. De oude cijferfilter wordt bovendien niet meer gebruikt voor normale tekstinvoer. |
| Tracking registreerde een eerste bezoek zonder opgeslagen taal als Nederlands, terwijl de interface Engels is. | Standaard Engels; Nederlands alleen bij expliciete keuze. Regressiecontrole voor beide gevallen toegevoegd. |
| Kettingscores ontbraken op `stats.html`. | Aparte tab “Chains” / “Kettingen”, leest `netto_chain_plays` en de bestaande vier-vragenbank. Werkelijk gespeeld resultaat gecontroleerd: 1 puzzel, 4 antwoorden, 100% nauwkeurigheid. |
| `offline.html` veroorzaakte een ontbrekende `favicon.ico`-aanvraag. | Zelfstandige lege data-favicon toegevoegd, geschikt voor diepe offline-adressen. |

## Browsercontroles

De brede ronde omvatte 248 schermregistraties. Een tweede ronde controleerde het afgeronde resultaat en vervolgstappen opnieuw in alle acht combinaties: 390×844 en 1440×900, Engels en Nederlands, licht en donker. Elke pagina had listeners voor JavaScript-fouten en mislukte aanvragen; de brede ronde registreerde ook HTTP-fouten. Screenshots en ruwe logs staan alleen in de tijdelijke testmap, niet in Git.

- Eerste bezoek: home, niet-blokkerende tourchip, drie oefenstappen, oefenscore, door naar Daily, schattingen, afwijzing van decimalen, serverinzending, reveal, resultaat, delen en volgende puzzels.
- In beide talen: 1500, lokale duizendtallen, lokale k-notatie, decimalen en onzin via parser en Daily-validatie. Er is aanvullend een proef met echte toetsenbordinvoer uitgevoerd; de nieuwe regressietest bewaakt afwijzing vóór de servergrens.
- Daily: echte anonieme serverresultaten, opslag, herladen, hersteld resultaat en terugkeer-home. Geen accountscore geplaatst.
- Reveal overslaan via Escape en directe knopactie. Delen via klembord gecontroleerd: score, gekleurde blokken, streak en echte Daily-link; geen antwoorden in de deeltekst. Geen bericht naar iemand verstuurd.
- Installatiehint verschijnt onder het resultaat na een gesimuleerd `beforeinstallprompt`; kalenderhint zichtbaar. Geen echte app geïnstalleerd en geen agenda gewijzigd.
- Echte routes: `/daily/`, `/daily/26-11-12/`, `/daily-archive/`, `/puzzles/`, `/puzzles/1/`, `/connections/`, `/connections/1/`, `/connections/chains/1/`, `/race/`, `/race/online/`, `/live-rounds/`, `/how-to-play/`, `/about/`, `/photo-credits/`, `/submit-question/`, `/settings/`, `stats.html`, kettingstatistieken, `404.html`, `offline.html`.
- Library: puzzel ingevuld en exact resultaat/review bekeken. Ketting: vier antwoorden ingevuld, resultaat opgeslagen en teruggevonden in statistieken. Connection: zowel een goed als een fout gekozen verband met exacte schattingen getest; de uitleg maakt onderscheid tussen verband en schatfactor.
- Race solo: echte start en aftelling, puzzel ingevuld, punt en review, eindscherm en opgeslagen statistieken. Voor het einde is alleen de klok in de testpagina vooruitgezet; niet drie of vijf minuten gewacht.
- Duel- en Live Rounds-lobby's, beschikbare instellingen en formulierweergave bekeken. Geen openbare kamers aangemaakt.
- Statistiekenmodal en login geopend en met Escape gesloten. Focus keert terug naar respectievelijk `statsButton` en `topbarUserBtn`. Geen achtergebleven blokkade bij de vervolgnavigatie.
- Geen horizontale documentoverloop in de gecontroleerde schermen. Geen JavaScript-excepties in de afgeronde matrixrondes. Geen zichtbaar Nederlands in de Engelse speltekst gevonden; het gevonden Nederlandse voorleeslabel is hierboven hersteld.
- `?sw=1`: registratie en controller gecontroleerd, diepe online routes geladen. Aanvullend een eigen tijdelijke server op poort 8767 daadwerkelijk gestopt: een nieuwe diepe navigatie toonde correct “You're offline” via de worker. Online hervatten werkte op de andere testserver. De worker gebruikt netwerk eerst voor HTML en volledige URL's inclusief versie voor assets; geen wijziging aan de worker nodig gevonden.
- Tracking-aanroepen in de bron vergeleken met de whitelist in `supabase/usage_events.sql`: alle gebruikte eventnamen en spelmodi passen. Tracking blijft op localhost uitgeschakeld; de RPC is niet live met fictieve gebeurtenissen gevuld.

## Niet hersteld of niet volledig vast te stellen

- Duel-lobby meldde tijdens de browserronde “Connection interrupted”. De oorzaak (backend/realtime of testomgeving) is niet vastgesteld. Geen multiplayerfix zonder betrouwbare tweede speler of serverbewijs. Live Rounds toonde geen open kamers; een volledige partij met meerdere spelers is niet getest.
- Echte OS-deelmenu's, native installatie, virtueel telefoontoetsenbord en echte touchapparaten zijn niet getest. Chrome gebruikte telefoonemulatie; delen via klembord en de installatiehint zijn wel getest.
- Een eerste pointerklik op “Skip” tijdens automatisch scrollen landde in de automatisering niet betrouwbaar op de knop. Escape en directe knopactie werkten. Geen wijziging zonder stabiele reproductie van een fout in de knop zelf.
- In de screenshots lijkt de kleine Breaking Bad-foto in de Daily sterk afgesneden. Geen mislukte afbeeldingaanvraag gemeten. Fotokeuze en uitsnede zijn ter beoordeling van de foto-agent; de uitgesloten fotobestanden zijn niet aangepast.
- Account/login en inzendformulier alleen geopend en visueel/functioneel op bereikbaarheid gecontroleerd; geen registratie, e-mail, wachtwoordreset of echte vraaginzending verstuurd.
- Niet elke puzzel en elk archiefitem is inhoudelijk gevalideerd. Data, puzzels, vragen en fotocredits vallen buiten deze opdracht om te wijzigen. Er is geen afzonderlijk zichtbaar “What is Netto?”-tekstblok onder home aangetroffen; wel de hero en de SEO/noscript-uitleg. Geen nieuw blok toegevoegd.
- Dit is geen certificering voor alle browsers of alle CSS-conflicten. De controles gelden voor de genoemde Chrome-matrix en steekproeven.

## Geautomatiseerde eindcontroles

Geslaagd:

- `node tests/daily-reliability.cjs`
- `node tests/daily-server.cjs`
- `node tests/usage.cjs`
- `node tests/puzzle-library.cjs`
- `node tests/integration-input.cjs` (nieuw: ongeldige Daily-invoer stopt vóór vergelijking/server; geldige locale invoer gaat door)
- `python tools/seo.py --bron-controleren`
- `git diff --check`

De bekende browserloze tests `find-connection.cjs` en `frontend_details.cjs` zijn niet als eindpoort gebruikt. De integrator moet na samenvoegen cacheversies verhogen en `website/` synchroniseren; dat is hier op verzoek niet gedaan.
