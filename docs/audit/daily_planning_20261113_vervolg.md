# Vervolg Daily-planning op 13 november 2026

De productieplanning is aangevuld voor **27 november t/m 6 december 2026**.
Vanaf vandaag staat daarmee **13 november t/m 6 december 2026** aaneengesloten
ingepland. Het doel tot en met 27 december is niet gehaald.

De eerste databasecontrole bevestigde dat alleen 13 t/m 26 november klaarstond.
De afgebroken vervolgpoging had geen dagen toegevoegd. De werkbranch was na
`git fetch origin` gelijk aan `origin/develop`; er was geen ongecommit werk.

Er zijn tien nieuwe puzzelrijen toegevoegd, in twee transacties: zeven dagen
en daarna drie dagen. Er zijn geen reserves hergebruikt. De eerdere voorstellen
zijn opnieuw gecontroleerd en bewerkt; ze waren geen vooraf goedgekeurde inhoud.
Veel reserves bevatten herhaalde onderwerpen of onvoldoende scherpe feiten.
Voor de resterende periode is geen volledig gecontroleerd voorstel gereedgekomen.

De tien puzzels bevatten drie vermenigvuldigingen, drie aftrekkingen, twee
optellingen en twee delingen. De dertig vragen gebruiken zeventien bestaande
categorieën: geschiedenis (5), sport (4), spellen en speelgoed, politiek en
recht, natuurkunde, sterrenkunde en ruimte, boeken en literatuur en technologie
(ieder 2), en eten en drinken, taal, vervoer, kunst en cultuur, economie en geld,
biologie en gezondheid, milieu en duurzaamheid, muziek en dieren (ieder 1).
De moeilijkheid en het weekritme zijn redactioneel ingeschat, niet met spelers
getest. Redactioneel verdienen 4 en 6 december de meeste aandacht voor de
moeilijkheidsbalans; er is geen open feitelijke twijfel bij een ingeplande dag.

Alle dertig feiten zijn op 13 november opnieuw op het web gecontroleerd.
De Engelse vraagtekst staat voorop, met een Nederlandse equivalent, afbakening,
eenheid, uitleg in beide talen en een bron. De sommen kloppen exact met positieve
gehele getallen. Onderwerpen zijn vergeleken met alle reeds gedateerde Dailies.

Er zijn veertien Commons-beelden opgenomen bij de nieuwe vragen. De eerder
vandaag gedownloade bestanden en bijbehorende makers- en licentiegegevens zijn
gecontroleerd. Originelen op contactbladen en vierkante uitsneden zijn bekeken.
Onjuiste onderwerpen, afgesneden onderwerpen en een beeld dat het antwoord
verraadt zijn afgewezen. Zestien vragen hebben geen goedgekeurd beeld.
Er zijn geen foto's aan de oudere planning toegevoegd, omdat de gevraagde
volledige periode nog niet gedekt is.

De verse volledige back-up van beide inhoudstabellen, voorstellen, SQL,
beeldbeoordelingen en verificaties staan uitsluitend privé in
`C:\Users\Gebruiker\Netto\.private\` onder de naam `daily_*20261113c*`.
De voorstellen en SQL zijn vóór iedere transactie opgeslagen. Iedere transactie
gebruikt dezelfde tabelvergrendelingen en controles op vrije datums, gewijzigde
reserves, genormaliseerde vraagherhaling en exacte sommen als de eerdere run.
Een extra vergelijking binnen de transactie beschermt alle bestaande gedateerde
puzzelrijen.

De eindvergelijking met de verse back-up bevestigt dat alle 153 oorspronkelijke
puzzelrijen en alle 104 oorspronkelijke detailrecords exact ongewijzigd zijn.
Er zijn alleen tien puzzelrijen en dertig detailrecords ingevoegd. Spelers,
scores, schema, RLS en grants zijn niet gewijzigd.

Na beide batches zijn met de publieke anon-key via HTTPS gecontroleerd:

- Vandaag wordt daadwerkelijk geleverd, zonder antwoorden, bronnen of uitleg.
- De volledige vrijgegeven vragenlijst bevat geen toekomstige dagen.
- Inzendingen voor alle toekomstige ingeplande dagen worden geweigerd.
- Een gastinzending voor vandaag geeft antwoorden, bronnen en uitleg in beide
  talen terug, met `ranked=false`.
- Direct lezen van beide publieke puzzeltabellen/views blijft geweigerd.

`node tests/daily-reliability.cjs` en `node tests/daily-server.cjs` zijn geslaagd.
Er zijn geen frontendbestanden, cacheversies of bestanden in `website/` gewijzigd.
Er is geen push uitgevoerd.

Open datums: **7 t/m 27 december 2026**.
