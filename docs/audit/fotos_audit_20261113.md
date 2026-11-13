# Foto-audit 13 november 2026

## Bereik en aantallen

Gecontroleerd op de verse develop-basis, zonder wijzigingen aan de puzzelbanken, selecties, werkbladen, website-mirror of cacheversies. De inventaris telt een vraag eenmaal, in de volgorde Library, Find the Connection, kettingen en Race. Daardoor staan gedeelde vragen niet dubbel in de tabel.

906 unieke openbare vragen; 574 oorspronkelijke fotokoppelingen visueel bekeken op 20 contactvellen. Alle 574 beelden zijn uiteindelijk opgehaald en gedecodeerd. Een tijdelijk fout gelezen download bleek bij hercontrole een geldige PNG. Daarnaast 19 Commons-kandidaten bekeken; 9 daarvan gekozen en lokaal opgeslagen.

14 vragen kregen een foto, 6 kregen een vervanging, 69 koppelingen zijn verwijderd. Nu hebben 519 van deze vragen een fotokoppeling; 387 hebben er geen. De laatste groep omvat bewuste spoilerafkeuringen en nog niet ingevulde onderwerpen.

| Eerste vindplaats | Vragen | Foto vooraf | Foto achteraf |
|---|---:|---:|---:|
| Library | 147 | 99 | 100 |
| Find the Connection | 60 | 43 | 40 |
| Kettingpuzzels | 402 | 254 | 227 |
| Race (nog niet eerder getelde vragen) | 297 | 178 | 152 |

## Bron en generatie

`fotos/publieke_fotos.json` is de nieuwe canonieke bron voor deze gecontroleerde uitzonderingen: een foto-object vervangt of voegt toe; null betekent bewust geen foto. `tools/maak_fotobestand.py` past dit ook toe op oude en nieuwe vraagteksten uit `vragen/hernoemingen_fotos.json`. De generator schrijft alleen root-data; de integrator verzorgt versies en mirror.

De volledige gegenereerde bank gaat van 942 naar 842 sleutels: 118 verdwenen, 18 kwamen erbij, inclusief aliassen. Van de 118 verdwenen sleutels waren 69 openbare vragen uit deze audit; de andere 49 waren ongebruikte oude sleutels die de bestaande canonieke bronnen niet meer voortbrachten. Twee gecontroleerde openbare uitzonderingen (ISS-baansnelheid en Taylor Swift) zijn expliciet bewaard zodat regenereren ze behoudt. Geen overige openbare fotokoppelingen veranderden onbedoeld.

De eerdere onaffe aanpak is alleen gelezen. Het bronbestand voor openbare uitzonderingen en de strengere vergelijking met ingebakken foto-objecten zijn opnieuw geïmplementeerd. De fotobank is leidend, zodat afkeuringen en vervangingen meteen zichtbaar zijn zonder de puzzeldata van de andere agent te wijzigen.

## Code en formaat

Logo’s, diagrammen/SVG’s en beelden breder dan 1,8:1 of smaller dan 0,75:1 krijgen `contain` met neutrale achtergrond. Gewone foto’s houden `cover`. De bestaande vaste kaderafmetingen blijven gelijk; de laadgebeurtenis verandert alleen de pasvorm. Dit geldt voor vraagkaarten, revealminiaturen en creditkaarten. Een foto bij vraag 1 staat nu ook daadwerkelijk bij vraag 1. De expliciete spinfoto bij de vraag naar het aantal poten is weggehaald wegens spoilergevaar.

De credits verzamelen nu ook fotobankbeelden die via vraagtekst worden gevonden, dus ook beelden van Race en kettingen zonder ingebakken photo-veld. Lokale Commons-miniaturen worden onder HTTP en HTTPS toegelaten, inclusief hun maker, licentie en Commons-bron.

`fotos/assets`: vooraf 26 bestanden, 3.285.439 bytes (3,13 MiB); achteraf 35 bestanden, 3.852.906 bytes (3,67 MiB). Groei: 567.467 bytes. De 9 nieuwe JPEG’s hebben een langste zijde van maximaal 640 pixels en wegen ieder 24–93 kB. Geen nieuwe weesbestanden: alle negen staan in de fotobank en op de creditpagina. De bestaande 25 catalogusbeelden en het OpenAEC-logo blijven gerefereerd; geen verwijzingen naar ontbrekende lokale bestanden gevonden. Bestaande foto’s die mogelijk ook in geplande Dailies worden gebruikt, zijn niet verwijderd.

Commons is benaderd met een algemene beschrijvende User-Agent zonder persoonsgegevens, twee gelijktijdige downloads met pauzes in de hoofdronde; aanvullende kandidaten zijn na elkaar opgehaald. Bij HTTP 429 in de aanvullende zoekronde zijn verdere zoekpogingen gestopt; geen herhaalde zoekverzoeken na de melding.

## Browser en controles

Echte lokale headless Chrome, via `python -m http.server 8873`, op 390 en 1440 pixels. Library-puzzel 13 toont de nieuwe kangoeroefoto met geldige afmetingen; screenshots zijn bekeken. Het Breaking Bad-logo is apart door de bestaande kaart- en revealcomponent gestuurd: op beide breedtes `contain`, volledig binnen een vast kader (reveal 26×26 respectievelijk 30×30 pixels). Dit was een componentcontrole met testdata, geen wijziging van de server-Daily. Op de creditpagina zijn alle 9 nieuwe lokale afbeeldingen succesvol gedecodeerd; de pagina telt 580 unieke Commons-bronnen. De browseruitvoer en screenshots staan tijdelijk buiten de repo. De gedeelde preview liep tweemaal vast op een time-out van 15 seconden; daarom is overgeschakeld naar lokale Chrome.

Geslaagd: `node tests/daily-reliability.cjs`, `node tests/daily-server.cjs`, `node tests/usage.cjs`, `node tests/puzzle-library.cjs`, `python tools/controleer_puzzels.py`, `node tools/test_daily_photo_order.cjs` en de nieuwe `node tests/photo-links.cjs`.

De puzzelcontrole is aangepast aan de bestaande runtimekeuze uit de actuele fotobank: oude ingebakken photo-velden worden als waarschuwing gemeld, geen fout. Ontbrekende bronvermelding en ontbrekende lokale bestanden zijn wel fouten. Dit is nodig omdat deze opdracht de puzzeldata expliciet bij de andere agent laat. De regressietest toetst dat een vervanging wordt gevolgd, een afgekeurd beeld verdwijnt, alle bankbeelden credits krijgen en lokale bestanden bestaan.

## Nog te doen door integrator

Library geeft in `js/puzzle-modes.js` bij `showAnswerReveal` geen foto mee; ook de vaste antwoordweergave bouwt geen fotoblok. Daarom kan de nieuwe foto in die volledige Library-revealstroom nog niet worden aangetoond. De gedeelde revealcomponent zelf is wel gecontroleerd. Find the Connection roept momenteel geen fotoweergave aan; de gecontroleerde fotokoppelingen zijn daarvoor beschikbaar, maar die spelmodus toont ze nog niet. Deze uitbreidingen zijn buiten de afgesproken wijzigingen aan daily-photos/photo-credits gelaten.

Laat de puzzelgenerator de ingebakken photo-velden bij een volgende normale regeneratie verversen; de runtime gebruikt nu al de actuele bank. Werk daarna cacheversies en website-mirror bij. Bekijk de nieuwe vragen en tekstwijzigingen van de parallel werkende agent opnieuw: deze audit beschrijft alleen de hier aanwezige 906 vragen. Geplande Dailies in Supabase zijn niet behandeld.

Voor meer dekking: begin met de ontbrekende Library-vragen hieronder. Zoek geen nieuwe telbare sets bij aantalvragen. Vraag bijvoorbeeld een artiestportret bij een albumtelling; een logo bij een seizoentelling; een buitenaanzicht bij een gebouwhoogte.

## Gewijzigde vragen

| Actie | Vraag | Reden |
|---|---|---|
| Verwijderd | Hoeveel poten heeft een kreeftachtige van de orde Isopoda? | Het gevraagde aantal is zichtbaar of telbaar; liever geen spoiler. |
| Verwijderd | Hoeveel kamers heeft het menselijk hart? | Het gevraagde aantal is zichtbaar of telbaar; liever geen spoiler. |
| Verwijderd | Hoeveel paar ribben heeft een mens normaal? | Het gevraagde aantal is zichtbaar of telbaar; liever geen spoiler. |
| Verwijderd | Hoeveel gekleurde vierkantjes telt een standaard Rubik's kubus aan de buitenkant? | Het gevraagde aantal is zichtbaar of telbaar; liever geen spoiler. |
| Verwijderd | Hoeveel genummerde scorevakken heeft een dartbord? | Het gevraagde aantal is zichtbaar of telbaar; liever geen spoiler. |
| Verwijderd | Hoeveel zuilen had het oorspronkelijke Parthenon volgens de klassieke indeling? | Het gevraagde aantal is zichtbaar of telbaar; liever geen spoiler. |
| Verwijderd | Hoeveel straten, stations en nutsbedrijven kun je kopen op een klassiek Monopoly-bord? | Het gevraagde aantal is zichtbaar of telbaar; liever geen spoiler. |
| Verwijderd | Hoeveel botten bevat één menselijke hand inclusief de pols? | Het gevraagde aantal is zichtbaar of telbaar; liever geen spoiler. |
| Verwijderd | Hoeveel elektronen deelt een enkelvoudige covalente binding? | Het gevraagde aantal is zichtbaar of telbaar; liever geen spoiler. |
| Verwijderd | Hoeveel toetsen heeft een standaard computertoetsenbord ongeveer? | Het gevraagde aantal is zichtbaar of telbaar; liever geen spoiler. |
| Verwijderd | Hoeveel leden telt het Britse Lagerhuis? | Het gevraagde aantal is zichtbaar of telbaar; liever geen spoiler. |
| Verwijderd | Hoeveel letters heeft het Griekse alfabet? | Beeld toont niet het concrete onderwerp of is te onduidelijk op klein formaat. |
| Verwijderd | Hoeveel procent van het Amazoneregenwoud ligt ongeveer in Brazilië? | Beeld toont niet het concrete onderwerp of is te onduidelijk op klein formaat. |
| Verwijderd | Hoeveel gram per kubieke centimeter is de dichtheid van water ongeveer? | Beeld toont niet het concrete onderwerp of is te onduidelijk op klein formaat. |
| Verwijderd | Hoeveel kleuren heeft de vlag van Zuid-Afrika? | Beeld toont niet het concrete onderwerp of is te onduidelijk op klein formaat. |
| Verwijderd | Hoeveel gouden medailles won Australië op de Olympische Zomerspelen 2024? | Beeld toont niet het concrete onderwerp of is te onduidelijk op klein formaat. |
| Verwijderd | Hoeveel duizend bladzijden telt het Woordenboek der Nederlandsche Taal? | Beeld toont niet het concrete onderwerp of is te onduidelijk op klein formaat. |
| Verwijderd | In welk jaar werd de eerste vlucht rond de wereld voltooid? | Beeld toont niet het concrete onderwerp of is te onduidelijk op klein formaat. |
| Verwijderd | Ruim hoeveel meter lang was de recordhotdog van Novex in Paraguay in 2011? | Beeld toont niet het concrete onderwerp of is te onduidelijk op klein formaat. |
| Verwijderd | Hoeveel delen CO₂ per miljoen delen lucht zat er rond het pre-industriële referentiejaar in de atmosfeer? | Beeld toont niet het concrete onderwerp of is te onduidelijk op klein formaat. |
| Verwijderd | In welk jaar werd de eerste camera uitgevonden? | Beeld toont niet het concrete onderwerp of is te onduidelijk op klein formaat. |
| Verwijderd | Hoeveel maanmissies naar de maan (Chang e-programma) lanceerde China? | Beeld toont niet het concrete onderwerp of is te onduidelijk op klein formaat. |
| Verwijderd | Hoeveel marathons had de Duitser Horst Preisler eind 2004 gelopen? | Beeld toont niet het concrete onderwerp of is te onduidelijk op klein formaat. |
| Verwijderd | Hoeveel procent van de wereldkoffie komt uit Brazilië? | Beeld toont niet het concrete onderwerp of is te onduidelijk op klein formaat. |
| Verwijderd | Hoeveel vierkante kilometer groot is de provincie Utrecht? | Beeld toont niet het concrete onderwerp of is te onduidelijk op klein formaat. |
| Verwijderd | Hoeveel keer won Australië de Rugby World Cup bij de mannen tot 2023? | Beeld toont niet het concrete onderwerp of is te onduidelijk op klein formaat. |
| Verwijderd | Hoeveel kilogram woog de zwaarste lederschildpad ooit, volgens Guinness World Records? | Gewone soortgenoot of voorbeeld is niet het gevraagde recordexemplaar (bij de schildpad ook verkeerde soort). |
| Verwijderd | Hoe hoog was de hoogste hond ooit in centimeters? | Gewone soortgenoot of voorbeeld is niet het gevraagde recordexemplaar (bij de schildpad ook verkeerde soort). |
| Verwijderd | Hoeveel liter soep bevatte de grootste kom soep ooit? | Gewone soortgenoot of voorbeeld is niet het gevraagde recordexemplaar (bij de schildpad ook verkeerde soort). |
| Verwijderd | Hoe zwaar was de zwaarste hond ooit in kilogram? | Gewone soortgenoot of voorbeeld is niet het gevraagde recordexemplaar (bij de schildpad ook verkeerde soort). |
| Verwijderd | Hoe lang was de langste hond ooit in centimeters? | Gewone soortgenoot of voorbeeld is niet het gevraagde recordexemplaar (bij de schildpad ook verkeerde soort). |
| Verwijderd | Hoe zwaar was de zwaarste hamburger ooit in kilogram? | Gewone soortgenoot of voorbeeld is niet het gevraagde recordexemplaar (bij de schildpad ook verkeerde soort). |
| Verwijderd | Hoeveel kilogram woog de zwaarste schildpad ooit, volgens het National Museum Wales? | Gewone soortgenoot of voorbeeld is niet het gevraagde recordexemplaar (bij de schildpad ook verkeerde soort). |
| Verwijderd | Hoeveel pixels breed is een standaard 4K Ultra HD videoscherm? | Schema met beeldresoluties helpt het gevraagde pixelaantal afleiden. |
| Verwijderd | Hoeveel jaar zaten er tussen het begin en het einde van de Punische oorlogen? | Kaart met jaartal kan de historische intervalvraag verklappen. |
| Verwijderd | In welk jaar werd de Eerste Franse Republiek uitgeroepen? | Kaart uit 1800 past niet bij het uitroepen van de Eerste Franse Republiek. |
| Verwijderd | Hoeveel bekende manen heeft Saturnus (stand 2026)? | Drukke banengrafiek is onleesbaar op klein formaat en bevat aantallen. |
| Vervangen | In welk jaar vroeg Carl Benz patent aan op zijn driewielige Motorwagen? | Visueel gekozen Commons-beeld van het juiste onderwerp; lokale miniatuur met volledige bronvermelding. |
| Toegevoegd | Hoeveel meter hoog is de Elizabeth Tower, de toren van Big Ben? | Visueel gekozen Commons-beeld van het juiste onderwerp; lokale miniatuur met volledige bronvermelding. |
| Toegevoegd | Hoeveel kilogram weegt een volwassen mannetjesolifant in Afrika? | Visueel gekozen Commons-beeld van het juiste onderwerp; lokale miniatuur met volledige bronvermelding. |
| Toegevoegd | Hoeveel kilogram weegt een volwassen mannelijke rode reuzenkangoeroe maximaal? | Visueel gekozen Commons-beeld van het juiste onderwerp; lokale miniatuur met volledige bronvermelding. |
| Toegevoegd | In welk jaar werd de eerste Nobelprijs uitgereikt? | Visueel gekozen Commons-beeld van het juiste onderwerp; lokale miniatuur met volledige bronvermelding. |
| Toegevoegd | Hoeveel kilometer per uur kon de Concorde halen? | Visueel gekozen Commons-beeld van het juiste onderwerp; lokale miniatuur met volledige bronvermelding. |
| Toegevoegd | Hoeveel kilogram weegt een volwassen mannelijke Amerikaanse bizon? | Visueel gekozen Commons-beeld van het juiste onderwerp; lokale miniatuur met volledige bronvermelding. |
| Toegevoegd | Hoeveel kilometer lang was Route 66? | Visueel gekozen Commons-beeld van het juiste onderwerp; lokale miniatuur met volledige bronvermelding. |
| Toegevoegd | Hoeveel eitjes kan een koninginnenbij per dag leggen? | Visueel gekozen Commons-beeld van het juiste onderwerp; lokale miniatuur met volledige bronvermelding. |
| Toegevoegd | Hoeveel boeken bevat de Harry Potter-hoofdserie? | Hergebruik van gecontroleerd beeld van hetzelfde onderwerp, zonder zichtbaar antwoord. |
| Toegevoegd | Hoeveel kilometer lang was de Berlijnse Muur? | Hergebruik van gecontroleerd beeld van hetzelfde onderwerp, zonder zichtbaar antwoord. |
| Toegevoegd | Hoeveel duizend keer klopt een mensenhart per dag (bij rust)? | Hergebruik van gecontroleerd beeld van hetzelfde onderwerp, zonder zichtbaar antwoord. |
| Toegevoegd | Hoeveel armen heeft een octopus? | Hergebruik van gecontroleerd beeld van hetzelfde onderwerp, zonder zichtbaar antwoord. |
| Vervangen | Hoeveel maagcompartimenten heeft een schaap? | Collage van herkauwers vervangen door echte schapen; maagcompartimenten blijven onzichtbaar. |
| Vervangen | Hoeveel liter bloed pompt een mensenhart gemiddeld per dag rond? | Hart in plaats van bloedbuizen bij pompfunctie van het hart. |
| Vervangen | Hoeveel paar chromosomen heeft een hond? | Afrikaanse wilde hond vervangen door huishonden; chromosomen zijn onzichtbaar. |
| Verwijderd | Hoeveel genummerde publieksingangen had het Colosseum? | Aantal of onderdelen zijn zichtbaar of telbaar in het beeld; voorkom een spoiler. |
| Verwijderd | Hoeveel vakjes telt de looproute rond een standaard Mens-erger-je-niet-bord? | Aantal of onderdelen zijn zichtbaar of telbaar in het beeld; voorkom een spoiler. |
| Verwijderd | Hoeveel hartkleppen heeft het menselijk hart? | Aantal of onderdelen zijn zichtbaar of telbaar in het beeld; voorkom een spoiler. |
| Verwijderd | Hoeveel ogen heeft een bij? | Aantal of onderdelen zijn zichtbaar of telbaar in het beeld; voorkom een spoiler. |
| Verwijderd | Hoeveel zuilen heeft het Parthenon aan de lange zijde? | Aantal of onderdelen zijn zichtbaar of telbaar in het beeld; voorkom een spoiler. |
| Verwijderd | Hoeveel leden heeft de G7? | Aantal of onderdelen zijn zichtbaar of telbaar in het beeld; voorkom een spoiler. |
| Verwijderd | Hoeveel facetten heeft een rond briljant geslepen diamant, zonder de punt (culet) mee te tellen? | Aantal of onderdelen zijn zichtbaar of telbaar in het beeld; voorkom een spoiler. |
| Verwijderd | Hoeveel boogsegmenten telt het Colosseum per verdieping? | Aantal of onderdelen zijn zichtbaar of telbaar in het beeld; voorkom een spoiler. |
| Verwijderd | Hoeveel vleugels heeft een bij? | Aantal of onderdelen zijn zichtbaar of telbaar in het beeld; voorkom een spoiler. |
| Verwijderd | Hoeveel botten heeft een volwassen menselijk lichaam? | Aantal of onderdelen zijn zichtbaar of telbaar in het beeld; voorkom een spoiler. |
| Verwijderd | Hoeveel wervels telt de menselijke wervelkolom in totaal? | Aantal of onderdelen zijn zichtbaar of telbaar in het beeld; voorkom een spoiler. |
| Verwijderd | Hoeveel kiesmannen telt het Amerikaanse Electoral College? | Aantal of onderdelen zijn zichtbaar of telbaar in het beeld; voorkom een spoiler. |
| Verwijderd | Uit hoeveel parallelle boogspanten bestaat de boog van de Sydney Harbour Bridge? | Aantal of onderdelen zijn zichtbaar of telbaar in het beeld; voorkom een spoiler. |
| Verwijderd | Hoeveel bogen heeft de Romeinse brug Pont du Gard in de onderste booglaag? | Aantal of onderdelen zijn zichtbaar of telbaar in het beeld; voorkom een spoiler. |
| Verwijderd | Hoeveel paarden en godinnen beeldt de quadriga op de Brandenburger Tor samen uit? | Aantal of onderdelen zijn zichtbaar of telbaar in het beeld; voorkom een spoiler. |
| Verwijderd | Hoeveel liter olijfolie gebruikt een Griek per jaar? | Verkeerd onderwerp, ongeschikte illustratie of andere persoon dan de vraag. |
| Verwijderd | Hoeveel mensen namen deel aan de grootste massale yogales? | Verkeerd onderwerp, ongeschikte illustratie of andere persoon dan de vraag. |
| Verwijderd | In welk jaar werd de eerste internationale telefonische verbinding gemaakt? | Verkeerd onderwerp, ongeschikte illustratie of andere persoon dan de vraag. |
| Verwijderd | Hoeveel kilometer lang is de Nederlandse kustlijn ongeveer? | Verkeerd onderwerp, ongeschikte illustratie of andere persoon dan de vraag. |
| Verwijderd | Hoeveel procent bedraagt het standaard-btw-tarief in België? | Verkeerd onderwerp, ongeschikte illustratie of andere persoon dan de vraag. |
| Verwijderd | Hoeveel piercings had Rolf Buchholz, de man met de meeste piercings, in 2012? | Verkeerd onderwerp, ongeschikte illustratie of andere persoon dan de vraag. |
| Verwijderd | Hoeveel lemuursoorten telt Madagaskar ongeveer? | Verkeerd onderwerp, ongeschikte illustratie of andere persoon dan de vraag. |
| Verwijderd | Hoe hoog was de hoogste robot ooit gebouwd in meters? | Verkeerd onderwerp, ongeschikte illustratie of andere persoon dan de vraag. |
| Verwijderd | Hoeveel elektronen heeft een chloride-ion, Cl⁻? | Verkeerd onderwerp, ongeschikte illustratie of andere persoon dan de vraag. |
| Verwijderd | Hoeveel tekens bevat het Japanse hiragana? | Verkeerd onderwerp, ongeschikte illustratie of andere persoon dan de vraag. |
| Verwijderd | Hoeveel naamvallen heeft het Duits? | Verkeerd onderwerp, ongeschikte illustratie of andere persoon dan de vraag. |
| Verwijderd | Hoeveel jaar kan een reuzenschildpad ongeveer oud worden? | Dit zijn geen reuzenschildpadden; een andere schildpadsoort is misleidend. |
| Verwijderd | Hoeveel kilogram woog de zwaarste pompoen ter wereld eind 2025? | Gewone pompoenen tonen niet de gevraagde recordpompoen. |
| Verwijderd | Hoeveel gram suiker zit er in een blikje Coca-Cola van 330 ml? | Een glazen fles past niet bij de gevraagde hoeveelheid suiker in een blikje met vast volume. |
| Verwijderd | Hoeveel gram suiker zit er in een Amerikaans blikje Coca-Cola van 355 ml? | Een glazen fles past niet bij de gevraagde hoeveelheid suiker in een blikje met vast volume. |
| Verwijderd | Hoeveel suikerklontjes van 4 gram komen overeen met de suiker in een blikje cola van 330 ml (afgerond)? | Een glazen fles past niet bij de gevraagde hoeveelheid suiker in een blikje met vast volume. |
| Vervangen | Hoeveel werken schreef William Shakespeare volgens de meest gebruikte telling? | Algemene schildering vervangen door herkenbaar portret van Shakespeare. |
| Vervangen | Hoeveel meter hoog is de CN Tower? | Logo vervangen door foto van de CN Tower zelf. |
| Toegevoegd | Hoeveel spelers staan er per voetbalteam op het veld? | Gecontroleerd beeld van het onderwerp, zonder telbaar team of zichtbare maagkamers. |
| Toegevoegd | Hoeveel kamers heeft de maag van een koe? | Gecontroleerd beeld van het onderwerp, zonder telbaar team of zichtbare maagkamers. |
| Verwijderd | Hoeveel ingangen had het Colosseum? | Bestaande blokkade voor telbare Colosseum-ingangen expliciet in de openbare audit vastgelegd. |

## Vragen zonder foto

Deze lijst bevat ook bewuste afkeuringen. Een ontbrekende foto is beter dan een spoiler of een verkeerd onderwerp.

### Library

- Hoeveel bloedgroepen kent het ABO-systeem?
- Hoeveel armen heeft de gewone vijfarmige zeester?
- Hoeveel bulten heeft een dromedaris?
- Hoeveel kleuren heeft een standaard Rubiks kubus?
- Hoeveel basissmaken worden in de moderne smaakleer onderscheiden?
- Hoeveel poten heeft een kreeftachtige van de orde Isopoda?
- Hoeveel kleuren heeft de vlag van België?
- Hoeveel pionnen heeft iedere speler bij de start van schaken?
- Hoeveel letters heeft het Griekse alfabet?
- Hoeveel kamers heeft het menselijk hart?
- Hoeveel landen deden mee aan het WK voetbal van 2026?
- Hoeveel meter lang is een olympisch zwembad?
- Hoeveel snaren heeft een standaard basgitaar?
- Hoeveel paar ribben heeft een mens normaal?
- Hoeveel snaren heeft een standaard viool?
- Uit hoeveel verschillende basen bestaat DNA?
- Hoeveel procent van het Amazoneregenwoud ligt ongeveer in Brazilië?
- Hoeveel passagiers voeren met de Mayflower naar Amerika?
- Hoeveel hoofdgoden telt de Griekse mythologie op de berg Olympus (de Twaalf Olympiërs)?
- Hoeveel gekleurde vierkantjes telt een standaard Rubik's kubus aan de buitenkant?
- Hoeveel procent van Nederland ligt onder zeeniveau?
- Hoeveel afleveringen heeft de miniserie Chernobyl?
- Hoeveel punten scoorde een team in de hoogste basketbalscore ooit?
- Hoeveel EU-lidstaten gebruiken de euro (2026)?
- Hoeveel afleveringen telt de serie Game of Thrones?
- In welk jaar viel het West-Romeinse Rijk traditioneel?
- Hoeveel planeten in ons zonnestelsel hebben ringen?
- In welk jaar werd de eerste commerciële harde schijf geïntroduceerd?
- Hoeveel pixels breed is een standaard 4K Ultra HD videoscherm?
- Hoeveel genummerde publieksingangen had het Colosseum?
- In welk jaar werd de eerste ruimtestationmodule gelanceerd?
- Hoeveel kilogram woog de zwaarste lederschildpad ooit, volgens Guinness World Records?
- Uit hoeveel eilanden bestaan de Malediven?
- Hoeveel meter is één internationale zeemijl exact?
- Hoeveel leden telt het Britse House of Commons?
- Hoeveel genummerde scorevakken heeft een dartbord?
- Hoeveel huizen werden verwoest bij de Grote Brand van Londen?
- Hoeveel hertz is de toonhoogte van de standaard a in de muziek?
- Wat is de hoogste windsnelheid in kilometer per uur die nog bij windkracht 8 hoort?
- In welk jaar werd de eerste commerciële cd uitgebracht?
- Hoe lang was de langste vrouw ooit in centimeters?
- Hoeveel zuilen had het oorspronkelijke Parthenon volgens de klassieke indeling?
- Hoeveel kilometer zijn alle bloedvaten van een volwassene samen lang, volgens de bekende schatting van 60.000 mijl?
- Hoeveel haren heeft een mens gemiddeld op zijn hoofd (afgerond)?
- Hoeveel dagen zaten er tussen D-Day en de bevrijding van Parijs?
- Hoeveel graden Celsius kan een bliksemschicht bereiken?
- Hoeveel planeten werden bezocht door het Voyager-programma?

### Find the Connection

- Hoeveel boeken telt de oorspronkelijke The Hunger Games-reeks?
- Hoeveel wielen heeft een Boeing 747 volgens de standaardconfiguratie?
- Hoeveel planeten staan dichter bij de zon dan de aarde?
- Hoeveel gram per kubieke centimeter is de dichtheid van water ongeveer?
- Hoeveel straten, stations en nutsbedrijven kun je kopen op een klassiek Monopoly-bord?
- Hoeveel metrolijnen had de Parijse metro in 2025?
- Hoeveel boeken bevat The Chronicles of Narnia?
- Hoeveel botten heeft een volwassen menselijke schedel volgens de gebruikelijke anatomische indeling?
- Hoeveel kleuren heeft de vlag van Zuid-Afrika?
- Hoe oud werd de oudste hond volgens Guinness World Records in jaren?
- Hoeveel gram suiker zit er in een blikje Coca-Cola van 330 ml?
- Hoeveel botten bevat één menselijke hand inclusief de pols?
- Hoeveel leden vormden de klassieke bezetting van The Beatles?
- Uit hoeveel meren bestaan de Grote Meren van Noord-Amerika?
- Hoeveel minuten duurt een volledige dag-en-nachtcyclus in Minecraft?
- Hoeveel seconden duurde de eerste geslaagde gemotoriseerde vlucht?
- Hoeveel decibel veroorzaakt een gemiddeld gesprek op normale toon?
- Hoeveel kilometer per uur haalt een cheetah op zijn snelst?
- Hoeveel passagiers kan een Boeing 777-300ER maximaal vervoeren?
- Hoeveel spelers staan er per team op het veld bij honkbal?

### Kettingpuzzels

- Hoeveel landen grenzen aan de Dode Zee?
- Hoeveel elektronen deelt een enkelvoudige covalente binding?
- Hoeveel poten heeft een standaard statief?
- Hoeveel afleveringen telt de originele Britse serie The Office (inclusief specials)?
- Hoeveel torens heeft de Notre-Dame van Parijs aan de voorzijde?
- Hoeveel kilometer lang is het Victoriameer ongeveer?
- Hoe hoog was de hoogste duik vanaf een klif in meters?
- Hoeveel zetels telt het Zuid-Afrikaanse parlement (National Assembly)?
- Wat is de totale lengte van alle onderzeese internetkabels op aarde in duizend kilometer?
- Hoe groot was de grootste pizza ooit in vierkante meter?
- Wat is de hoogte van het Vrijheidsbeeld in New York inclusief sokkel in meters?
- In welk jaar vertrok de eerste commerciële passagiersvlucht?
- Hoeveel miljard euro bedraagt het Nederlandse defensiebudget?
- Hoeveel kilogram weegt een volwassen mannetje van de Aziatische olifant gemiddeld?
- Hoeveel jaar zaten er tussen het begin en het einde van de Punische oorlogen?
- Hoeveel chemische elementen telt het huidige periodiek systeem?
- Hoeveel stappen telt de Mayapyramide El Castillo per zijde?
- Hoeveel is de som van de getallen 1 tot en met 100?
- Hoeveel gouden medailles won Australië op de Olympische Zomerspelen 2024?
- Hoeveel graden Celsius is het aan het oppervlak van de zon ongeveer?
- Hoeveel holes heeft een standaard golfbaan?
- Hoeveel Afrikaanse landen produceren koffie?
- Hoeveel minuten duurt een NBA-basketbalwedstrijd officieel?
- Hoeveel miljard neuronen (zenuwcellen) bevat het menselijk brein naar schatting?
- Hoeveel kiesmannen zijn er nodig om de Amerikaanse presidentsverkiezing te winnen?
- Hoeveel minuten officiële speeltijd heeft een rugbyunionwedstrijd?
- Hoeveel kilogram weegt de Moai-beelden op Paaseiland gemiddeld?
- Hoeveel satellieten lanceerde India in één enkele raket als record (2017)?
- Hoeveel procent van de wetlands is sinds 1700 wereldwijd verdwenen?
- Hoeveel uren aan videomateriaal wordt er wereldwijd elke minuut geüpload naar YouTube?
- Hoeveel kilometer van de Maas ligt in Nederland?
- Hoeveel mensen deden mee aan het grootste waterballonnengevecht ooit?
- Hoeveel innings telt een standaard honkbalwedstrijd?
- Hoeveel toetsen heeft een standaard computertoetsenbord ongeveer?
- In welk jaar werd de eerste drukpers met losse letters in Europa gebruikt?
- Hoe lang is de langste levende man in centimeters?
- In welk jaar werd de eerste iPhone uitgebracht?
- Hoe lang is de langste levende vrouw in centimeters?
- Hoeveel procent van het voedsel dat wereldwijd wordt geproduceerd gaat verloren of wordt verspild?
- Wat is het atoomnummer van zuurstof?
- Hoeveel procent van de landbouwgrond wordt gebruikt voor voedsel dat uiteindelijk niet wordt opgegeten?
- Hoeveel eilanden telt Fiji?
- Hoeveel graden heeft een rechte hoek?
- Hoeveel delen telt de originele The Godfather-filmreeks?
- Hoeveel volt heeft een standaard stopcontact in Nederland?
- Hoeveel delen CO₂ per miljoen delen lucht mat NASA in 2024?
- Hoeveel soorten telt de kangoeroefamilie (Macropodidae)?
- Hoeveel duizend bladzijden telt het Woordenboek der Nederlandsche Taal?
- Hoe zwaar was de grootste chocoladereep ooit in kilogram?
- Hoeveel kg afval produceert een Nederlander gemiddeld per jaar?
- In welk jaar werd de eerste vlucht rond de wereld voltooid?
- Hoeveel vogelsoorten telt Australië?
- Ruim hoeveel meter lang was de recordhotdog van Novex in Paraguay in 2011?
- Hoeveel duikboten telt de Nederlandse marine standaard per vloot?
- Hoeveel kilometer lang is de Murray?
- Hoeveel belangrijkste producten ontstaan bij de reactie tussen azijn en baking soda?
- In welk jaar werd de eerste commerciële mobiele telefoon uitgebracht?
- Hoeveel delen CO₂ per miljoen delen lucht zat er rond het pre-industriële referentiejaar in de atmosfeer?
- Hoeveel miljard kilometer legt licht af in één lichtjaar, afgerond?
- Hoeveel UNESCO-werelderfgoedlocaties had Duitsland in 2025?
- Hoeveel procent van de Nederlanders fietst dagelijks?
- Hoeveel seizoenen telde de serie The Office US?
- Hoeveel zetels telt het Nieuw-Zeelandse parlement normaal, zonder overhangzetels?
- Hoeveel minuten duurt de film Avatar: The Way of Water?
- Hoeveel hotels had Hilton eind 2023 wereldwijd ongeveer?
- Hoeveel Grammy-nominaties had Beyoncé in totaal bij de uitreiking van februari 2025?
- Hoeveel minuten duurde de recordplank van Josef Šálek in mei 2023, afgerond?
- Hoeveel deelverzamelingen heeft een verzameling met acht elementen?
- Hoe hoog was de hoogste hond ooit in centimeters?
- Hoeveel uur duurde het langste videogame-marathonrecord (stand 2026)?
- Hoeveel staten liggen er op het Noord-Amerikaanse vasteland van de VS (exclusief Alaska en Hawaii)?
- Hoeveel liter soep bevatte de grootste kom soep ooit?
- Welk percentage van het wereldwijd geproduceerde staal wordt gebruikt in de bouw?
- Hoeveel letters heeft het Armeense alfabet?
- In welk jaar werd India onafhankelijk van Groot-Brittannië?
- Hoeveel velden telt een Engels dambord van 8 bij 8?
- In welk jaar werd Argentinië onafhankelijk van Spanje?
- Wat is de gemiddelde diepte van alle wereldzeeën en oceanen in meters?
- In welk jaar werd de eerste camera uitgevonden?
- Hoeveel minuten duurt een ijshockeywedstrijd netto?
- In welk jaar werd het eerste succesvolle vaccin ontwikkeld?
- Hoeveel minuten duurt een rugbywedstrijd netto?
- Hoeveel afleveringen telt de serie Friends in totaal?
- Wat is de autorij-afstand van Amsterdam naar Rome in km?
- Wat is de diameter van de aarde ongeveer?
- Hoeveel miljoen ton plastic afval lekt jaarlijks in rivieren, meren en zeeën, volgens de ondergrens van de VN-schatting?
- Hoeveel meter hoog is de Domtoren in Utrecht?
- Hoeveel liter melk geeft een gemiddelde Nederlandse koe per jaar?
- In welk jaar riep Colombia zijn onafhankelijkheid van Spanje uit?
- Wat is de snelheid van het geluid in droge lucht bij 20°C in km/u?
- Hoeveel maanmissies naar de maan (Chang e-programma) lanceerde China?
- Hoeveel procent van de oorspronkelijke bossen in de wereld is nog over?
- Hoe hoog was het hoogste paard ooit in centimeters?
- Hoe zwaar was de zwaarste hond ooit in kilogram?
- In welk jaar werd de eerste moderne volkstelling gehouden?
- Hoeveel kilometer lang is het metronet van Rotterdam?
- Hoeveel minuten officiële speeltijd heeft een Americanfootballwedstrijd in de NFL?
- Hoeveel afleveringen telt de Amerikaanse versie van The Office?
- Hoeveel verkeerslichten zijn er ongeveer in New York City?
- Hoeveel ton bommen werd tijdens de Blitz op Londen afgeworpen?
- Hoeveel marathons had de Duitser Horst Preisler eind 2004 gelopen?
- In welk jaar werd Venezuela onafhankelijk van Spanje?
- In welk jaar werd Paraguay onafhankelijk van Spanje?
- Hoeveel punten levert een touchdown op in American football (met extra point)?
- Hoe lang was de langste hond ooit in centimeters?
- Hoeveel procent van de wereldkoffie komt uit Brazilië?
- Hoeveel milliliter gaat er in een standaard Nederlands borrelglas jenever?
- Hoeveel schepen werden ingezet bij de evacuatie van Duinkerke?
- Uit hoeveel eilanden bestaat Indonesië, afgerond op duizendtallen?
- Hoeveel nationale parken telt de Verenigde Staten?
- Hoe klein was het kleinste paard ooit in centimeters?
- Hoeveel bekende manen heeft Saturnus (stand 2026)?
- Hoe zwaar was de zwaarste hamburger ooit in kilogram?
- Hoeveel letters heeft het Russische alfabet?
- Hoeveel meter hoog is One World Trade Center?
- Hoeveel miljoen motorvoertuigen werden er in 2022 wereldwijd geproduceerd?
- In welk jaar werd de Al-Qarawiyyin in Fez gesticht, de oudste nog bestaande universiteit?
- Hoeveel wielen heeft een standaard stadsbus meestal?
- Hoeveel terrassen heeft de Euromast in Rotterdam totaal?
- In welk jaar werd Bolivia onafhankelijk van Spanje?
- Hoeveel duizend kilometer fietspad telt Nederland?
- Welk percentage van het wereldwijde cement wordt geproduceerd in China?
- Hoeveel kilometer fietst een Nederlander gemiddeld per jaar?
- In welk jaar werd de Eerste Franse Republiek uitgeroepen?
- Hoeveel leden telt het Britse Lagerhuis?
- Hoeveel staten telt de Verenigde Staten?
- Hoe zwaar was de grootste kaas ooit gemaakt in kilogram?
- Hoeveel uren zitten er in een standaard kalenderjaar?
- Hoeveel verschillende euromunten zijn er?
- In welk jaar vond de Slag bij Waterloo plaats?
- Hoeveel schaatsbanen van 400 meter telt Nederland?
- In welk jaar werd penicilline ontdekt?
- Hoeveel genummerde vakjes heeft een Europees roulettewiel, inclusief 0?
- Hoeveel magen heeft een koe?
- Hoeveel verdiepingen heeft De Rotterdam van architect Rem Koolhaas?
- Hoeveel letters heeft het Thaise alfabet?
- Hoeveel sterren staan er op de vlag van de Verenigde Staten?
- Hoeveel soldaten telde het Brits-geallieerde leger van Wellington bij Waterloo ongeveer?
- Hoeveel vierkante kilometer groot is de provincie Utrecht?
- Hoeveel korfbal-spelers staan er per team op het veld bij de Nederlandse Korfbal League?
- Hoeveel keer won Australië de Rugby World Cup bij de mannen tot 2023?
- Hoeveel naamvallen heeft het Duits?
- Hoeveel dieren bevat de klassieke Big Five van Afrika?
- Hoeveel push-ups deed Charles Servizio in 24 uur in april 1993, afgerond op duizendtallen?
- Hoeveel graden is elke binnenhoek van een regelmatige zeshoek?
- In welk jaar werd de eerste radio-uitzending gemaakt?
- Hoeveel bijen leven er in een sterk bijenvolk in de zomer?
- Hoeveel kilogram voedsel (bladeren, gras, takken) eet een volwassen Afrikaanse olifant per dag?
- Hoeveel meter hoog is het hoogste punt van het Millauviaduct?
- Hoeveel kilometer lang is de kustlijn van Noorwegen ongeveer, inclusief eilanden?
- Hoeveel kilogram woog de zwaarste schildpad ooit, volgens het National Museum Wales?
- Hoeveel meter hoog is De Zalmhaven in Rotterdam?
- Hoeveel kilometer moet een bijenvolk gezamenlijk vliegen om één kilo honing te produceren?
- In welk jaar reed de eerste elektrische auto?
- Hoeveel EU-lidstaten gebruikten de euro in 2025?
- Hoeveel vierkante kilometer is het Victoriameer ongeveer?
- Hoeveel landen ondertekenden de UNESCO-grondwet in 1945?
- In welk jaar werd de eerste digitale camera ontwikkeld?
- Hoe lang was de langste kat ooit in centimeters?
- In welk jaar werd de eerste laptop uitgebracht?
- Hoeveel medeklinkerletters heeft het Thaise alfabet?
- Hoeveel tanden wisselt een haai gedurende zijn leven ongeveer?
- Hoeveel minaretten heeft de Taj Mahal?
- Hoeveel kilometer lang is de Niger?
- Hoeveel vel papier zitten er in een standaard riem printpapier?
- Hoeveel liter olijfolie gebruikt een Griek per jaar?
- Hoeveel procent van de wereldwijde landbouwgrond wordt geïrrigeerd?
- In welk jaar werd Brazilië officieel onafhankelijk van Portugal?
- Hoeveel duizend beeldpunten telt een Full HD-scherm?
- Wat is het atoomnummer van ijzer?
- Hoeveel mensen namen deel aan de grootste massale yogales?
- Hoeveel vakjes telt de looproute rond een standaard Mens-erger-je-niet-bord?
- Wat is het grootste binnenlandse waterlichaam ter wereld naar oppervlakte?
- Wat is de snelheid van het licht in vacuüm in kilometer per seconde?
- Hoeveel smaakpapillen heeft een menselijke tong ongeveer?

### Race (nog niet eerder getelde vragen)

- Hoeveel procent van het lichaam was bedekt met tatoeages bij de meest getatoeëerde man?
- Hoeveel watt levert de standaard USB-C-lader van Apple voor de iPhone?
- Hoeveel Muzen (dochters van Zeus) telt de Griekse mythologie?
- Hoeveel groepen heeft het moderne periodiek systeem?
- Hoeveel kilometer lang is het metronet van Mexico-Stad?
- Hoeveel spelers heeft een rugbyteam per ploeg op het veld (union)?
- Hoeveel bulten heeft een Bactrische kameel?
- Hoeveel piramides telt Egypte ongeveer?
- Hoeveel kilogram rundvlees eet een Argentijn per jaar?
- Hoeveel meter lang is het Millauviaduct in Frankrijk?
- In welk jaar werd de eerste internationale telefonische verbinding gemaakt?
- Hoeveel hartkleppen heeft het menselijk hart?
- Hoeveel kilometer per uur zwemt een dolfijn op zijn snelst?
- Hoeveel vogelsoorten telt Colombia, het land met de meeste ter wereld?
- Hoeveel biljoen bacteriën leven er naar schatting in en op het menselijk lichaam?
- Hoeveel procent van de extra warmte door klimaatverandering wordt door de oceanen opgenomen?
- Hoeveel duizend knipperbewegingen met je ogen maak je gemiddeld per dag?
- Hoeveel keer werd de FIFA World Cup georganiseerd tot en met 2022?
- Hoeveel liter zuurstof verbruikt een volwassen mens gemiddeld per dag?
- Hoeveel kilometer lang is de Nederlandse kustlijn ongeveer?
- Hoeveel liter water is volgens de gangbare berekening nodig om één kilogram rundvlees te produceren?
- In welk jaar werd de eerste reageerbuisbaby geboren?
- Hoeveel zijvlakken heeft een icosaeder?
- Hoeveel kcal heeft een middelgroot ei?
- Hoeveel landen ondertekenden het Verdrag van Rome in 1957?
- Hoeveel graden Celsius kookt water op zeeniveau?
- Hoeveel soorten worst kent de Duitse keuken ongeveer?
- Hoe lang was de langste man ooit in centimeters?
- Hoeveel noten bevat een standaard majeurtoonladder inclusief het herhaalde octaaf?
- Hoeveel dagen duurde de reis van de Mayflower naar Noord-Amerika?
- Hoeveel landen grenzen aan Brazilië?
- Hoeveel ogen heeft een bij?
- Hoeveel millimeter per jaar verschuiven de aardplaten gemiddeld?
- Hoeveel kolibriesoorten komen voor in de Verenigde Staten?
- Hoeveel zetels telde het Australische Huis van Afgevaardigden na de verkiezingen van 2022?
- Hoeveel minaretten heeft de Blauwe Moskee in Istanbul?
- In welk jaar maakte Robert Fultons onderzeeër Nautilus zijn eerste proefvaart?
- Hoeveel uur per dag slaapt een leeuw gemiddeld?
- Welk percentage van het wereldwijde staal werd in 2023 in China geproduceerd?
- Hoeveel kaassoorten produceert Frankrijk ongeveer?
- Hoeveel zuilen heeft het Parthenon aan de lange zijde?
- Hoeveel leden heeft de G7?
- Hoeveel ribben heeft een menselijk lichaam in totaal?
- Hoeveel graden Celsius is de gemiddelde zomertemperatuur in Nederland?
- Hoeveel miljoen kilometer is de gemiddelde afstand van de aarde tot de zon?
- In welk jaar werd de eerste succesvolle orgaantransplantatie uitgevoerd?
- Hoeveel jaar kan een reuzenschildpad ongeveer oud worden?
- In welk jaar maakte Martin Behaim de oudste bewaard gebleven globe?
- Hoeveel bitcoins kunnen er maximaal worden gecreëerd?
- Wat is de autorij-afstand van Amsterdam naar Parijs in km?
- Hoeveel manieren kun je 3 renners op een podium van 8 deelnemers indelen?
- Hoeveel landen deden mee aan het FIFA World Cup 2022?
- Hoeveel procent bedraagt het standaard-btw-tarief in België?
- Hoeveel meter lang is het cruiseschip Rotterdam?
- Hoeveel soorten worden volgens de gangbare schatting met uitsterven bedreigd?
- Wat is de totale geschatte lengte van alle bloedvaten in een volwassen menselijk lichaam in kilometers?
- Hoeveel dagvlindersoorten komen voor in Nederland?
- Hoeveel facetten heeft een rond briljant geslepen diamant, zonder de punt (culet) mee te tellen?
- Hoeveel liter water kan een kameel in één keer drinken?
- Hoeveel boogsegmenten telt het Colosseum per verdieping?
- Hoeveel jongleurs deden mee aan het grootste jongleerrecord?
- Hoeveel vleugels heeft een bij?
- Hoeveel kilogram woog de zwaarste pompoen ter wereld eind 2025?
- Hoeveel soldaten namen aan beide kanten samen deel aan de Slag bij Waterloo?
- Hoeveel botten heeft een volwassen menselijk lichaam?
- Hoe lang duurde de langste voetbalwedstrijd ooit in minuten?
- Hoeveel Matrix-films verschenen er vóór The Matrix Resurrections (2021)?
- Hoeveel wervels telt de menselijke wervelkolom in totaal?
- Hoeveel Jurassic Park-films verschenen er vóór Jurassic World (2015)?
- Hoeveel snaren heeft de klassieke Afrikaanse kora traditioneel?
- Hoeveel koppen had Cerberus, de mythologische hond die de onderwereld bewaakt?
- In welk jaar werd Kenia onafhankelijk van Groot-Brittannië?
- Hoeveel kilometer lang is de Kongo?
- In welk jaar werd de eerste röntgenfoto gemaakt?
- Hoeveel ton koper wordt wereldwijd jaarlijks geproduceerd?
- Hoeveel ton plastic wordt wereldwijd jaarlijks geproduceerd?
- Hoeveel spieren heeft het menselijk lichaam ongeveer?
- Hoeveel werelden verbindt de wereldboom Yggdrasil in de Noorse mythologie?
- Hoeveel zijden heeft een octagoon?
- Hoeveel piercings had Rolf Buchholz, de man met de meeste piercings, in 2012?
- Hoeveel poten heeft een kreeft?
- Hoeveel elektronen kan de derde elektronenschil maximaal bevatten?
- Hoeveel protonen heeft een neutraal atoom van wolfraam?
- In welk jaar kwam de eerste commerciële microprocessor, de Intel 4004, uit?
- Hoeveel kiesmannen telt het Amerikaanse Electoral College?
- Hoeveel kilometer lang is de Mississippi ongeveer?
- Hoeveel lemuursoorten telt Madagaskar ongeveer?
- In welk jaar werd Egypte officieel onafhankelijk van Groot-Brittannië?
- Hoeveel verdiepingen heeft de Gran Torre Santiago in Chili, het hoogste gebouw van Zuid-Amerika?
- Hoeveel koloniën kwamen in 1776 in opstand tegen Groot-Brittannië?
- Hoeveel leeuwen staan er rond de Nelson’s Column in Londen?
- Hoeveel stenen staan er in de Stonehenge-hoofdstructuur ongeveer overeind?
- Hoeveel procent van de atmosfeer bestaat ongeveer uit zuurstof?
- Hoeveel mensen bezochten de Wereldtentoonstelling van 1893 in Chicago?
- Hoeveel munten telt een volledige set eurocent- en euromunten?
- Hoeveel strepen heeft het klassieke Adidas-logo?
- Hoeveel cilinders had de Honda RA168E Formule 1-motor uit 1988?
- Hoeveel boeken bevat de katholieke Bijbel?
- Hoeveel halve tonen bevat een octaaf?
- Hoeveel eilanden telt Papoea-Nieuw-Guinea ongeveer?
- Hoeveel procent bedraagt het standaard-btw-tarief in Duitsland?
- Uit hoeveel parallelle boogspanten bestaat de boog van de Sydney Harbour Bridge?
- Hoeveel oorspronkelijke meetpunten van de Struve-geodetische boog zijn als UNESCO-onderdeel opgenomen?
- Hoeveel meter is de kortste individuele olympische langebaanschaatsafstand?
- Hoeveel paar chromosomen heeft een kat?
- Hoeveel snaren heeft een standaard gitaar?
- Hoeveel speelkaarten zitten er in een standaard kaartspel (zonder jokers)?
- Hoeveel dwergplaneten erkent de Internationale Astronomische Unie officieel?
- Hoeveel verdiepingen heeft de Q1 Tower aan de Gold Coast in Australië?
- Hoe hoog was de hoogste robot ooit gebouwd in meters?
- Hoeveel farao’s hadden de drie grote piramides van Gizeh als opdrachtgever?
- Hoeveel chromosomen telt een gezonde menselijke cel?
- Hoeveel landen worden door de evenaar doorkruist?
- Hoeveel bogen heeft de Romeinse brug Pont du Gard in de onderste booglaag?
- Hoe lang waren de langste vingernagels aan één hand in meters?
- Hoeveel fysieke spoorlijnen telt de New York City Subway volgens de gangbare indeling?
- Hoeveel elektronen heeft een chloride-ion, Cl⁻?
- Hoeveel snaren heeft een Chinese guzheng?
- Hoeveel windturbinebladen heeft een moderne windturbine meestal?
- Hoeveel gram suiker zit er in een Amerikaans blikje Coca-Cola van 355 ml?
- Hoeveel versies van Zonnebloemen in een vaas schilderde Van Gogh in Arles?
- Hoeveel perioden heeft het moderne periodiek systeem?
- Hoeveel suikerklontjes van 4 gram komen overeen met de suiker in een blikje cola van 330 ml (afgerond)?
- Hoeveel meter breed mag een voetbalveld maximaal zijn buiten internationale wedstrijden?
- Hoeveel zijden heeft een hexagoon?
- Welk percentage van plastic afval wordt wereldwijd gestort?
- Hoeveel provincies telt China?
- Hoeveel lijnen heeft de metro van Rotterdam?
- Hoeveel duizend kilometer lang is de kustlijn van het Australische vasteland?
- Hoeveel vakken heeft een klassieke eierdoos meestal?
- Hoeveel keer won Frankrijk de Tour de France bij de mannen tot 2024?
- Hoeveel poten heeft een spin?
- Hoeveel metrolijnen heeft Amsterdam?
- Welke pH-waarde heeft zuiver water bij kamertemperatuur ongeveer?
- Hoeveel paarden en godinnen beeldt de quadriga op de Brandenburger Tor samen uit?
- Hoeveel boeken bevat de Hebreeuwse Bijbel volgens de joodse indeling?
- Wat is een perfecte score bij tienpinsbowling?
- Hoeveel teams spelen er in de NFL?
- Hoeveel tekens bevat het Japanse hiragana?
- Hoeveel doelpunten maakte Robin van Persie voor het Nederlands elftal?
- Hoeveel atomen bevat één molecuul water?
- Hoeveel miljoen ton groene koffiebonen produceerde de wereld in 2023?
- Hoeveel ingangen had het Colosseum?
- Hoeveel pionnen gebruikt iedere speler bij Mens-erger-je-niet?
- Hoeveel liter bloed heeft een volwassen mens ongeveer?
