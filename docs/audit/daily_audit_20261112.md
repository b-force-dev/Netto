# Daily-audit van 12 november 2026

**Dringend: de planning is al op. De laatste ingeplande Daily staat op 5 november 2026. Er staan nul Dailies voor vandaag of later klaar. De volledige komende 60 dagen ontbreken.**

## Bereik en werkwijze

De Supabase-MCP-verbinding met project `bqatnnouxkjdzvvhqbly` werkt. Rechtstreeks gelezen uit `public.puzzles` en `netto_private.daily_question_details`; geen terugval op alleen lokale bestanden. De database bevestigt 12 november als huidige datum in Londen. Vrijgave gebeurt om middernacht in Londen.

`AGENTS.md`, `README.md` en `docs/daily-server.md` zijn gelezen. De schone werkbranch is na `git fetch origin` vergeleken met `origin/develop`: geen verschil vóór deze audit.

| Controle | Uitkomst |
| --- | --- |
| Ingeplande Dailies vanaf 12 november | 0 |
| Inhoudelijk gecontroleerde Dailies binnen dat bereik | 0; er zijn geen rijen |
| Voorraad vanaf vandaag | 0 dagen |
| Laatste ingeplande datum | 5 november 2026 |
| Ontbrekende dagen, 12 november t/m 10 januari | Alle 60 |
| Gedateerde rijen in de hele tabel | 27 |
| Rijen zonder datum | 125; deze zijn geen planning |
| Private metadatarecords | 62 |

De eerdere planning heeft ook een gat van 11 t/m 29 oktober. Vanaf 6 november ontbreekt iedere dag. De status `scheduled` alleen bewijst dus niet dat een puzzel een publicatiedatum heeft.

## Inhoudelijke uitkomst

Voor het gevraagde datumbereik zijn rekenen, feiten, eenheden, categorieën, uitleg, foto's, rechten, vertalingen en afwisseling niet te beoordelen: de planning is leeg. Dit rapport keurt dus geen toekomstige reeks goed.

Als aanvullende inventarisatie zijn alle 125 ongedateerde reserves op de exacte rekensom gecontroleerd. Alle sommen kloppen, met deling gecontroleerd via vermenigvuldiging zodat afronding geen fouten verbergt. De 375 vraagposities bevatten 343 verschillende vraagteksten. Bij 350 posities ontbreekt een passend privaat metadatarecord. Dat betekent niet dat alle bronnen of afbeeldingen elders ontbreken; het betekent wel dat de Daily-API ze zo niet volledig kan leveren.

Van de 25 reserves met editie `reviewed-20260927` bevatten er negen minstens één vraag die al in een gedateerde Daily staat. Die reserves zijn niet automatisch opnieuw bruikbaar. Exacte herhaling is hier gecontroleerd na normalisatie van vraagteksten; een volledige inhoudelijke beoordeling van bijna gelijke vragen in alle reserves is niet uitgevoerd.

Eén ongebruikte reserve is verder uitgewerkt: exacte som, drie feiten met online bronnen, duidelijke eenheden, drie categorieën, Nederlandse en Engelse vraagteksten en uitleg, en drie passende afbeeldingen met Commons-pagina, maker en licentie. De drie afbeeldingen zijn gedownload, geopend en visueel bekeken. Het betreft een logo, een onderwerp-foto en een historisch portret; niet alle afbeeldingen zijn fotografische opnamen. De oorspronkelijke algemene formulering van één vraag is in het voorstel afgebakend tot een specifieke historische uitgave, zodat beide talen hetzelfde tellen.

Het voorstel heeft drie verschillende categorieën. Eén puzzel biedt echter geen afwisseling tussen dagen of bewerkingen en lost het tekort aan voorraad niet op. De overige reserves zijn niet volledig op actuele feiten, tweetaligheid, foto's en moeilijkheid goedgekeurd. Details, bronlinks en inhoudelijke aandachtspunten staan uitsluitend in het private redactiebestand hieronder; zo verschijnen toekomstige antwoorden ook niet indirect in dit rapport.

## Wijzigingen en bestanden

**Niets in de productiedatabase gewijzigd. Geen publicatiedatum, vraag, antwoord of metadatarecord aangepast.** Reeds vrijgegeven dagen, spelergegevens, scores, RLS, grants en schema zijn niet gewijzigd.

In de hoofdcheckout staan deze bestanden onder de door Git genegeerde map `C:\Users\Gebruiker\Netto\.private\`:

- `daily_audit_20261112_snapshot.json`: volledige momentopname van alle 152 puzzelrijen en alle 62 private metadatarecords, gemaakt vóór het voorstel. Ook de te gebruiken reserverij staat hierin.
- `daily_audit_20261112_proposal.sql`: uitvoerbaar voorstel voor één reserve op **13 november 2026**, niet uitgevoerd en niet gecommit. Eén transactie, controles op ongewijzigde bronrij, vrije doeldatum, eerdere vraagherhaling en correcte som. Bestaande metadata wordt bij een conflict niet overschreven. Het script weigert uitvoering na de auditdatum; dan is herbeoordeling nodig.
- `daily_audit_20261112_editorial.json`: voorgestelde vraagteksten, eenheden, bronnen, uitleg, afbeeldingen, rechten en redactionele beoordeling.
- `daily_audit_20261112_images/`: de drie daadwerkelijk bekeken afbeeldingen.

| Datum | Veld | Soort wijziging | Status |
| --- | --- | --- | --- |
| 13 november 2026 | `scheduled_date`, `daily_edition` | Reserve geschikt maken voor de actieve Daily-editie | Alleen SQL-voorstel |
| 13 november 2026 | `question_3` | Vraag eenduidig afbakenen | Alleen SQL-voorstel |
| 13 november 2026 | `daily_question_details.details` | Drie metadatarecords met NL/EN-uitleg, categorie, eenheid en beeldrechten toevoegen | Alleen SQL-voorstel |
| 13 november 2026 | `image_*` | Overkoepelende illustratie en credits invullen | Alleen SQL-voorstel |

De antwoordvelden blijven in het voorstel gelijk. De SQL is niet op productie getest of uitgevoerd, ook niet in een teruggedraaide transactie. De brongegevens, doelvoorwaarden en inhoud zijn lokaal gecontroleerd.

`tools/plan_dailies.py` is niet uitgevoerd: het schrijft naar een publiek SQL-pad, levert geen volledige private vraagmetadata en gebruikt een historische lijst met gebruikte library-ID's. Dat is hier onvoldoende om veilig een actuele reeks te publiceren.

## Open punten voor de eigenaar

1. Herstel de lege planning met een afzonderlijk beoordeelde reeks. Er staan nog steeds nul dagen klaar; ook vandaag blijft leeg. Het private voorstel voegt na uitvoering slechts één toekomstige dag toe.
2. Beoordeel de overige reserves op feiten eind 2026, duidelijke afronding, regio, eenheid, natuurlijke NL/EN-tekst, foto's en rechten voordat ze een datum krijgen. Een kloppende som is geen inhoudelijke goedkeuring.
3. Vermijd de aangetroffen herhalingen. Maak pas na selectie een reeks met afwisseling in categorieën en alle vier bewerkingen; een gezonde mix is nu niet aanwezig omdat de planning ontbreekt.
4. Bepaal de gewenste toegankelijkheid van de nieuwe reeks. Het uitgewerkte voorstel heeft bekende onderwerpen maar ook een specifieke literatuurvraag; er is geen gebruikerstest gedaan. Het private redactiebestand bevat de concrete afweging.
5. Onderzoek waarom de planning stopte en waarom het oktobergat ontstond. Deze audit stelt de oorzaak niet vast en verandert geen vrijgegeven dagen.

## Verificatie

- `node tests/daily-reliability.cjs`: geslaagd.
- `node tests/daily-server.cjs`: geslaagd.
- `python tools/sync_website.py --check`: geslaagd; frontend en spiegel zijn niet gewijzigd.
- Tweede afzonderlijke databasecontrole bevestigt: nul rijen vanaf 12 november, laatste datum 5 november, alle komende 60 dagen ontbreken.
- Geen push uitgevoerd. Alleen dit antwoordvrije auditrapport wordt gecommit.
