# Redactionele moeilijkheidscontrole — 15 november 2026

Dit is een redactionele beoordeling van kennislast en bruikbare aanknopingspunten, niet met spelers gekalibreerde moeilijkheid. Kleine getallen maken een onbekend feit niet vanzelf makkelijk. Gelijke aantallen per niveau zijn geen kwaliteitsdoel.

## Uitgevoerde correcties

| Library | Oud | Nieuw | Reden |
|---|---|---|---|
| 52 | easy | hard | Animal Farm-hoofdstukken, Sopranos-seizoenen en Tanganyika-landen bieden geen breed dagelijks anker. |
| 70 | easy | hard | Kaasrijping, Alpenconventie en boeddhistische waarheden vragen specifieke kennis. |
| 76 | easy | hard | Tiple-snaren, Mali-buren en Dickens-strofen zijn drie nichefeiten. |
| 78 | intermediate | hard | Naast de Veiligheidsraad staan twee specialistische tellingen: Salmanazar-inhoud en Vietnamese tonen. |
| 83 | intermediate | hard | Niger-buren, Europese kuuroorden en Ulysses-episoden bieden weinig intuïtieve houvast. |
| 98 | extremely-hard | easy | Millimeters per centimeter en de gouden bruiloft helpen het aantal buurlanden bepalen. |
| 107 | extremely-hard | easy | Eurocenten en de planeten buiten de aarde helpen de twintigvlaksdobbelsteen bepalen. |
| 108 | extremely-hard | intermediate | F1-wielen en dambordvakjes helpen het onbekende symfonienummer bepalen. |
| 109 | extremely-hard | easy | Minuten in twee uur en touchdownpunten helpen het atoomnummer bepalen. |

Elke gewijzigde selectie heeft `difficulty_review` met de redactionele reden en de oude indeling en score. `difficulty_score` is voor deze negen puzzels `null`: er is geen nieuwe numerieke meting. De frontend gebruikt dit scoreveld niet. IDs, volgorde, vragen en antwoorden zijn behouden. Verdeling na deze correcties: 28 easy, 27 intermediate, 33 hard en 24 extremely-hard.

`tools/maak_review_library.py --library-only` publiceert alleen het frontend-puzzelbestand en schrijft geen bron- of vertaalbestanden. Vergelijking met HEAD bevestigde dat alleen negen Library-records wijzigden, uitsluitend in `difficulty`, `difficulty_score` en `difficulty_review`; alle andere secties bleven exact gelijk. `python tools/controleer_puzzels.py` slaagde; bestaande foto- en kleurwaarschuwingen bleven waarschuwingen. De validator hoefde niet aangepast te worden.

## Voorlopig voorstel voor de volledige reeks — niet uitgevoerd

Deze bredere indeling is onbevestigd. Zij vraagt een tweede inhoudelijke beoordeling en daarna observaties bij nieuwe spelers. Vooral de schatvragen in 12–20 en 38–49 zijn onzeker: bronafbakening en toegestane precisie bepalen mede of ze eerlijk aanvoelen.

- easy: 1–10, 64, 71, 98, 107, 109.
- intermediate: 11–20, 50–51, 53–55, 57, 65, 68–69, 72–74, 77, 82, 84, 86–88, 90–91, 93–94, 96, 99, 101–102, 104, 108, 110–112.
- hard: 21–37, 52, 56, 58–63, 66, 70, 75–76, 78–81, 83, 85, 89, 92, 95, 97, 100, 103, 106.
- extremely-hard: 38–49, 67, 105.

## Wat de inventaris wel en niet aantoont

De Library bevat 112 puzzels en 336 unieke vraag-IDs en Engelse vraagteksten. Bij 190 van de 336 selectievragen ontbreekt het bestaande `rating`-veld. De selectie heeft vijftien atoomnummer-, elf landgrens- en vijf flesinhoudvragen: tekstuele uniciteit garandeert geen thematische variatie. Exacte sommen hebben zes extra herhalingen; `12 − 7 = 5` komt drie keer voor. Dit zijn redactionele signalen, geen automatische afkeurregels.

De oude brede generator schat moeilijkheid uit bewerking, getalgrootte en rondheid. De huidige Library is een afzonderlijke redactionele selectie; de structuurcontrole bewijst kloppende sommen en consistentie, geen speelplezier of feitelijke bronjuistheid. De lokale Daily-selectie bevat slechts twintig historische puzzels en geeft geen volledige beoordeling van de actuele serverplanning.

Voor vervolgwerk: beoordeel per vraag kennislast, schatbaarheid, ankerrol en bronzekerheid; beoordeel per puzzel de rekenlast en of bekende antwoorden werkelijk een onbekend antwoord ontsluiten. Meet vervolgens bij spelers begrip, voltooiing en terugkeer voordat de labels als gekalibreerd worden gepresenteerd.
