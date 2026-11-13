# Tweede vervolg Daily-planning op 13 november 2026

De productieplanning is aangevuld voor **7 t/m 27 december 2026**. Vanaf
vandaag staat **13 november t/m 27 december 2026** aaneengesloten ingepland:
45 dagen, zonder gaten of dubbele datums. De eerste databasecontrole bevestigde
dat 7 december de eerste ontbrekende datum was.

Na `git fetch origin` was de schone werkbranch gelijk aan `origin/develop`.
Er zijn 21 nieuwe puzzels gemaakt, in drie afzonderlijke transacties van zeven
dagen. Er zijn geen reserves hergebruikt. Alle voorstellen en SQL zijn voor
uitvoering privé opgeslagen; iedere batch is toegepast en publiek gecontroleerd
voordat de volgende werd voorbereid.

De nieuwe reeks bevat vijf optellingen, vijf delingen, zeven aftrekkingen en
vier vermenigvuldigingen. De 63 vragen gebruiken twintig bestaande categorieën:
muziek en films/series (ieder 7), eten/drinken, natuurkunde en
filosofie/psychologie/religie (ieder 5), biologie/gezondheid, spellen/speelgoed,
sport en technologie (ieder 4), ruimte (3), dieren, geografie, geschiedenis,
taal en boeken/literatuur (ieder 2), en kunst/cultuur, economie/geld,
scheikunde, vervoer en milieu/duurzaamheid (ieder 1).

Alle feiten zijn op 13 november online gecontroleerd. De vragen hebben een
Engelse hoofdtekst met Britse spelling, een Nederlandse equivalent, eenheid,
duidelijke afbakening, bron en uitleg in beide talen. Historische uitgaven,
traditionele tellingen en regels zijn expliciet afgebakend. Alle sommen kloppen
exact met positieve gehele getallen. De onderwerpen zijn inhoudelijk vergeleken
met alle reeds gedateerde Dailies en met elkaar. De weekopbouw begint doorgaans
toegankelijker. De kerstdagen hebben passende inhoud. De moeilijkheid is een
redactionele inschatting, geen resultaat van een spelerstest.

Er zijn zestien Commons-foto's opgenomen. Maker, bronpagina en PD-, CC0-,
CC BY- of CC BY-SA-licentie zijn vastgelegd. De bestanden zijn gedownload en
bekeken, inclusief vierkante uitsneden. Verkeerde onderwerpen, onduidelijke
makersgegevens, tekstpanelen en verwarrende beelden zijn afgewezen.
Bij 47 vragen blijft het beeld leeg.

De verse volledige back-up van beide inhoudstabellen staat uitsluitend privé
in `C:\Users\Gebruiker\Netto\.private\daily_backup_before_run_20261113d.json`.
Het dossier, de drie uitgevoerde SQL-batches, beeldbeoordelingen en
API-verificaties staan daar onder `daily_run_20261113d*`.

Iedere transactie vergrendelt beide inhoudstabellen en controleert vrije
datums, ongewijzigde reserves, genormaliseerde vraagherhaling, exacte sommen
en beschermde rijen. Alleen nieuwe puzzelrijen en detailrecords zijn ingevoegd.
De eindvergelijking bevestigt dat alle 163 oorspronkelijke puzzelrijen en alle
134 oorspronkelijke detailrecords exact ongewijzigd zijn. Er zijn precies
21 puzzelrijen en 63 detailrecords toegevoegd. Spelers, scores, schema, RLS en
grants zijn niet gewijzigd.

Na iedere batch zijn met de publieke anon-key via HTTPS gecontroleerd:

- Vandaag wordt geleverd zonder antwoorden, bronnen of uitleg.
- De vrijgegeven vragenlijst bevat geen toekomstige dagen.
- Inzendingen voor alle toekomstige ingeplande dagen worden geweigerd.
- Een gastinzending voor vandaag levert antwoorden en uitleg in beide talen,
  met `ranked=false`.
- Rechtstreeks lezen van de puzzeltabel en publieke view blijft geweigerd.

`node tests/daily-reliability.cjs`, `node tests/daily-server.cjs` en
`git diff --check` zijn geslaagd. Er zijn geen frontendbestanden, cacheversies
of bestanden in `website/` gewijzigd. Er is geen push uitgevoerd.

Open punten: geen ongeplande datums binnen de gevraagde periode en geen open
feitelijke twijfel. Voor de redactionele moeilijkheidsbalans verdienen
**21, 26 en 27 december 2026** de meeste aandacht.
