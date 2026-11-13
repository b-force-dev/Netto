# Nieuwe puzzels — 13 november 2026

## Resultaat en beperking

Toegevoegd: **18 Library-puzzels** (49 → 67) en **20 Find the Connection-puzzels** (20 → 40), samen 114 opnieuw gecontroleerde vragen. Het doel van minstens 60 nieuwe Library-puzzels is **niet gehaald**; er ontbreken nog 42. Dit is een kleinere afgeronde uitbreiding, geen volledige uitvoering van de gevraagde aantallen. Er zijn geen ongecontroleerde opvulvragen gepubliceerd.

Alle bestaande puzzel-id’s, antwoorden, volgorde, categorieën en foto’s zijn met HEAD vergeleken en behouden. Alleen de gevraagde Engelse spellingscorrecties veranderen bestaande labels. De nieuwe UUIDv5-id’s volgen `netto/{modus}-curated-20260927/{operator}/{vraagids}`. Vraagids `bank-{Nr}` verwijzen naar de kolom Nr van de reviewbank; oude vraag-id’s zijn als alias gereserveerd. De bestaande editie blijft behouden, zodat eerder opgeslagen voortgang blijft werken.

## Aantallen per niveau

| Modus | Niveau | Voor | Nieuw | Na |
|---|---|---:|---:|---:|
| library | easy | 10 | 8 | 18 |
| library | intermediate | 10 | 6 | 16 |
| library | hard | 17 | 3 | 20 |
| library | extremely-hard | 12 | 1 | 13 |
| connection | easy | 0 | 15 | 15 |
| connection | intermediate | 20 | 5 | 25 |
| connection | hard | 0 | 0 | 0 |
| connection | extremely-hard | 0 | 0 | 0 |

Veertien van de achttien Library-toevoegingen staan in de twee eerste niveaus. Niveaus zijn redactionele inschattingen, geen metingen bij spelers.

## Bewerkingen en categorieën

| Nieuwe reeks | + | − | × | ÷ |
|---|---:|---:|---:|---:|
| library | 9 | 4 | 3 | 2 |
| connection | 7 | 3 | 5 | 5 |

Alle sommen zijn exact, met positieve gehele getallen. Geen nieuwe puzzel deelt een kleurfamilie of zichtbare eenheid. De bestaande waarschuwingen van de validator blijven apart zichtbaar.

| Modus / niveau | Categorieverdeling nieuwe vragen |
|---|---|
| library / easy | Boeken en literatuur: 2, Dieren: 1, Economie & geld: 1, Films en series: 5, Filosofie, psychologie en religie: 1, Gebouwen en infrastructuur: 1, Geografie: 3, Geschiedenis: 1, Kunst en cultuur: 1, Muziek: 1, Reizen en toerisme: 1, Sport: 5, Taal: 1 |
| library / intermediate | Biologie & gezondheid: 1, Boeken en literatuur: 1, Dieren: 2, Films en series: 3, Filosofie, psychologie en religie: 1, Gebouwen en infrastructuur: 4, Geschiedenis: 1, Scheikunde: 2, Taal: 2, Vervoer: 1 |
| library / hard | Biologie & gezondheid: 1, Films en series: 1, Gebouwen en infrastructuur: 1, Muziek: 1, Politiek en recht: 1, Spellen en speelgoed: 2, Sport: 2 |
| library / extremely-hard | Economie & geld: 1, Gebouwen en infrastructuur: 1, Taal: 1 |
| connection / easy | Biologie & gezondheid: 2, Boeken en literatuur: 3, Dieren: 1, Films en series: 6, Filosofie, psychologie en religie: 3, Geografie: 8, Geschiedenis: 1, Muziek: 3, Politiek en recht: 1, Scheikunde: 1, Spellen en speelgoed: 1, Sport: 7, Sterrenkunde & ruimte: 2, Taal: 4, Technologie: 1, Vervoer: 1 |
| connection / intermediate | Films en series: 3, Gebouwen en infrastructuur: 1, Geografie: 1, Geschiedenis: 2, Muziek: 2, Scheikunde: 1, Spellen en speelgoed: 2, Sport: 2, Sterrenkunde & ruimte: 1 |

## Bronnen en gegevensketen

De oorspronkelijke bank `vragen/1000+ vragen netjes gecategoriseerd.xlsx` is een legacy-invoer. De huidige generator en validator lezen `vragen/vragen_review_compleet.xlsx`, blad Vragen. De 114 gebruikte rijen zijn gericht bijgewerkt: korte Engelse hoofdtekst, gelijkwaardige Nederlandse afbakening, bron en Nederlandse bewijszin. Antwoorden zijn niet veranderd. Er zijn geen nieuwe feiten aan het legacy-werkboek toegevoegd.

De selectie staat in `puzzels/library_selectie_20260927.json` en `puzzels/connection_selectie_20260927.json`. De scripts `tools/maak_review_library.py` en `tools/maak_review_connection.py` hebben daaruit de publieke puzzels opnieuw gegenereerd. De brede generator `puzzels/maak_unieke_puzzels.py` en de oorspronkelijke kwaliteitsreview zijn niet opnieuw gedraaid: dat zou bestaande puzzels vervangen. De eerdere gerichte correctieronde diende als voorbeeld.

Op 13 november 2026 zijn de bronpagina’s opnieuw opgehaald en met gerichte webzoekvragen gecontroleerd. Wikipedia, officiële organisaties, universiteiten en de primaire boektekst leveren de feiten; algemene startpagina’s zijn waar nodig vervangen door een concrete artikel- of regelpagina. Bij iedere nieuwe vraag staan bron-URL, Nederlandse bewijszin, Engelse bewijszin en controledatum in de selectie. `data/netto_bronnen.js`, `data/netto_bronnen_en.js`, `data/netto_translations_en.js` en de reviewmetadata sluiten daarop aan. De formulering is een korte eigen samenvatting, geen overgenomen bronpassage.

Ook het lokale private Daily-dossier van deze datum is alleen gelezen. De verschenen Dailies en de inmiddels ingeplande nieuwe reeks zijn buiten deze uitbreiding gehouden, inclusief inhoudelijke tekstvarianten zoals uranium, Shakespeare, harp, Thai, Sagrada Família en Lake Baikal. Supabase is niet gewijzigd.

Voorbeelden van gerichte afbakening: Brooklyn Bridge van Centre Street tot Sands Street (andere meetpunten geven 1834 meter); Catan voor drie/vier spelers; Eon-producties voor Sean Connery; bovengrondse verdiepingen; NBA/NFL of sportdiscipline waar nodig; eind 2024 voor gewonnen titels; eind 2025 voor elementen en ringen.

Britse spelling is beperkt tot Engelse labels, Engelse reviewkeys, eenheden, ondertitels, Engelse bewijszinnen en vertaalwaarden. Nederlandse teksten, Nederlandse sleutels en URL’s zijn niet door een algemene vervangactie gegaan. Race en Breinkrakers bevatten in deze checkout Nederlandse labels en hoefden daardoor niet gewijzigd te worden.

## Controle en integratie

Geslaagd: `python tools/controleer_puzzels.py`, `node tools/test_quality_review.cjs`, `node tests/daily-reliability.cjs`, `node tests/daily-server.cjs`, `node tests/usage.cjs`, `node tests/puzzle-library.cjs`. De kwaliteitstest telt nu de historische review plus de expliciet vastgelegde bankaanvulling; hij controleert nog steeds unieke ids, reserveringen, status en antwoorden.

In de lokale site op poort 8879 zijn Library 50, 64 en 67 in het Engels tot resultaat gespeeld; FTC 21 en 40 eveneens. Library 51 is in het Nederlands tot resultaat gespeeld. Bij alle zes zijn vraagtekst, eenheid/afbakening, daadwerkelijke antwoorden, opengeklapte uitleg en de drie bronlinks bekeken. Exacte antwoorden leverden factor 1,00 op; FTC gaf een gevonden verband.

De taalkeuze herlaadt de huidige route. Nieuwe routebestanden bestaan lokaal nog niet; daarom is voor de Nederlandse controle teruggegaan naar de root. De integrator moet naast cacheversies en website-sync ook de gebruikelijke routegeneratie uitvoeren. Bestaande fotobijschriften tonen op sommige plekken nog “Bij vraag” in de Engelse weergave; dit bestaande frontendpunt is niet aangepast.

`website/`, `?v=`, `data/netto_fotos.js` en `fotos/` zijn niet gewijzigd. Bestaande fotometadata is alleen hergebruikt waar beschikbaar; de Hangul-telplaat en G20-groepsfoto zijn niet aan de nieuwe puzzels gekoppeld. De nieuwe vragen hebben nog geen afzonderlijke visuele fotoreview gehad.

## Wat nog aandacht vraagt

De Library groeit met achttien in plaats van zestig. De nieuwe set bevat relatief veel grens-, alfabet- en cultuurvragen en geen nieuwe voedselvragen. Voor de vervolgronde zijn vooral verse natuur-, voedsel-, wetenschap- en ruimtevragen nodig. Herkenbare titels en ankers maken deze selectie speelbaar, maar de categorievariatie en hoeveelheid zijn nog niet op het gevraagde eindniveau. Bestaande open punten uit de vraagaudit blijven open; dit is geen hercontrole van de volledige Race of Breinkrakers.

## Nieuwe vragen die nog een foto nodig hebben

Hieronder staan de Engelse teksten waarvoor de huidige fotobank geen sleutel heeft met de nieuwe Nederlandse formulering. Bestaande foto’s bij andere formuleringen moeten in de latere fotoronde opnieuw aan onderwerp, telling en licentie worden getoetst. Ook de overige nieuwe vragen vragen nog visuele beoordeling.

- library 50, bank-746: How many theme parks did Walt Disney World in Florida have in 2025, excluding water parks?
- library 50, bank-1342: How many European Cup and UEFA Champions League titles had AC Milan won by the end of 2024?
- library 51, bank-204: How many Matrix films were released before The Matrix Resurrections (2021)?
- library 51, bank-1341: How many men's singles Australian Open titles had Novak Djokovic won by the end of 2024?
- library 53, bank-159: How many eyes does an adult honey bee have?
- library 53, bank-566: How many sovereign countries make up Central America?
- library 53, bank-14: How many episodes does the original Fawlty Towers television series have?
- library 54, bank-1103: How many Eurovision Song Contests had Ireland won by the end of 2024?
- library 54, bank-211: How many obligatory daily prayers are prescribed in Islam?
- library 55, bank-1343: How many European Cup and UEFA Champions League titles had Real Madrid won by the end of 2024?
- library 57, bank-175: How many countries belong to the G20, excluding the EU and African Union?
- library 57, bank-502: How many players per team are on an indoor handball court at full strength, including the goalkeeper?
- library 57, bank-673: How many animal signs are in the traditional Chinese zodiac?
- library 58, bank-161: How many pairs of chromosomes does a domestic cat normally have?
- library 58, bank-205: How many Jurassic Park films were released before Jurassic World (2015)?
- library 58, bank-99: How many wheels are on an Airbus A380's landing gear?
- library 59, bank-1446: How many basic letters are in modern Korean Hangul?
- library 59, bank-239: How many minarets does Istanbul's Blue Mosque have?
- library 59, bank-154: How many chambers does a crocodile's heart have?
- library 60, bank-111: How many chromosomes does a typical mature human egg cell contain?
- library 60, bank-243: How many towers stand on Notre-Dame de Paris's west façade?
- library 60, bank-1451: How many basic characters are in modern Japanese hiragana?
- library 61, bank-208: In how many Eon-produced James Bond films did Sean Connery play Bond?
- library 61, bank-620: How many books are in the Catholic biblical canon?
- library 62, bank-461: How many elements were officially recognised in the periodic table at the end of 2025?
- library 62, bank-248: How many above-ground storeys does the Shanghai Tower have?
- library 63, bank-28: How many columns are in Karnak's Great Hypostyle Hall?
- library 64, bank-195: How many episodes does the completed US version of The Office have?
- library 64, bank-1111: How many lines are in a standard musical stave?
- library 64, bank-108: How many bones are in a typical adult human skeleton, using the standard anatomical count?
- library 65, bank-1418: What is the maximum score in a standard game of ten-pin bowling?
- library 65, bank-75: How many pieces does each player start with in international draughts?
- library 66, bank-21: How many towers are in the Moscow Kremlin's walls?
- library 66, bank-483: How many development cards are in the standard Catan base game for three or four players?
- library 66, bank-1383: How many metres long is the shortest individual Olympic long-track speed skating race?
- library 67, bank-542: How many letters are used in the modern Georgian alphabet?
- library 67, bank-236: How many metres long is the Brooklyn Bridge from Centre Street in Manhattan to Sands Street in Brooklyn, rounded to the nearest metre?
- connection 21, bank-507: How many players per team are in the water in standard water polo at full strength, including the goalkeeper?
- connection 21, bank-1007: How many countries signed the Treaty of Rome establishing the EEC in 1957?
- connection 21, bank-1125: How many strings does a traditional Japanese koto have?
- connection 22, bank-563: How many sovereign countries share a land border with Brazil?
- connection 23, bank-1483: How many provinces does Canada have, excluding its territories?
- connection 23, bank-1411: How many players per team are on the field in rugby league at full strength?
- connection 24, bank-751: How many principal avatars of Vishnu are traditionally listed in the Dashavatara?
- connection 25, bank-907: How many countries share a land border with Tanzania?
- connection 25, bank-1449: How many grammatical cases does modern German have?
- connection 25, bank-608: How many pairs of cranial nerves do humans normally have?
- connection 26, bank-1352: How many innings are scheduled in a standard Major League Baseball game, excluding extra innings?
- connection 26, bank-1421: How many Space Shuttle orbiters did NASA build for spaceflight, excluding Enterprise?
- connection 26, bank-732: How many Oscar nominations did La La Land receive?
- connection 27, bank-1453: How many bits are in a byte under the modern standard definition?
- connection 27, bank-544: How many letters are in the modern Hawaiian alphabet, including the ʻokina?
- connection 28, bank-215: How many worlds does Yggdrasil connect in the traditional account of Norse mythology?
- connection 28, bank-875: How many countries share a land border with Argentina?
- connection 29, bank-481: How many numbered pockets are on a single-zero European roulette wheel, including zero?
- connection 29, bank-1368: How many men's Rugby World Cups had New Zealand won by the end of 2023?
- connection 30, bank-487: How many dots, including power pellets, are in the first maze of the original Pac-Man arcade game?
- connection 30, bank-56: How many semitones make up an octave in twelve-tone equal temperament?
- connection 30, bank-468: At approximately how many degrees Celsius does pure tin melt, rounded to a whole degree?
- connection 31, bank-997: Approximately how many years did the American Revolutionary War last?
- connection 31, bank-25: How many above-ground storeys does each Petronas Twin Tower have?
- connection 32, bank-201: How many films are in the original Godfather series directed by Francis Ford Coppola?
- connection 32, bank-1345: How many Super Bowls did Tom Brady win as a player?
- connection 32, bank-1121: How many strings does a traditional West African kora have?
- connection 33, bank-518: How many main ring groups does NASA distinguish around Saturn?
- connection 33, bank-972: How many standard time zones cover the contiguous United States?
- connection 34, bank-526: How many rings of Uranus had been identified by the end of 2025?
- connection 34, bank-1132: How many numbered symphonies did Johannes Brahms complete?
- connection 34, bank-76: How many cards are in a standard French-suited deck, excluding jokers?
- connection 35, bank-915: How many countries have a coastline on the Black Sea?
- connection 35, bank-1414: How many teams played in the NFL in the 2024 season?
- connection 35, bank-747: How many minutes long is the theatrical version of Avatar: The Way of Water (2022)?
- connection 36, bank-86: How many letters are in the Hebrew alphabet, excluding final-form variants?
- connection 36, bank-506: How many players are in a full cricket team?
- connection 37, bank-212: How many heads does Cerberus usually have in Greek mythology?
- connection 38, bank-135: In how many parts was Cervantes' Don Quixote originally published?
- connection 38, bank-588: How many wheels does a conventional tuk-tuk have?
- connection 39, bank-1385: How many minutes of regulation playing time are in a standard senior ice hockey match, excluding overtime?
- connection 40, bank-1348: How many gold medals did Australia win at the Paris 2024 Summer Olympics?
- connection 40, bank-460: How many atoms make up a single molecule of water?

## Nieuwe puzzels en feiten

| Modus / nummer | Som | Gecontroleerde vragen en bronnen |
|---|---|---|
| library 50 | 3 + 4 = 7 | [bank-203](https://nl.wikipedia.org/wiki/Back_to_the_Future_%28filmtrilogie%29) — How many Back to the Future films were made?; [bank-746](https://en.wikipedia.org/wiki/Walt_Disney_World) — How many theme parks did Walt Disney World in Florida have in 2025, excluding water parks?; [bank-1342](https://en.wikipedia.org/wiki/AC_Milan) — How many European Cup and UEFA Champions League titles had AC Milan won by the end of 2024? |
| library 51 | 3 + 7 = 10 | [bank-204](https://en.wikipedia.org/wiki/The_Matrix_(franchise)) — How many Matrix films were released before The Matrix Resurrections (2021)?; [bank-847](https://nl.wikipedia.org/wiki/Verenigde_Arabische_Emiraten) — How many emirates make up the United Arab Emirates?; [bank-1341](https://en.wikipedia.org/wiki/Novak_Djokovic) — How many men's singles Australian Open titles had Novak Djokovic won by the end of 2024? |
| library 52 | 10 − 6 = 4 | [bank-137](https://www.gutenbergca.gutenbergcanada.ca/ebooks/orwellg-animalfarm/orwellg-animalfarm-00-e.html) — How many chapters does George Orwell's Animal Farm have?; [bank-206](https://en.wikipedia.org/wiki/The_Sopranos) — How many series does the completed television drama The Sopranos have?; [bank-913](https://en.wikipedia.org/wiki/Lake_Tanganyika) — How many countries have a shoreline on Lake Tanganyika? |
| library 53 | 5 + 7 = 12 | [bank-159](https://en.wikipedia.org/wiki/Bee) — How many eyes does an adult honey bee have?; [bank-566](https://en.wikipedia.org/wiki/Central_America) — How many sovereign countries make up Central America?; [bank-14](https://en.wikipedia.org/wiki/Fawlty_Towers) — How many episodes does the original Fawlty Towers television series have? |
| library 54 | 12 − 7 = 5 | [bank-624](https://exhibitions.lib.umd.edu/binaries/content/assets/exhibits/alice150/exhibit-resources/finalalicecatalog.pdf) — How many chapters are in Lewis Carroll's Alice's Adventures in Wonderland?; [bank-1103](https://en.wikipedia.org/wiki/Ireland_in_the_Eurovision_Song_Contest) — How many Eurovision Song Contests had Ireland won by the end of 2024?; [bank-211](https://en.wikipedia.org/wiki/Salah) — How many obligatory daily prayers are prescribed in Islam? |
| library 55 | 15 − 9 = 6 | [bank-1343](https://en.wikipedia.org/wiki/Real_Madrid_CF) — How many European Cup and UEFA Champions League titles had Real Madrid won by the end of 2024?; [bank-739](https://en.wikipedia.org/wiki/Star_Wars) — How many films are in Star Wars' completed Skywalker Saga?; [bank-219](https://en.wikipedia.org/wiki/Pont_du_Gard) — How many arches are in the Pont du Gard's lowest tier? |
| library 56 | 5 × 3 = 15 | [bank-78](https://nl.wikipedia.org/wiki/Rugby_union) — How many points is a try worth in rugby union?; [bank-993](https://nl.wikipedia.org/wiki/Slag_bij_Gettysburg) — Over how many days was the Battle of Gettysburg fought?; [bank-89](https://en.wikipedia.org/wiki/Finnish_language) — How many grammatical cases does Finnish traditionally have? |
| library 57 | 19 − 7 = 12 | [bank-175](https://en.wikipedia.org/wiki/G20) — How many countries belong to the G20, excluding the EU and African Union?; [bank-502](https://en.wikipedia.org/wiki/Handball) — How many players per team are on an indoor handball court at full strength, including the goalkeeper?; [bank-673](https://nl.wikipedia.org/wiki/Chinese_astrologie) — How many animal signs are in the traditional Chinese zodiac? |
| library 58 | 19 + 3 = 22 | [bank-161](https://en.wikipedia.org/wiki/Cat) — How many pairs of chromosomes does a domestic cat normally have?; [bank-205](https://nl.wikipedia.org/wiki/Jurassic_Park_%28franchise%29) — How many Jurassic Park films were released before Jurassic World (2015)?; [bank-99](https://en.wikipedia.org/wiki/Airbus_A380) — How many wheels are on an Airbus A380's landing gear? |
| library 59 | 24 ÷ 6 = 4 | [bank-1446](https://en.wikipedia.org/wiki/Hangul) — How many basic letters are in modern Korean Hangul?; [bank-239](https://en.wikipedia.org/wiki/Sultan_Ahmed_Mosque) — How many minarets does Istanbul's Blue Mosque have?; [bank-154](https://en.wikipedia.org/wiki/Crocodilia) — How many chambers does a crocodile's heart have? |
| library 60 | 23 × 2 = 46 | [bank-111](https://en.wikipedia.org/wiki/Egg_cell) — How many chromosomes does a typical mature human egg cell contain?; [bank-243](https://nl.wikipedia.org/wiki/Notre-Dame_van_Parijs) — How many towers stand on Notre-Dame de Paris's west façade?; [bank-1451](https://nl.wikipedia.org/wiki/Hiragana) — How many basic characters are in modern Japanese hiragana? |
| library 61 | 6 + 73 = 79 | [bank-208](https://nl.wikipedia.org/wiki/Lijst_van_James_Bondfilms) — In how many Eon-produced James Bond films did Sean Connery play Bond?; [bank-620](https://en.wikipedia.org/wiki/Biblical_canon) — How many books are in the Catholic biblical canon?; [bank-73](https://en.wikipedia.org/wiki/Gold) — How many protons are in the nucleus of a gold atom? |
| library 62 | 10 + 118 = 128 | [bank-210](https://en.wikipedia.org/wiki/Republic_(Plato)) — Into how many books is Plato's Republic traditionally divided?; [bank-461](https://nl.wikipedia.org/wiki/Periodiek_systeem) — How many elements were officially recognised in the periodic table at the end of 2025?; [bank-248](https://nl.wikipedia.org/wiki/Shanghai_Tower) — How many above-ground storeys does the Shanghai Tower have? |
| library 63 | 134 + 46 = 180 | [bank-28](https://nl.wikipedia.org/wiki/Tempel_van_Amon_%28Karnak%29) — How many columns are in Karnak's Great Hypostyle Hall?; [bank-1013](https://nl.wikipedia.org/wiki/Joe_Biden) — What number US president was Joe Biden?; [bank-199](https://nl.wikipedia.org/wiki/Seinfeld) — How many episodes does the completed Seinfeld series have? |
| library 64 | 201 + 5 = 206 | [bank-195](https://en.wikipedia.org/wiki/The_Office_(American_TV_series)) — How many episodes does the completed US version of The Office have?; [bank-1111](https://en.wikipedia.org/wiki/Staff_(music)) — How many lines are in a standard musical stave?; [bank-108](https://en.wikipedia.org/wiki/List_of_bones_of_the_human_skeleton) — How many bones are in a typical adult human skeleton, using the standard anatomical count? |
| library 65 | 300 ÷ 20 = 15 | [bank-1418](https://en.wikipedia.org/wiki/Ten-pin_bowling) — What is the maximum score in a standard game of ten-pin bowling?; [bank-75](https://nl.wikipedia.org/wiki/Dammen) — How many pieces does each player start with in international draughts?; [bank-65](https://www.icj-cij.org/court) — How many judges make up the International Court of Justice? |
| library 66 | 20 × 25 = 500 | [bank-21](https://nl.wikipedia.org/wiki/Kremlin_van_Moskou) — How many towers are in the Moscow Kremlin's walls?; [bank-483](https://nl.wikipedia.org/wiki/Catan) — How many development cards are in the standard Catan base game for three or four players?; [bank-1383](https://www.isu-skating.com/en/speed-skating/events/isu-championships/) — How many metres long is the shortest individual Olympic long-track speed skating race? |
| library 67 | 1792 + 33 = 1825 | [bank-180](https://en.wikipedia.org/wiki/New_York_Stock_Exchange) — In what year was the New York Stock Exchange founded?; [bank-542](https://nl.wikipedia.org/wiki/Georgisch_alfabet) — How many letters are used in the modern Georgian alphabet?; [bank-236](https://en.wikipedia.org/wiki/Brooklyn_Bridge) — How many metres long is the Brooklyn Bridge from Centre Street in Manhattan to Sands Street in Brooklyn, rounded to the nearest metre? |
| connection 21 | 7 + 6 = 13 | [bank-507](https://en.wikipedia.org/wiki/Water_polo) — How many players per team are in the water in standard water polo at full strength, including the goalkeeper?; [bank-1007](https://en.wikipedia.org/wiki/Treaty_of_Rome) — How many countries signed the Treaty of Rome establishing the EEC in 1957?; [bank-1125](https://en.wikipedia.org/wiki/Koto_(instrument)) — How many strings does a traditional Japanese koto have? |
| connection 22 | 10 + 4 = 14 | [bank-563](https://nl.wikipedia.org/wiki/Brazili%C3%AB) — How many sovereign countries share a land border with Brazil?; [bank-737](https://en.wikipedia.org/wiki/Parasite_(2019_film)) — How many Oscars did Parasite (2019) win?; [bank-112](https://en.wikipedia.org/wiki/Pea) — How many chromosomes are in a typical body cell of the garden pea, Pisum sativum? |
| connection 23 | 3 + 10 = 13 | [bank-738](https://en.wikipedia.org/wiki/The_Piano) — How many Oscars did The Piano (1993) win?; [bank-1483](https://nl.wikipedia.org/wiki/Canada) — How many provinces does Canada have, excluding its territories?; [bank-1411](https://en.wikipedia.org/wiki/Rugby_league) — How many players per team are on the field in rugby league at full strength? |
| connection 24 | 10 + 4 = 14 | [bank-751](https://en.wikipedia.org/wiki/Dashavatara) — How many principal avatars of Vishnu are traditionally listed in the Dashavatara?; [bank-1127](https://nl.wikipedia.org/wiki/Cello) — How many strings does a standard cello have?; [bank-564](https://en.wikipedia.org/wiki/China) — How many sovereign countries share a land border with China? |
| connection 25 | 8 + 4 = 12 | [bank-907](https://en.wikipedia.org/wiki/Tanzania) — How many countries share a land border with Tanzania?; [bank-1449](https://en.wikipedia.org/wiki/German_declension) — How many grammatical cases does modern German have?; [bank-608](https://en.wikipedia.org/wiki/Cranial_nerves) — How many pairs of cranial nerves do humans normally have? |
| connection 26 | 9 + 5 = 14 | [bank-1352](https://en.wikipedia.org/wiki/Baseball) — How many innings are scheduled in a standard Major League Baseball game, excluding extra innings?; [bank-1421](https://en.wikipedia.org/wiki/Space_Shuttle_program) — How many Space Shuttle orbiters did NASA build for spaceflight, excluding Enterprise?; [bank-732](https://nl.wikipedia.org/wiki/La_La_Land) — How many Oscar nominations did La La Land receive? |
| connection 27 | 8 + 5 = 13 | [bank-1453](https://nl.wikipedia.org/wiki/Byte) — How many bits are in a byte under the modern standard definition?; [bank-427](https://main.un.org/securitycouncil/en/content/current-members) — How many countries hold permanent seats on the UN Security Council?; [bank-544](https://en.wikipedia.org/wiki/Hawaiian_alphabet) — How many letters are in the modern Hawaiian alphabet, including the ʻokina? |
| connection 28 | 9 − 4 = 5 | [bank-215](https://en.wikipedia.org/wiki/Yggdrasil) — How many worlds does Yggdrasil connect in the traditional account of Norse mythology?; [bank-666](https://en.wikipedia.org/wiki/Drosophila_melanogaster) — How many chromosome pairs does a typical fruit fly, Drosophila melanogaster, have?; [bank-875](https://en.wikipedia.org/wiki/Argentina) — How many countries share a land border with Argentina? |
| connection 29 | 37 − 34 = 3 | [bank-481](https://nl.wikipedia.org/wiki/Roulette) — How many numbered pockets are on a single-zero European roulette wheel, including zero?; [bank-143](https://en.wikipedia.org/wiki/Inferno_(Dante)) — How many cantos are in Dante's Inferno?; [bank-1368](https://en.wikipedia.org/wiki/Rugby_World_Cup) — How many men's Rugby World Cups had New Zealand won by the end of 2023? |
| connection 30 | 244 − 12 = 232 | [bank-487](https://cs.au.dk/~ocaprani/GameAI/PacMan/The%20Pac-Man%20Dossier.pdf) — How many dots, including power pellets, are in the first maze of the original Pac-Man arcade game?; [bank-56](https://nl.wikipedia.org/wiki/Octaaf_%28muziek%29) — How many semitones make up an octave in twelve-tone equal temperament?; [bank-468](https://en.wikipedia.org/wiki/Tin) — At approximately how many degrees Celsius does pure tin melt, rounded to a whole degree? |
| connection 31 | 11 × 8 = 88 | [bank-193](https://en.wikipedia.org/wiki/The_Lord_of_the_Rings:_The_Return_of_the_King) — How many Oscars did The Lord of the Rings: The Return of the King win?; [bank-997](https://en.wikipedia.org/wiki/American_Revolutionary_War) — Approximately how many years did the American Revolutionary War last?; [bank-25](https://nl.wikipedia.org/wiki/Petronas_Twin_Towers) — How many above-ground storeys does each Petronas Twin Tower have? |
| connection 32 | 3 × 7 = 21 | [bank-201](https://en.wikipedia.org/wiki/The_Godfather_(film_series)) — How many films are in the original Godfather series directed by Francis Ford Coppola?; [bank-1345](https://en.wikipedia.org/wiki/Tom_Brady) — How many Super Bowls did Tom Brady win as a player?; [bank-1121](https://en.wikipedia.org/wiki/Kora_(instrument)) — How many strings does a traditional West African kora have? |
| connection 33 | 7 × 4 = 28 | [bank-518](https://science.nasa.gov/resource/saturns-rings-2/) — How many main ring groups does NASA distinguish around Saturn?; [bank-972](https://en.wikipedia.org/wiki/Time_in_the_United_States) — How many standard time zones cover the contiguous United States?; [bank-541](https://nl.wikipedia.org/wiki/Arabisch_alfabet) — How many letters are in the standard Arabic alphabet? |
| connection 34 | 13 × 4 = 52 | [bank-526](https://en.wikipedia.org/wiki/Rings_of_Uranus) — How many rings of Uranus had been identified by the end of 2025?; [bank-1132](https://nl.wikipedia.org/wiki/Johannes_Brahms) — How many numbered symphonies did Johannes Brahms complete?; [bank-76](https://en.wikipedia.org/wiki/Standard_52-card_deck) — How many cards are in a standard French-suited deck, excluding jokers? |
| connection 35 | 6 × 32 = 192 | [bank-915](https://en.wikipedia.org/wiki/Black_Sea) — How many countries have a coastline on the Black Sea?; [bank-1414](https://en.wikipedia.org/wiki/2024_NFL_season) — How many teams played in the NFL in the 2024 season?; [bank-747](https://en.wikipedia.org/wiki/Avatar%3A_The_Way_of_Water) — How many minutes long is the theatrical version of Avatar: The Way of Water (2022)? |
| connection 36 | 22 ÷ 11 = 2 | [bank-86](https://en.wikipedia.org/wiki/Hebrew_language) — How many letters are in the Hebrew alphabet, excluding final-form variants?; [bank-506](https://www.lords.org/mcc/the-laws-of-cricket/the-players) — How many players are in a full cricket team?; [bank-562](https://en.wikipedia.org/wiki/Timor) — How many sovereign countries share the island of Timor? |
| connection 37 | 24 ÷ 3 = 8 | [bank-617](https://nl.wikipedia.org/wiki/Odyssee) — Into how many books is Homer's Odyssey divided?; [bank-212](https://en.wikipedia.org/wiki/Cerberus) — How many heads does Cerberus usually have in Greek mythology?; [bank-899](https://en.wikipedia.org/wiki/Austria) — How many countries share a land border with Austria? |
| connection 38 | 6 ÷ 2 = 3 | [bank-735](https://en.wikipedia.org/wiki/Forrest_Gump) — How many Oscars did Forrest Gump win?; [bank-135](https://nl.wikipedia.org/wiki/Don_Quichot_%28boek%29) — In how many parts was Cervantes' Don Quixote originally published?; [bank-588](https://en.wikipedia.org/wiki/Auto_rickshaw) — How many wheels does a conventional tuk-tuk have? |
| connection 39 | 300 ÷ 5 = 60 | [bank-992](https://en.wikipedia.org/wiki/Battle_of_Verdun) — Approximately how many days did the Battle of Verdun last in 1916?; [bank-733](https://en.wikipedia.org/wiki/Gladiator_%282000_film%29) — How many Oscars did Gladiator (2000) win?; [bank-1385](https://en.wikipedia.org/wiki/Ice_hockey) — How many minutes of regulation playing time are in a standard senior ice hockey match, excluding overtime? |
| connection 40 | 18 ÷ 3 = 6 | [bank-1348](https://en.wikipedia.org/wiki/Australia_at_the_2024_Summer_Olympics) — How many gold medals did Australia win at the Paris 2024 Summer Olympics?; [bank-460](https://en.wikipedia.org/wiki/Properties_of_water) — How many atoms make up a single molecule of water?; [bank-736](https://en.wikipedia.org/wiki/Mad_Max%3A_Fury_Road) — How many Oscars did Mad Max: Fury Road win? |
