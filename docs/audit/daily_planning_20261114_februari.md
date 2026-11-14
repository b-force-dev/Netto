# Daily-planning februari 2027

De productieplanning is aangevuld voor **1 t/m 28 februari 2027**. Er zijn
28 nieuwe puzzelrijen en 84 nieuwe detailrecords toegevoegd, in vier volledige
transacties van zeven dagen: 1–7, 8–14, 15–21 en 22–28 februari.

De planning loopt vanaf **13 november 2026 aaneengesloten t/m 28 februari 2027**:
108 dagen, zonder gaten of dubbele datums in deze reeks. De eindcontrole
bevestigt dat alle nieuwe datums uitsluitend binnen de gevraagde periode vallen.

De schone werkbranch was na `git fetch origin` gelijk aan `origin/develop`.
Supabase-toegang en invoegrechten zijn vooraf gecontroleerd. Vóór iedere
invoerpoging was een volledige back-up van beide inhoudstabellen beschikbaar.
Direct vóór invoer is bevestigd dat de database nog exact gelijk was aan die
back-up. Alle **219 oorspronkelijke puzzels en 302 oorspronkelijke
detailrecords zijn na afloop exact ongewijzigd**, inclusief ongedateerde
reserves en tijdstempels. Het eindtotaal is 247 puzzels en 386 detailrecords.

De 84 nieuwe vragen hebben Engelse hoofdtekst, Nederlandse tekst, uitleg in
beide talen, eenheid en gecontroleerde bron. Ze gebruiken 19 bestaande
categorieën. Alle antwoorden zijn positieve gehele getallen en alle sommen
kloppen exact. Iedere bewerking komt zevenmaal voor, verspreid over de weken.
De feiten zijn inhoudelijk vergeleken met de volledige bestaande inhoud,
beide historische inhoudsarchieven en de openbare vraagsets. Herhalende
kandidaten zijn vóór invoer vervangen; binnen februari wordt geen feit herhaald.
De bekende bestaande herhaling in januari is niet aangepast of opnieuw gebruikt.
Er zijn geen nieuwe beelden opgenomen. Moeilijkheid blijft een redactionele
inschatting zonder spelerstest.

Iedere transactie vergrendelde beide inhoudstabellen en controleerde vrije,
toekomstige datums, aantallen, vraagherhaling, exacte sommen en ongewijzigde
bestaande inhoud. Alleen nieuwe rijen zijn ingevoegd. Een eerste poging is
volledig teruggedraaid; daarna is vastgesteld dat nog nul februari-dagen waren
toegevoegd. Vervolgens zijn alle vier blokken volledig toegepast en gecontroleerd.
Er staat geen half toegepast blok in de database.

Na ieder blok slaagden de publieke anon-API-controles: vandaag zonder
antwoorden, bronnen of uitleg; toekomstige vragen verborgen; toekomstige
inzendingen geweigerd; gastresultaat met tweetalige uitleg en `ranked=false`;
rechtstreekse tabel- en viewlezingen geweigerd. Spelersgegevens, scores, schema,
functies, RLS, grants en instellingen zijn niet gewijzigd. Anonieme aanmeldingen
zijn niet ingeschakeld.

Back-up, volledige redactie, antwoorden, bronnen, SQL, API-uitvoer en
eindvergelijking staan uitsluitend in de git-genegeerde absolute privémap
`C:\Users\Gebruiker\Netto\.private\`, onder `daily_*20261114_februari*`.
Het volledige privéverslag is `daily_run_20261114_februari.md`.

`node tests/daily-reliability.cjs`, `node tests/daily-server.cjs` en
`git diff --check` zijn geslaagd. Er zijn geen frontendbestanden gewijzigd;
cacheversies en `website/` zijn daarom niet aangepast. Alleen dit antwoordvrije
verslag is lokaal gecommit. Er is niet gepusht en niets naar `main` gebracht.

Open: geen ontbrekende datums binnen februari. De volgende ongeplande dag is
**1 maart 2027**, buiten deze opdracht. De bestaande redactionele herhaling in
januari en de niet met spelers geteste moeilijkheidsbalans blijven open.
