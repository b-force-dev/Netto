# Daily-planning van 13 november 2026

De productieplanning is daadwerkelijk aangevuld met **14 aaneengesloten Dailies: 13 t/m 26 november 2026**. Vandaag is weer speelbaar. Het doel van 45 dagen tot en met 27 december is **niet gehaald**: 27 november t/m 27 december, inclusief Kerstmis, blijft ongepland. Voor die 31 dagen is geen volledige inhoudelijke goedkeuring afgegeven.

Er zijn twee transacties uitgevoerd: eerst 13–19 november, daarna 20–26 november. Dertien ongedateerde reserves zijn hergebruikt met nieuwe tweetalige redactie en duidelijke afbakening; één puzzel is nieuw geschreven. Iedere vraag heeft een Engelse hoofdtekst, Nederlandse tekst, eenheid, bestaande categorie, bron en uitleg in beide talen. De sommen gebruiken uitsluitend positieve gehele getallen en kloppen exact. Waar afronding nodig is, staat dat expliciet in de vraag.

De reeks bevat vijf optellingen, vier delingen, drie vermenigvuldigingen en twee aftrekkingen. De 42 vragen beslaan 19 bestaande categorieën: gebouwen (5), muziek (4), films, kunst, biologie, geschiedenis en religie/filosofie (ieder 3), technologie, dieren, taal, vervoer, boeken en geografie (ieder 2), en natuurkunde, sport, ruimte, scheikunde, politiek en milieu (ieder 1). Er is afwisseling tussen toegankelijke en moeilijkere vragen; dit is een redactionele inschatting, geen gebruikerstest. Er zijn geen Nederlandse lokale onderwerpen geselecteerd.

## Inhoud en beelden controleren

Alle 42 feiten zijn op 13 november online nagegaan bij officiële organisaties, musea, wetenschappelijke instellingen, uitgevers of Wikipedia. Voorbeelden van de gebruikte instellingen zijn NASA, WHO, NHGRI, ISRO, GIA, IUPAC, Museum Wales, National Army Museum en de VN. De volledige verificatie-URL staat per vraag uitsluitend in het private redactiebestand. Vragen over historische uitgaven, verkiezingen, albums en missies zijn afgebakend tot een specifieke editie of datum. Vage recordwaarden, onduidelijke tellingen en eerder verschenen onderwerpen zijn afgewezen.

Commons-kandidaten zijn gedownload en visueel bekeken op contactbladen. Licentie, maker en bronpagina zijn via Commons-imageinfo gecontroleerd en bij iedere gebruikte afbeelding opgeslagen. Er zijn 29 gebruikte beelden met PD-, CC BY- of CC BY-SA-vermelding; dit omvat ook logo’s, historische portretten en illustraties. Bij 13 vragen blijft het beeld leeg: geen geschikte kandidaat gevonden, verkeerde onderwerp-match, een afbeelding die tellen mogelijk maakt, of onvoldoende duidelijke makersvermelding. Een vermelding in het bestaande fotobestand is dus niet automatisch overgenomen.

De precieze voorstellen, antwoorden, bronnen, beeldgegevens, visuele beoordelingen en SQL staan buiten de publieke repository in `C:\Users\Gebruiker\Netto\.private\`:

- `daily_backup_before_run_20261113.json`: verse volledige back-up van beide tabellen vóór de eerste wijziging.
- `daily_run_20261113.json`: compleet redactiedossier van beide batches, voorafgaand aan uitvoering opgeslagen.
- `daily_run_20261113_batch1.sql` en `daily_run_20261113_batch2.sql`: daadwerkelijk uitgevoerde transacties.
- `daily_run_images/`: gedownloade kandidaten en bekeken contactbladen.
- `daily_run_20261113_api_verification.json` en `daily_run_20261113_api_batch2.json`: publieke API-controles en ongerangschikte gastresultaten.

Iedere SQL-batch vergrendelt de twee inhoudstabellen en weigert bezette datums, gewijzigde reserverijen, herhaalde genormaliseerde vragen, ongeldige sommen en beschermde datums. Alleen ongedateerde reserves zijn bijgewerkt, nieuwe metadata is ingevoegd en één nieuwe puzzelrij is toegevoegd. De 27 gedateerde rijen tot en met 5 november zijn achteraf volledig vergeleken met de back-up: exact ongewijzigd. Spelers, scores, schema, RLS en grants zijn niet gewijzigd.

## Waarom de planning leegliep

De planning was een handmatig eindig voorraadje, zonder automatische aanvuller. `pg_cron` is niet geïnstalleerd. Het bestaan van 125 ongedateerde reserves betekende niet dat er toekomstige dagen waren ingepland.

De vervangingsgeschiedenis in de database bewaart een oude planning met 100 rijen tot 23 november. De vervanging door `reviewed-20260927` maakte oude datums leeg en zette 25 dagen neer, 21 september t/m 15 oktober. De daaropvolgende verfijning naar `daily-curated-20260927` maakte opnieuw de bestaande datums leeg en zette slechts twintig dagen terug, tot 10 oktober. Zie de `update ... scheduled_date=null` en de invoerlijst in `supabase/verfijn_dailies_20260927.sql`. Daardoor verdween ook eerder beschikbare toekomstige dekking.

Latere toevoegingen in de huidige database beslaan alleen 30 oktober t/m 5 november. Er kwam geen doorlopende aanvulling voor 11–29 oktober of vanaf 6 november. De bewaarde geschiedenis bevestigt eerdere rijen binnen het oktobergat. Wie de handmatige SQL precies wanneer uitvoerde is niet vastgesteld; er is geen volledige uitvoeringsaudit beschikbaar.

`tools/plan_dailies.py` genereert slechts een SQL-bestand; het voert niets uit. Het gebruikt nog een handmatige lijst met gebruikte library-ID’s en schrijft toekomstige antwoorden naar een publiek SQL-pad. De gegenereerde SQL plant vanaf `max(scheduled_date)` en vult eerdere gaten dus niet. Bovendien worden gebruikte library-ID’s pas na het berekenen van het dagnummer weggefilterd: overgeslagen kandidaten kunnen gaten achterlaten. Het script levert geen volledige private vraagmetadata. Het is daarom niet gebruikt voor dit herstel.

De bestaande adminwaarschuwing keek alleen naar de laatste datum en waarschuwde pas onder drie dagen. Ongedateerde reserves, gaten en de status werden daarin onvoldoende meegenomen.

## Eenvoudige aanvulprocedure

1. Controleer iedere week, bijvoorbeeld op maandag, de **aaneengesloten** voorraad vanaf vandaag in `Europe/London`. Controleer ook of vandaag zelf bestaat. Wacht niet totdat de laatste datum is bereikt. Eén aangewezen redacteur moet deze controle uitvoeren; een adminwaarschuwing alleen is geen automatische bewaking.
2. Vul bij minder dan 14 dagen aan richting 45 dagen. Begin bij de eerste ontbrekende datum, nooit blind na de hoogste datum. Maak eerst een verse private back-up van `public.puzzles` en `netto_private.daily_question_details`.
3. Selecteer ongebruikte reserves op basis van de actuele database. Controleer ook inhoudelijke herhaling tussen talen en verschillende formuleringen. Schrijf zo nodig nieuwe puzzels. Controleer ieder feit, de exacte som, afbakening, beide talen, categorie, bron en uitleg. Download en bekijk beelden; leg rechten vast of laat het beeld leeg.
4. Bewaar het volledige voorstel en de transactionele SQL uitsluitend privé. Gebruik de twee batches van dit herstel als voorbeeld, met nieuwe datums en actuele bronrijen. Ze zijn bewust niet opnieuw uitvoerbaar op een andere dag of een bezette datum. Laat een batch volledig falen bij conflicten; sla geen losse kandidaten stilletjes over.
5. Voer eerst een kleine, zekere batch uit. Controleer daarna de publieke API met de anon-clientkey: vandaag zonder antwoorden, toekomstige datums en inzendingen geblokkeerd, gastinzending met uitleg en `ranked=false`. Controleer de browser in Engels en Nederlands. Vul vervolgens verder aan en controleer opnieuw op gaten en herhaling.

## Frontend en verificatie

`admin.html` waarschuwt nu bij minder dan 14 aaneengesloten vrij te geven dagen vanaf vandaag, met de eerste ontbrekende datum. Alleen unieke datums met status `scheduled` tellen mee. De telling gebruikt de Londense datum. De grens van 13/14 dagen, een gat, conceptstatus en ongedateerde reserves zijn met de echte code uit het adminbestand gecontroleerd.

De live browser opende de Daily van 13 november en toonde categorie-iconen en een geladen onderwerpafbeelding in beide taalinstellingen. Hierbij bleek een bestaande vertaalfout: het speelscherm schreef Engelse labels rechtstreeks naar de pagina, hoewel de API de Nederlandse tekst meegaf. `js/core.js` en `js/library.js` roepen daarvoor nu expliciet de bestaande vertaler aan. Op de lokale site zijn de drie Nederlandse vragen en de categorieën gecontroleerd, en ook de Engelse vragen. De lokale externe thumbnail bleef in deze browser laden; het identieke beeld laadde wel op de live site en is lokaal gedownload en bekeken. De Nederlandse labelcorrectie en adminwaarschuwing zijn nog niet live: publicatie door de integrator is nodig.

Na iedere batch zijn de RPC’s met de publieke anon-key via HTTPS gecontroleerd. Vandaag levert operator, drie categorieën en drie fotorecords zonder antwoorden of uitleg. Een wegwerp-gastinzending levert antwoorden en uitleg in beide talen, met `ranked=false`. Alle dertien toekomstige inzendingen zijn na batch twee geweigerd. Geen toekomstige vraag verschijnt in `netto_daily_questions`; directe lezingen van `puzzles` en `puzzles_public` zijn voor anon geweigerd (HTTP 401). Er zijn geen echte accounts gebruikt.

- `node tests/daily-reliability.cjs`: geslaagd.
- `node tests/daily-server.cjs`: geslaagd.
- `git diff --check`: geslaagd.

Volgens de opdracht zijn `website/`, cacheversies en synchronisatiescripts niet aangeraakt. De integrator moet versies en spiegel bijwerken en de frontend publiceren. Er is geen push uitgevoerd.

## Open punten

- Nog 31 gecontroleerde Dailies nodig voor 27 november t/m 27 december; een feestelijke kerstpuzzel ontbreekt nog.
- De ontbrekende 13 beelden kunnen later met dezelfde rechten- en beeldcontrole worden aangevuld.
- De overige reserves zijn niet goedgekeurd. Een kloppende som is onvoldoende om ze automatisch te plannen.
- De weken hebben afwisseling, maar de moeilijkheid is niet met spelers getest. Geen ingeplande datum heeft een open feitelijke twijfel; dit is geen claim dat alle resterende reserves onbruikbaar zijn.
- Wijs een verantwoordelijke aan voor de wekelijkse voorraadcontrole. Er is geen automatische waarschuwing buiten het adminscherm toegevoegd.
