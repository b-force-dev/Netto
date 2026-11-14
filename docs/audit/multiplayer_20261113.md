# Multiplayercontrole — 13 november 2026

## Opstelling en grenzen

Chrome via tijdelijk geïnstalleerde puppeteer-core 25.17.0, buiten de repo.
Iedere speler kreeg een eigen BrowserContext zonder account, cookies of gedeelde
opslag. Telefoonweergave: 390×844, met touch-emulatie. Dit zijn onafhankelijke
browserclients met echt Supabase Realtime, geen nagebootste tegenstanders.
Geen echte telefoon, virtueel telefoontoetsenbord of OS-deelmenu getest.

De checkout was schoon en gelijk aan origin/develop na git fetch.
Bron geserveerd met `python -m http.server 8947 --bind 127.0.0.1`.
Voor diepe links zijn alleen tijdelijke, genegeerde route-ingangen gemaakt met
de bestaande make_entry-helper; geen websitekopie of cacheversies gewijzigd.

## Wat is gespeeld

- Lokaal: twee gasten, Audit Alex en Audit Bo, in een gesloten 1v1-room.
  Host maakte de room; de tweede speler opende de uitnodigingslink en hoefde
  alleen een naam in te vullen. Code was vooraf ingevuld; beide namen verschenen.
  Host startte. Beide clients kregen seed 3379044426 en dezelfde eerste puzzel.
  Beide spelers dienden een correct antwoord in. De volledige vijfminutenklok
  liep door, inclusief refresh/herstel en een bewust verbroken websocket.
  Score en oorspronkelijke deadline bleven behouden na herstel.
  Beide eindschermen toonden 1–1, met elkaars correcte eindscore. Beide spelers
  kozen revanche: dezelfde room B6Q46H, nieuwe gedeelde seed 261153887 en
  beide scores weer nul. Daarna zijn de eigen spelers uit de room vertrokken.
- Lokaal: drie extra, onafhankelijke gastprofielen op een Live-uitnodiging.
  Alle drie bereikten de accountgrens; geen anoniem account aangemaakt en geen
  Live-room in productie geschreven. Een echte Live-partij met drie gasten is
  met de huidige productie-instelling onmogelijk. De code ABC234 was een
  syntactisch geldige testuitnodiging, geen claim dat er een echte host wachtte.
- Live-site, oude main-frontend: gast op `/race/online/` reproduceerde
  “Connection interrupted”. Room maken opent daar het gewone loginvenster.
  Die frontend heeft nog geen nettoInviteUrl/gastduelflow. Een complete partij
  met verse accountloze spelers op main kon daarom niet worden uitgevoerd.
  Geen accountregistratie, productie-instellingen of spelersgegevens gewijzigd.
- De oude live-Live-pagina ook met drie onafhankelijke gasten geopend:
  `?join=ABC234` wordt daar nog niet vooraf ingevuld of automatisch afgehandeld.
  De spelers komen op de algemene lobby terecht. Dit verschil hoort bij main;
  de nieuwe frontend verwerkt deze uitnodiging wel.

## Oorzaak van de onderbreking

De exacte weergave zit in `renderOpenGames()` in js/race.js:
geen supabaseClient **of** raceLobbyFout geeft “Connection interrupted”.
De tweede vlag wordt gezet bij CHANNEL_ERROR/TIMED_OUT van de discovery-lobby.
Dit zegt dus niet dat de eigen duelroom stuk is.

Op main is de eerste oorzaak reproduceerbaar: router opent de online-tab voordat
de deferred Supabase-library/client klaar is. ensureRaceLobby keert stil terug.
Na load bestaat de client wel, maar zonder nieuwe poging blijven de kanalen leeg
en blijft de fouttekst staan. Geen mislukte requests, CORS- of authfout gemeten.
Dat verklaart de gereproduceerde melding; zonder de oude testeropname is niet
bewezen dat diens specifieke eerdere sessie precies dezelfde trigger had.

Daarnaast zat er een echte race in de nieuwe frontend: switchRaceMode roept
ensureRaceLobby aan en vervolgens refreshOpenGames, dat dit opnieuw doet.
Zolang de eerste subscribe nog bezig is, werd dat kanaal verwijderd en vervangen.
De opname toont phx_join → phx_leave → phx_join binnen milliseconden, gevolgd
door succesvolle serverantwoorden en phx_close voor het verwijderde kanaal.
Dat is clientgedrag; geen bewijs voor een backendstoring of een rate limit.
Een foutcallback maakte bovendien het kanaal null zonder automatische retry.

## Herstel

- Lobby wacht bij opstart op de client en verbindt daarna vanzelf.
- Eén lobbykanaal tegelijk, ook tijdens joining en verwijderen. Oude callbacks
  kunnen de nieuwe verbinding niet overschrijven. CLOSED wordt ook afgehandeld;
  de CLOSED-callback tijdens removeChannel veroorzaakt geen recursie.
- Automatische lobbyretry na 1, 2, 4, 8, 16, maximaal 30 seconden. Geslaagde
  subscribe zet de teller terug. Duidelijke EN/NL-tekst “Reconnecting…” en
  “Retry now”; beide spelmodi delen dit herstel.
- Duelroom krijgt eveneens begrensde backoff en een retryknop. Opnieuw subscribe
  publiceert presence en hello, zodat de bestaande start/score weer wordt gedeeld.
  Start is alleen beschikbaar bij een aangesloten roomkanaal.
- Bewust afsluiten van de echte websocket toonde de hersteltekst en retryknop;
  daarna kwam het duel vanzelf terug met dezelfde score en deadline.
  De discovery-lobby herstelde ook automatisch en via de retryactie.
- Nieuwe regressietest bewaakt loadherstel, dubbele ensure-aanroepen, late
  callbacks, CLOSED-recursie, oplopende wachttijd en handmatige retry.

## Wat een gast ziet en kan

Nieuwe frontend: 1v1 werkt zonder Auth-account, met alleen een schermnaam en
publieke Realtime-presence/broadcast. Dat is geen servergecontroleerd duel of
anticheatsysteem. Live Rounds gebruikt de server en heeft nu een gratis account
nodig. De reeds aanwezige accountmelding is aangevuld met een directe keuze
“Play 1v1 without an account” / “Speel 1v1 zonder account”. De onhoudbare belofte
dat aanmelden een halve minuut duurt is vervangen door uitleg over mogelijke
e-mailbevestiging.

De Live-code blijft in sessionStorage staan tot aansluiten. Inloggen opent de
bestaande login/registratie; de bevestigings-URL bevat dezelfde roomcode, ook
als de e-mail in een nieuwe tab wordt geopend. Een Auth-sign-in-event hervat
de uitnodiging buiten de Auth-callback. Loginvenster, bewaarde code en
bevestigings-URL zijn in de browser gecontroleerd; een echte registratie en
e-mailbevestiging zijn niet verstuurd en die volledige keten is niet bewezen.

EN- en NL-accountmelding op 390×844 gecontroleerd, zonder horizontale overflow.
Deeltekst gecontroleerd aan de grens met NettoShare.deliver:
`Race me in Netto! Code B6Q46H <uitnodigingslink>`.
De link bevat één join-code en opent de juiste modus. Het echte OS-deelmenu
is niet geautomatiseerd. Lokale uitnodigingen blijven lokaal voor deze test.

## Supabase-inspectie, alleen lezen

Project bqatnnouxkjdzvvhqbly. Browser-GET `/auth/v1/settings` gaf voor alle drie
gasten `external.anonymous_users: false`. Via MCP de live RPC-definitie, grants,
RLS en relevante logs gelezen. public.live_rounds is alleen uitvoerbaar door
postgres/authenticated en controleert auth.uid(). Alle vijf netto_live-tabellen
hebben RLS; er zijn geen directe policies in netto_live of realtime.
De RPC controleert lidmaatschap en hostrechten. De gebruikte Realtime-joins zijn
publiek (`private:false`); succesvolle phx_reply/presence bevestigen dat deze
gastduels geen anonieme Auth-login nodig hebben.

De geraadpleegde Realtime-logs bevatten geen error/limit/denied-meldingen.
Geen volledige dashboardconfiguratie beschikbaar via deze MCP: niet beweren
dat alle Realtime-limieten, originregels of historische storingen uitgesloten zijn.
Er is geen aanwijzing voor serviceworker-, localhost-, CORS- of rate-limitfalen
in deze succesvolle lokale duels. Console, mislukte requests en websocketframes
zijn buiten de repo opgenomen. Aanvankelijke lokale 404's kwamen door ontbrekende
gegenereerde route-ingangen; ook de gemeten raceState-referencefout hoorde bij
die onvolledige testserver, niet bij het geladen spel. Geen mislukte
netwerkrequests in de geldige spelroutes gemeten.
De laatste opname telde 291 websocketframes, nul requestfailed-events en één
genoemde referencefout tijdens de onvolledige lokale routeopstelling.
Ruwe opname: `%TEMP%/netto-multiplayer-20261113/browser-log.json`.

## Besluit voor de eigenaar: anonieme Auth aanzetten?

Niet gewijzigd. Aanzetten maakt echte auth.users en sessies voor gasten, zonder
e-mail/wachtwoord. De afzonderlijke Live-client gebruikt zijn eigen opslagsleutel;
Daily en het gewone account blijven in de UI uitgelogd. De bestaande Live-RPC
zou daarmee een auth.uid krijgen en kan in beginsel guests toelaten. Dat moet
na een bewuste instellingwijziging nog met drie echte gasten worden bewezen.

Voordeel: een vriend kan met alleen een naam aansluiten; geen registratie- of
e-mailbarrière. Hervatten werkt zolang de gastsessie op hetzelfde apparaat blijft.
Nadelen: anonieme gebruikers hebben de Postgres-rol authenticated, dus bestaande
RPC's en policies die alleen die rol controleren kunnen ook voor gasten werken.
Een aparte frontendclient is geen beveiligingsgrens. Eerst alle relevante
accountfuncties/policies beoordelen op uid/eigenaarschap en zo nodig is_anonymous.
Meer wegwerpaccounts geeft misbruik-, opslag- en gebruikskosten. CAPTCHA en
passende rate limits vragen een productkeuze en clientondersteuning. Opruimen en
bewaartermijnen moeten worden geregeld. Na gewiste browserdata/een ander apparaat
kan een gast zijn identiteit niet vanzelf terugkrijgen; accountconversie is hier
niet gebouwd.

Bron: [Supabase Anonymous Sign-Ins](https://supabase.com/docs/guides/auth/auth-anonymous).
De changelog is gecontroleerd; geen SDK-upgrade uitgevoerd.

## Verificatie

Geslaagd: daily-reliability, daily-server, usage, puzzle-library,
integration-input, multiplayer-reliability; alle bestaande tools/test_live_*.cjs
(lobby, acht create-combinaties, overgangen en 16 databasetests met tijdelijke
PGlite-installatie buiten de repo). Ook syntax en git diff --check gecontroleerd.
Geen push. Cacheversies en website/ moeten nog door de integrator worden bijgewerkt.
