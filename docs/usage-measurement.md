# Bezoekersmeting

Voer `supabase/usage_events.sql` eenmaal uit op een database met het bestaande
`netto_private`-schema en `public.is_admin()`. De migratie voegt uitsluitend
objecten toe en stopt bij een naamconflict. Deze migratie is op 12 november 2026
toegepast op project `bqatnnouxkjdzvvhqbly`; voer hem daar niet opnieuw uit.

Log als bestaande admin in op `admin.html`. **Bezoekers** toont de laatste 30
dagen, inclusief lege dagen, met de daggrens van Europe/London:

- Uniek = verschillende browsercodes met een bezoekevent; nieuw = eerste
  gemeten bezoekdag; terug = een eerdere gemeten bezoekdag bestaat.
- Start/klaar per modus = getelde spelacties. Daily- en archiefstarts sluiten
  lokaal reeds afgeronde puzzels uit. Puzzelstarts en -finishes worden binnen
  dezelfde pagina per puzzel/dag ontdubbeld, races per race. Het is geen strikt
  gekoppelde sessiefunnel; herladen kan extra spelacties geven.
- D1/D7 = terugkerende browsercodes / nieuwe browsercodes uit die dagcohort,
  op exact 1 of 7 dagen later. Pas zichtbaar nadat de hele terugkomdag voorbij is.
- Delen = deelpogingen (score/statistieken), niet bewezen verstuurde berichten.
  Uitleg = een spel kiezen onderaan de uitleg; install = browser-appinstalled-event.
- Herkomst = alleen externe hostnaam bij bezoek, nooit pad, zoekterm of poort.

De meting draait op de spelpagina en maakt geen tweede Supabase-client aan.
De zelfstandige `stats.html` leest alleen lokale spelresultaten en krijgt geen
extra backendclient. De bestaande adminclient wordt ook hergebruikt.

De browser bewaart één willekeurige UUID en de eerste bezoekdag in localStorage.
De eventtabel bevat geen accountkoppeling, IP of user-agent. De code gebruikt
geen cookies en respecteert DNT/GPC, localhost en geblokkeerde lokale opslag.
Supabase kan als hostingprovider afzonderlijke infrastructuurlogs bijhouden;
deze meting leest of kopieert die niet. Een browsercode is een pseudonieme
identifier: dit is geen juridische garantie dat geen toestemming nodig is.
Opslag wissen of een andere browser gebruiken levert een nieuwe bezoeker op.
Niet-gemeten browsers ontbreken; er zijn geen historische cijfers van vóór uitrol.

Alleen de schrijf-RPC is beschikbaar voor anon; de admin-RPC controleert
`is_admin()` op de server. Rechtstreekse tabeltoegang is ingetrokken en RLS
heeft bewust geen policies. De SECURITY DEFINER-advisories zijn voor deze twee
expliciet begrensde API's verwacht. Limieten: 30 events/minuut en 200/dag per
browsercode, transactioneel vergrendeld. Een aanvaller kan nieuwe codes maken;
dit is eenvoudige begrenzing, geen botbescherming.

Controle: `node tests/usage.cjs`, plus beide dailytests. De live controles zijn
in transacties teruggedraaid: anon-write, visit-ontdubbeling, inputvalidatie,
geen anon-reads, admincontrole en 30 rapportagedagen. Er blijven geen testevents
achter. Ruwe events worden voorlopig bewaard voor cohortberekeningen; er is
geen automatische opschoningsjob toegevoegd.

De integrator synchroniseert `website/` en verhoogt de cacheversies vóór uitrol.
