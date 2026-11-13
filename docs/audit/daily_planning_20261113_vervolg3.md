# Derde vervolg Daily-planning op 13 november 2026

Toegevoegd: **28 december 2026 t/m 10 januari 2027**, veertien Dailies in twee
volledig toegepaste en gecontroleerde transacties van zeven dagen. De planning
loopt vanaf 13 november aaneengesloten tot en met **10 januari 2027**. Het doel
tot 31 januari is niet gehaald: **11 t/m 31 januari (21 dagen) blijft open**.
Daarvoor is geen volledig gecontroleerd voorstel gereed. Er staat geen half
toegepast blok in de database.

De eerste databasecontrole bevestigde dekking tot 27 december en vrije datums
voor de gevraagde periode. De schone werkbranch was na `git fetch origin`
gelijk aan `origin/develop`. De verse volledige inhoudsback-up staat uitsluitend
in `C:\Users\Gebruiker\Netto\.private\daily_backup_before_run_20261113e.json`.
Voorstellen, bronnen, SQL, API-controles en eindvergelijking staan daar onder
`daily_run_20261113e*`; `daily_run_20261113e_resume.md` beschrijft het hervatpunt.

De 42 nieuwe vragen hebben Engelse hoofdtekst, Nederlandse vertaling, eenheid,
bron en uitleg in beide talen. Feiten zijn online gecontroleerd en inhoudelijk
vergeleken met de openbare bibliotheek/FTC/Race en geplande en gearchiveerde
Dailies. Alle antwoorden zijn positieve gehele getallen; alle sommen kloppen.
Alle vier bewerkingstekens komen voor. Er zijn geen foto's toegevoegd.

De week begint toegankelijker; de moeilijkheid blijft een redactionele
inschatting zonder spelerstest. **29 december, 2 en 3 januari en 6 januari**
zijn qua moeilijkheidsbalans het minst zeker. Er is geen open feitelijke twijfel
bij de ingeplande vragen.

Transacties vergrendelden beide inhoudstabellen en controleerden vrije,
toekomstige datums, vraagherhaling, exacte sommen en ongewijzigde bestaande
puzzelrijen. Er zijn veertien puzzelrijen en 42 detailrecords toegevoegd.
Twee categorienamen in uitsluitend deze nieuw ingevoegde details zijn daarna
gecorrigeerd naar de bestaande categorie. De eindvergelijking bevestigt dat
alle 184 oorspronkelijke puzzelrijen en 197 oorspronkelijke detailrecords
exact ongewijzigd zijn. Spelersgegevens, scores, schema, functies, RLS en grants
zijn niet gewijzigd.

Na beide blokken slaagden de publieke anon-API-controles: vandaag wordt geleverd
zonder antwoorden of uitleg, toekomstige vragen blijven verborgen en toekomstige
inzendingen worden geweigerd. Een gastinzending voor vandaag geeft tweetalige
uitleg met `ranked=false`; rechtstreeks lezen van de puzzeltabel en view blijft
geweigerd. De database-eindcontrole bevestigt geen dubbele datums of onjuiste
sommen in de toegevoegde reeks en precies 21 resterende datums.

De live Daily is in de browser met Engelse en Nederlandse taalinstelling bekeken.
De bestaande live vertaalbeperking blijft zichtbaar: de Nederlandse interface
toont Engelse vraagteksten. Dit is ook in het eerste verslag beschreven en valt
buiten deze aanvulling. De geopende controletab is gesloten.

`node tests/daily-reliability.cjs` en `node tests/daily-server.cjs` zijn geslaagd.
Alleen dit verslag is in de repo toegevoegd. Er zijn geen frontendbestanden,
cacheversies of bestanden in `website/` gewijzigd. Er is niet gepusht.
