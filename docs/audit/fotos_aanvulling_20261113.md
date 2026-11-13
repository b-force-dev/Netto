# Aanvulling foto-audit 13 november 2026

## Resultaat

Branch: `t3/add-photos-to-public-questions`. Basis: `00600e9` (bij aanvang gelijk aan opgehaalde `origin/develop`). Geen push uitgevoerd.

**71 unieke openbare vragen kregen een foto.** Daarvan behoren 18 tot de nieuwe vragen uit `nieuwe_puzzels_20261113.md`. Alle 81 nieuwe vragen die bij aanvang een foto misten zijn beoordeeld; 63 blijven zonder foto. Daarna zijn ook oudere Library-, Connection-, ketting- en Race-vragen behandeld.

De actuele inventaris bevat 992 unieke openbare vraagteksten (eerste vindplaats Library, Connection, kettingen, Race), tegenover 906 in de vorige audit. Vooraf: 534 met foto, 458 zonder. Achteraf: 596 met foto, 396 zonder. De netto winst is 62: naast 71 toevoegingen zijn 9 oudere onveilige koppelingen bewust verwijderd. Deze 9 oudere teksten waren niet meer door het huidige werkblad te genereren; ze zijn nu expliciet null. Negen andere veilige oude teksten zijn expliciet behouden.

Van de 396 vragen zonder foto staan er 148 expliciet op null; 248 hebben nog geen beoordeelde uitzondering en blijven open. 87 in deze ronde beoordeelde ontbrekende vragen blijven bewust zonder foto (deels al null uit de eerdere audit). Die null is geen definitief verbod op een later veilig alternatief. Hieronder staat per vraag waarom er nu geen foto is. Ook bij de open vragen kunnen telvragen zitten waarvoor uiteindelijk geen foto passend blijkt.

## Werkwijze en beperking

Eerst de nieuwe vragen, daarna de overige openbare onderwerpen. Beelden zijn opnieuw visueel bekeken op contactvellen, niet alleen op bestandsnaam gekozen. De bronvermelding uit de bestaande Commons-catalogus is behouden: bestandspagina, maker en vrije licentie. Er zijn uitsluitend beelden gebruikt die al met deze gegevens in de repo stonden; deze ronde heeft geen nieuwe Commons-licentiebevestiging via de API verkregen. De voorheen bewaarde Commons-beelden en de ingebedde miniaturen uit de fotowerkbladen maakten verdere beoordeling mogelijk. Kandidaten die een verkeerd onderwerp of verkeerde soort toonden zijn afgewezen. Bij aantalvragen is alleen een contextbeeld gebruikt als het gevraagde aantal niet zichtbaar is, zoals katten bij chromosomen of een shuttle bij vlootomvang.

Netwerk: algemene User-Agent `NettoPhotoReview/1.0 (educational quiz; image attribution review)`, sequentiele verzoeken met 1,5 seconde pauze. Na een HTTP 429 zijn alle verdere Wikimedia-verzoeken gestopt. Twee kandidaten waren daarvoor gedownload; de rest is lokaal beoordeeld. Door deze beperking konden onder meer AC Milan, Real Madrid, Matrix, Tom Brady, Brahms, Avatar en verschillende sportonderwerpen niet met een geschikte bevestigde nieuwe kandidaat worden aangevuld. Bestaande, ongeschikte voorstellen zijn niet als opvulling gebruikt.

Alleen `fotos/publieke_fotos.json`, het gegenereerde `data/netto_fotos.js` en dit verslag zijn gewijzigd. Geen nieuwe assets, scripts of uitvoer gecommit. Geen wijzigingen aan puzzels, werkbladen, Supabase, frontendcode, index, cacheversies of website-mirror. De integrator verzorgt versies en mirror.

## Controle

Na elke partij: `node tests/photo-links.cjs` geslaagd en `python tools/controleer_puzzels.py` eindigt op **ALLES IN ORDE**. De controle betreft de actuele fotobank, bronvermelding, lokale bestanden en bestaande puzzelvoorwaarden. Ook `node tests/daily-reliability.cjs` en `node tests/daily-server.cjs` slagen. Alle 71 toevoegingen hebben een bekende maker en een vrije licentie; onbekende makers zijn voor deze toevoegingen afgewezen. Een tweede generatie is bytegelijk. Er is geen nieuwe browsercontrole of volledige netwerkladen-test uitgevoerd. Reproduceer met `python tools/maak_fotobestand.py`; de veilige oude teksten die anders wegvielen zijn in de canonieke uitzonderingen vastgelegd.

## Toegevoegde foto-koppelingen

| Vraag | Maker | Licentie | Commons |
|---|---|---|---|
| Hoeveel Australian Open-titels in het mannenenkelspel had Novak Djokovic eind 2024 gewonnen? | Andrew Campbell | CC BY 2.0 | [bestand](https://commons.wikimedia.org/wiki/File:Novak_Djokovic_(34775891004).jpg) |
| Hoeveel afleveringen telt de oorspronkelijke televisieserie Fawlty Towers? | Mewhen123 | CC BY 4.0 | [bestand](https://commons.wikimedia.org/wiki/File:Fawlty_Towers_west_end_stage_2024.jpg) |
| Hoeveel spelers staan er per team bij zaalhandbal op het veld, inclusief de keeper? | HarisM | Public domain | [bestand](https://commons.wikimedia.org/wiki/File:Handball_Bosnia_Greece.jpeg) |
| Hoeveel chromosomenparen heeft een huiskat normaal? | Alvesgaspar (compilation) | CC BY-SA 3.0 | [bestand](https://commons.wikimedia.org/wiki/File:Cat_poster_2.jpg) |
| Hoeveel chromosomen bevat een normale rijpe menselijke eicel? | Henry Vandyke Carter | Public domain | [bestand](https://commons.wikimedia.org/wiki/File:Gray3.png) |
| In hoeveel James Bond-films van Eon speelde Sean Connery Bond? | Rob Bogaerts for Anefo | CC BY-SA 3.0 nl | [bestand](https://commons.wikimedia.org/wiki/File:Sean_Connery_(1983).jpg) |
| Hoeveel boeken bevat de katholieke Bijbel? | NYC Wanderer (Kevin Eng) | CC BY-SA 2.0 | [bestand](https://commons.wikimedia.org/wiki/File:Gutenberg_Bible,_Lenox_Copy,_New_York_Public_Library,_2009._Pic_01.jpg) |
| Hoeveel afleveringen telt de Amerikaanse versie van The Office? | tomdobb | CC BY 3.0 | [bestand](https://commons.wikimedia.org/wiki/File:Dunder_mifflin_banner_scranton.jpg) |
| Hoeveel ontwikkelingskaarten bevat het standaard Catan-basisspel voor drie of vier spelers? | Matěj Baťha | CC BY-SA 3.0 | [bestand](https://commons.wikimedia.org/wiki/File:Nepomuk_280_-_Osadn%C3%ADci_z_Katanu.jpg) |
| Hoeveel letters gebruikt het moderne Georgische alfabet? | Henri Bergius from Finland | CC BY-SA 2.0 | [bestand](https://commons.wikimedia.org/wiki/File:Street_sign_in_Georgian_and_Latin_alphabets.jpg) |
| Hoeveel meter lang is de Brooklyn Bridge van Centre Street in Manhattan tot Sands Street in Brooklyn, afgerond op hele meters? | Simone Roda from Italia | CC BY 2.0 | [bestand](https://commons.wikimedia.org/wiki/File:Brooklyn_Bridge_-_New_York_City.jpg) |
| Hoeveel provincies heeft Canada, zonder de territoria? | User:Rei-artur | CC BY-SA 3.0 | [bestand](https://commons.wikimedia.org/wiki/File:LocationCanada.svg) |
| Bij hoeveel graden Celsius smelt zuiver tin ongeveer, afgerond op een hele graad? | Alchemist-hp ( talk ) ( www.pse-mendelejew.de ) | CC BY-SA 3.0 de | [bestand](https://commons.wikimedia.org/wiki/File:Sn-Alpha-Beta.jpg) |
| Hoeveel ringen van Uranus waren eind 2025 bekend? | Ardenau4 | CC0 | [bestand](https://commons.wikimedia.org/wiki/File:Uranus_Voyager2_color_calibrated.png) |
| Hoeveel letters heeft het Hebreeuwse alfabet, zonder aparte eindvormen mee te tellen? | Eliran t | CC BY-SA 4.0 | [bestand](https://commons.wikimedia.org/wiki/File:%D7%94%D7%9E%D7%99%D7%9C%D7%94_%D7%A2%D7%91%D7%A8%D7%99%D7%AA_%D7%91%D7%9B%D7%AA%D7%91_%D7%95%D7%91%D7%9B%D7%AA%D7%91_%D7%94%D7%A2%D7%91%D7%A8%D7%99_%D7%94%D7%A7%D7%93%D7%95%D7%9D.jpg) |
| In hoeveel delen verscheen Don Quichot van Cervantes oorspronkelijk? | Héliodore Pisan / After Gustave Doré | Public domain | [bestand](https://commons.wikimedia.org/wiki/File:Gustave_Dor%C3%A9_-_Miguel_de_Cervantes_-_Don_Quixote_-_Part_1_-_Chapter_1_-_Plate_1_%22A_world_of_disorderly_notions,_picked_out_of_his_books,_crowded_into_his_imagination%22.jpg) |
| Hoeveel procent van Nederland ligt onder zeeniveau? | NuclearVacuum | CC BY-SA 3.0 | [bestand](https://commons.wikimedia.org/wiki/File:EU-Netherlands.svg) |
| Hoeveel dagen zaten er tussen D-Day en de bevrijding van Parijs? | Chief Photographer's Mate (CPHoM) Robert F. Sargent | Public domain | [bestand](https://commons.wikimedia.org/wiki/File:Into_the_Jaws_of_Death_23-0455M_edit.jpg) |
| Hoeveel landen grenzen aan de Dode Zee? | David Shankbone | CC BY-SA 3.0 | [bestand](https://commons.wikimedia.org/wiki/File:Dead_Sea_by_David_Shankbone.jpg) |
| Wat is de hoogte van het Vrijheidsbeeld in New York inclusief sokkel in meters? | Elcobbola | Public domain | [bestand](https://commons.wikimedia.org/wiki/File:Statue_of_Liberty_7.jpg) |
| Hoeveel kilogram weegt een volwassen mannetje van de Aziatische olifant gemiddeld? | Yathin S Krishnappa | CC BY-SA 3.0 | [bestand](https://commons.wikimedia.org/wiki/File:2005-bandipur-tusker.jpg) |
| Hoeveel graden Celsius is het aan het oppervlak van de zon ongeveer? | Matúš Motlo | CC BY-SA 4.0 | [bestand](https://commons.wikimedia.org/wiki/File:The_Sun_in_white_light.jpg) |
| Hoeveel minuten duurt een NBA-basketbalwedstrijd officieel? | Keith Allison | CC BY-SA 2.0 | [bestand](https://commons.wikimedia.org/wiki/File:Kobe_Bryant_2014.jpg) |
| Hoeveel minuten officiële speeltijd heeft een rugbyunionwedstrijd? | https://www.flickr.com/photos/awv/ Rob Gale | CC BY 2.0 | [bestand](https://commons.wikimedia.org/wiki/File:Dragons_vs_Leinster_welsh_try_Celtic_League_9_may_2008.jpg) |
| In welk jaar werd de eerste iPhone uitgebracht? | Original: Rob Janoff | Public domain | [bestand](https://commons.wikimedia.org/wiki/File:Apple_logo_black.svg) |
| Hoeveel soorten telt de kangoeroefamilie (Macropodidae)? | วิชิต กองคำ | CC BY-SA 4.0 | [bestand](https://commons.wikimedia.org/wiki/File:Red_Kangaroo_in_Thai_Zoo.jpg) |
| Hoeveel vogelsoorten telt Australië? | Carlos Delgado | CC BY-SA 3.0 | [bestand](https://commons.wikimedia.org/wiki/File:Dromaius_novaehollandiae_-_02.jpg) |
| In welk jaar werd Argentinië onafhankelijk van Spanje? | B1mbo | CC BY-SA 3.0 | [bestand](https://commons.wikimedia.org/wiki/File:LocationArgentina2.svg) |
| Wat is de gemiddelde diepte van alle wereldzeeën en oceanen in meters? | NASA/Apollo 17 crew; taken by either Harrison Schmitt or Ron Evans | Public domain | [bestand](https://commons.wikimedia.org/wiki/File:The_Blue_Marble_(remastered).jpg) |
| Wat is de diameter van de aarde ongeveer? | NASA/Apollo 17 crew; taken by either Harrison Schmitt or Ron Evans | Public domain | [bestand](https://commons.wikimedia.org/wiki/File:The_Blue_Marble_(remastered).jpg) |
| Hoeveel meter hoog is de Domtoren in Utrecht? | Massimo Catarinella | CC BY 3.0 | [bestand](https://commons.wikimedia.org/wiki/File:DomTorenUtrechtNederland.jpg) |
| Hoeveel liter melk geeft een gemiddelde Nederlandse koe per jaar? | Kim Hansen | CC BY-SA 3.0 | [bestand](https://commons.wikimedia.org/wiki/File:Cow_(Fleckvieh_breed)_Oeschinensee_Slaunger_2009-07-07.jpg) |
| Hoeveel punten levert een touchdown op in American football (met extra point)? | Johntex | CC BY 2.5 | [bestand](https://commons.wikimedia.org/wiki/File:Vince_Young_scores_a_touchdown_in_the_2005_Big_12_Championship_Game.JPG) |
| Uit hoeveel eilanden bestaat Indonesië, afgerond op duizendtallen? | Jayakatwang | Public domain | [bestand](https://commons.wikimedia.org/wiki/File:Flag_of_Indonesia.svg) |
| Hoeveel bekende manen heeft Saturnus (stand 2026)? | NASA/JPL/Space Science Institute | Public domain | [bestand](https://commons.wikimedia.org/wiki/File:Saturn_from_Cassini_Orbiter_(2004-10-06).jpg) |
| In welk jaar vond de Slag bij Waterloo plaats? | William Sadler | Public domain | [bestand](https://commons.wikimedia.org/wiki/File:Battle_of_Waterloo_1815.PNG) |
| Hoeveel magen heeft een koe? | Kim Hansen | CC BY-SA 3.0 | [bestand](https://commons.wikimedia.org/wiki/File:Cow_(Fleckvieh_breed)_Oeschinensee_Slaunger_2009-07-07.jpg) |
| Hoeveel bijen leven er in een sterk bijenvolk in de zomer? | U.S. Geological Survey from Reston, VA, USA | Public domain | [bestand](https://commons.wikimedia.org/wiki/File:Queen_Bee_(16545241268).jpg) |
| Hoeveel kilogram voedsel (bladeren, gras, takken) eet een volwassen Afrikaanse olifant per dag? | Giles Laurent | CC BY-SA 4.0 | [bestand](https://commons.wikimedia.org/wiki/File:178_Male_African_bush_elephant_in_Etosha_National_Park_Photo_by_Giles_Laurent.jpg) |
| Hoeveel kilometer moet een bijenvolk gezamenlijk vliegen om één kilo honing te produceren? | U.S. Geological Survey from Reston, VA, USA | Public domain | [bestand](https://commons.wikimedia.org/wiki/File:Queen_Bee_(16545241268).jpg) |
| Hoeveel EU-lidstaten gebruikten de euro in 2025? | User:Verdy p , User:-xfi- , User:Paddu , User:Nightstallion , User:Funakoshi , User:Jeltz , User:Dbenbenn , User:Zscout3 | Public domain | [bestand](https://commons.wikimedia.org/wiki/File:Flag_of_Europe.svg) |
| Wat is het grootste binnenlandse waterlichaam ter wereld naar oppervlakte? | Jeff Schmaltz, MODIS Rapid Response Team, NASA/GSFC | Public domain | [bestand](https://commons.wikimedia.org/wiki/File:Caspian_Sea_from_orbit.jpg) |
| Hoeveel spelers heeft een rugbyteam per ploeg op het veld (union)? | https://www.flickr.com/photos/awv/ Rob Gale | CC BY 2.0 | [bestand](https://commons.wikimedia.org/wiki/File:Dragons_vs_Leinster_welsh_try_Celtic_League_9_may_2008.jpg) |
| Hoeveel biljoen bacteriën leven er naar schatting in en op het menselijk lichaam? | Paperxcrip : Helena Paffen | CC BY-SA 3.0 | [bestand](https://commons.wikimedia.org/wiki/File:Light_skin_and_hair.jpg) |
| Hoeveel procent van de extra warmte door klimaatverandering wordt door de oceanen opgenomen? | NASA/Apollo 17 crew; taken by either Harrison Schmitt or Ron Evans | Public domain | [bestand](https://commons.wikimedia.org/wiki/File:The_Blue_Marble_(remastered).jpg) |
| Hoeveel liter water is volgens de gangbare berekening nodig om één kilogram rundvlees te produceren? | Kim Hansen | CC BY-SA 3.0 | [bestand](https://commons.wikimedia.org/wiki/File:Cow_(Fleckvieh_breed)_Oeschinensee_Slaunger_2009-07-07.jpg) |
| Hoeveel zetels telde het Australische Huis van Afgevaardigden na de verkiezingen van 2022? | Unknown (Vector graphics image by Ian Fieggen ) (only minor code changes by uploader.) | Public domain | [bestand](https://commons.wikimedia.org/wiki/File:Flag_of_Australia_(converted).svg) |
| Hoeveel miljoen kilometer is de gemiddelde afstand van de aarde tot de zon? | Matúš Motlo | CC BY-SA 4.0 | [bestand](https://commons.wikimedia.org/wiki/File:The_Sun_in_white_light.jpg) |
| Hoeveel procent bedraagt het standaard-btw-tarief in België? | Dbenbenn and others | Public domain | [bestand](https://commons.wikimedia.org/wiki/File:Flag_of_Belgium.svg) |
| Hoeveel soldaten namen aan beide kanten samen deel aan de Slag bij Waterloo? | William Sadler | Public domain | [bestand](https://commons.wikimedia.org/wiki/File:Battle_of_Waterloo_1815.PNG) |
| Hoeveel paar chromosomen heeft een kat? | Alvesgaspar (compilation) | CC BY-SA 3.0 | [bestand](https://commons.wikimedia.org/wiki/File:Cat_poster_2.jpg) |
| Hoeveel chromosomen telt een gezonde menselijke cel? | Paperxcrip : Helena Paffen | CC BY-SA 3.0 | [bestand](https://commons.wikimedia.org/wiki/File:Light_skin_and_hair.jpg) |
| Hoeveel boeken bevat de Hebreeuwse Bijbel volgens de joodse indeling? | No machine-readable author provided. Merlin assumed (based on copyright claims). | CC BY 2.5 | [bestand](https://commons.wikimedia.org/wiki/File:Torah_and_jad.jpg) |
| Hoeveel seizoenen telde de serie The Office US? | tomdobb | CC BY 3.0 | [bestand](https://commons.wikimedia.org/wiki/File:Dunder_mifflin_banner_scranton.jpg) |
| Hoeveel letters heeft het Griekse alfabet? | Napoleon Vier at Dutch Wikipedia | CC BY-SA 3.0 | [bestand](https://commons.wikimedia.org/wiki/File:InscriptieTherm.jpg) |
| Hoeveel kamers heeft het menselijk hart? | OpenStax Anatomy and Physiology | CC BY 4.0 | [bestand](https://commons.wikimedia.org/wiki/File:2000_Human_Heart_Photo.jpg) |
| Hoeveel afleveringen heeft de miniserie Chernobyl? | Carl Montgomery | CC BY 2.0 | [bestand](https://commons.wikimedia.org/wiki/File:Chernobylreactor_1.jpg) |
| Hoeveel EU-lidstaten gebruiken de euro (2026)? | Lukasz Kobus - European Commission | CC BY 4.0 | [bestand](https://commons.wikimedia.org/wiki/File:Euro_coins_(07).jpg) |
| Hoeveel hertz is de toonhoogte van de standaard a in de muziek? | Gryffindor | CC BY-SA 3.0 | [bestand](https://commons.wikimedia.org/wiki/File:Steinway_Vienna_002.JPG) |
| Hoeveel boeken telt de oorspronkelijke The Hunger Games-reeks? | Scholastic Inc | Public domain | [bestand](https://commons.wikimedia.org/wiki/File:The_Hunger_Games_(Scholastic_Inc._YA_novel_series)_logo.webp) |
| Hoeveel Space Shuttle-orbiters bouwde NASA voor ruimtevluchten, zonder Enterprise? | NASA | Public domain | [bestand](https://commons.wikimedia.org/wiki/File:Space_Shuttle_Columbia_launching.jpg) |
| Hoeveel gouden medailles won Australië op de Olympische Zomerspelen van Parijs in 2024? | Unknown (Vector graphics image by Ian Fieggen ) (only minor code changes by uploader.) | Public domain | [bestand](https://commons.wikimedia.org/wiki/File:Flag_of_Australia_(converted).svg) |
| Hoeveel zetels telt het Nieuw-Zeelandse parlement normaal, zonder overhangzetels? | Original: Albert Hastings Markham Vector: Zscout370 , Hugh Jass , s. File history | Public domain | [bestand](https://commons.wikimedia.org/wiki/File:Flag_of_New_Zealand.svg) |
| Hoeveel procent van de oorspronkelijke bossen in de wereld is nog over? | Sze Ning from Malaysia | CC BY 2.0 | [bestand](https://commons.wikimedia.org/wiki/File:View_from_Bukit_Terisek.jpg) |
| Welk percentage van het wereldwijde cement wordt geproduceerd in China? | Marion Golsteijn | CC BY-SA 4.0 | [bestand](https://commons.wikimedia.org/wiki/File:Betonmortel_bedrijven_Cementbouw.JPG) |
| Hoeveel landen ondertekenden de UNESCO-grondwet in 1945? | Mouagip | Public domain | [bestand](https://commons.wikimedia.org/wiki/File:Flag_of_UNESCO.svg) |
| Hoeveel fysieke spoorlijnen telt de New York City Subway volgens de gangbare indeling? | Mtattrain | CC BY-SA 4.0 | [bestand](https://commons.wikimedia.org/wiki/File:MTA_NYC_Subway_1_train_leaving_125th_St.jpg) |
| In welk jaar werd het eerste succesvolle vaccin ontwikkeld? | Photo Credit: James Gathany Content Providers(s): CDC | Public domain | [bestand](https://commons.wikimedia.org/wiki/File:Smallpox_vaccine.jpg) |
| Hoeveel kilometer lang is de Nederlandse kustlijn ongeveer? | inyucho | CC BY 2.0 | [bestand](https://commons.wikimedia.org/wiki/File:Sand_suppletion_on_the_Dutch_coast.jpg) |
| Hoeveel jaar kan een reuzenschildpad ongeveer oud worden? | Diego Delso | CC BY-SA 4.0 | [bestand](https://commons.wikimedia.org/wiki/File:Tortuga_gigante_de_San_Crist%C3%B3bal_(Chelonoidis_chathamensis),_isla_Santa_Cruz,_islas_Gal%C3%A1pagos,_Ecuador,_2015-07-26,_DD_16.JPG) |
| Hoeveel elektronen heeft een chloride-ion, Cl⁻? | W. Oelen | CC BY-SA 3.0 | [bestand](https://commons.wikimedia.org/wiki/File:Chlorine_in_bottle.jpg) |

## Beoordeeld en nu bewust zonder foto

| Vraag | Reden |
|---|---|
| Hoeveel onafhankelijke landen hebben een landgrens met Brazilië? | Bestaand Commons-voorstel is publiek domein, maar maker staat als onbekend vermeld; geen nieuwe broncontrole mogelijk na HTTP 429. |
| Hoeveel ogen heeft een volwassen honingbij? | Beschikbaar beeld toont telbare onderdelen/complete reeks of een antwoorddiagram; geen veilige passende vervanging beoordeeld. |
| Hoeveel bogen heeft de Romeinse brug Pont du Gard in de onderste booglaag? | Beschikbaar beeld toont telbare onderdelen/complete reeks of een antwoorddiagram; geen veilige passende vervanging beoordeeld. |
| Hoeveel dierentekens telt de traditionele Chinese dierenriem? | Beschikbaar beeld toont telbare onderdelen/complete reeks of een antwoorddiagram; geen veilige passende vervanging beoordeeld. |
| Hoeveel wielen heeft het landingsgestel van een Airbus A380? | Beschikbaar beeld toont telbare onderdelen/complete reeks of een antwoorddiagram; geen veilige passende vervanging beoordeeld. |
| Hoeveel basisletters gebruikt het moderne Koreaanse Hangul-schrift? | Beschikbaar beeld toont telbare onderdelen/complete reeks of een antwoorddiagram; geen veilige passende vervanging beoordeeld. |
| Hoeveel torens staan er aan de westgevel van de Notre-Dame van Parijs? | Beschikbaar beeld toont telbare onderdelen/complete reeks of een antwoorddiagram; geen veilige passende vervanging beoordeeld. |
| Hoeveel elementen waren eind 2025 officieel erkend in het periodiek systeem? | Beschikbaar beeld toont telbare onderdelen/complete reeks of een antwoorddiagram; geen veilige passende vervanging beoordeeld. |
| Hoeveel zuilen telt de Grote Zuilenzaal van Karnak? | Beschikbaar beeld toont telbare onderdelen/complete reeks of een antwoorddiagram; geen veilige passende vervanging beoordeeld. |
| Hoeveel lijnen heeft een notenbalk? | Beschikbaar beeld toont telbare onderdelen/complete reeks of een antwoorddiagram; geen veilige passende vervanging beoordeeld. |
| Hoeveel botten heeft een normaal volwassen skelet volgens de standaard anatomische telling? | Beschikbaar beeld toont telbare onderdelen/complete reeks of een antwoorddiagram; geen veilige passende vervanging beoordeeld. |
| Met hoeveel schijven begint elke speler bij internationaal dammen? | Beschikbaar beeld toont telbare onderdelen/complete reeks of een antwoorddiagram; geen veilige passende vervanging beoordeeld. |
| Hoeveel torens tellen de muren van het Kremlin in Moskou? | Beschikbaar beeld toont telbare onderdelen/complete reeks of een antwoorddiagram; geen veilige passende vervanging beoordeeld. |
| Hoeveel snaren heeft een klassieke Japanse koto? | Beschikbaar beeld toont telbare onderdelen/complete reeks of een antwoorddiagram; geen veilige passende vervanging beoordeeld. |
| Hoeveel belangrijkste avatars van Vishnu staan traditioneel in de Dashavatara? | Beschikbaar beeld toont telbare onderdelen/complete reeks of een antwoorddiagram; geen veilige passende vervanging beoordeeld. |
| Hoeveel paar hersenzenuwen heeft een mens? | Beschikbaar beeld toont telbare onderdelen/complete reeks of een antwoorddiagram; geen veilige passende vervanging beoordeeld. |
| Hoeveel bits bevat een byte volgens de moderne standaarddefinitie? | Beschikbaar beeld toont telbare onderdelen/complete reeks of een antwoorddiagram; geen veilige passende vervanging beoordeeld. |
| Hoeveel werelden verbindt Yggdrasil in de traditionele voorstelling van de Noorse mythologie? | Beschikbaar beeld toont telbare onderdelen/complete reeks of een antwoorddiagram; geen veilige passende vervanging beoordeeld. |
| Hoeveel genummerde vakjes heeft een Europees roulettewiel met één nul, inclusief nul? | Beschikbaar beeld toont telbare onderdelen/complete reeks of een antwoorddiagram; geen veilige passende vervanging beoordeeld. |
| Hoeveel halve tonen bevat een octaaf in de gelijkzwevende stemming? | Beschikbaar beeld toont telbare onderdelen/complete reeks of een antwoorddiagram; geen veilige passende vervanging beoordeeld. |
| Hoeveel snaren heeft de klassieke Afrikaanse kora traditioneel? | Beschikbaar beeld toont telbare onderdelen/complete reeks of een antwoorddiagram; geen veilige passende vervanging beoordeeld. |
| Hoeveel hoofdgroepen onderscheidt NASA in de ringen van Saturnus? | Beschikbaar beeld toont telbare onderdelen/complete reeks of een antwoorddiagram; geen veilige passende vervanging beoordeeld. |
| Hoeveel kaarten bevat een standaard kaartspel met Franse kleuren, zonder jokers? | Beschikbaar beeld toont telbare onderdelen/complete reeks of een antwoorddiagram; geen veilige passende vervanging beoordeeld. |
| Hoeveel koppen had Cerberus, de mythologische hond die de onderwereld bewaakt? | Beschikbaar beeld toont telbare onderdelen/complete reeks of een antwoorddiagram; geen veilige passende vervanging beoordeeld. |
| In welk jaar werd Brazilië officieel onafhankelijk van Portugal? | Bestaand Commons-voorstel is publiek domein, maar maker staat als onbekend vermeld; geen nieuwe broncontrole mogelijk na HTTP 429. |
| Hoeveel landen grenzen aan Brazilië? | Bestaand Commons-voorstel is publiek domein, maar maker staat als onbekend vermeld; geen nieuwe broncontrole mogelijk na HTTP 429. |
| Hoeveel armen heeft de gewone vijfarmige zeester? | Gehele object, kaart, reeks of schema maakt het antwoord zichtbaar/telbaar; geen veilig detailbeeld beschikbaar. |
| Hoeveel bulten heeft een dromedaris? | Gehele object, kaart, reeks of schema maakt het antwoord zichtbaar/telbaar; geen veilig detailbeeld beschikbaar. |
| Hoeveel kleuren heeft een standaard Rubiks kubus? | Gehele object, kaart, reeks of schema maakt het antwoord zichtbaar/telbaar; geen veilig detailbeeld beschikbaar. |
| Hoeveel poten heeft een kreeftachtige van de orde Isopoda? | Gehele object, kaart, reeks of schema maakt het antwoord zichtbaar/telbaar; geen veilig detailbeeld beschikbaar. |
| Hoeveel kleuren heeft de vlag van België? | Gehele object, kaart, reeks of schema maakt het antwoord zichtbaar/telbaar; geen veilig detailbeeld beschikbaar. |
| Hoeveel pionnen heeft iedere speler bij de start van schaken? | Gehele object, kaart, reeks of schema maakt het antwoord zichtbaar/telbaar; geen veilig detailbeeld beschikbaar. |
| Hoeveel snaren heeft een standaard basgitaar? | Gehele object, kaart, reeks of schema maakt het antwoord zichtbaar/telbaar; geen veilig detailbeeld beschikbaar. |
| Hoeveel snaren heeft een standaard viool? | Gehele object, kaart, reeks of schema maakt het antwoord zichtbaar/telbaar; geen veilig detailbeeld beschikbaar. |
| Uit hoeveel verschillende basen bestaat DNA? | Gehele object, kaart, reeks of schema maakt het antwoord zichtbaar/telbaar; geen veilig detailbeeld beschikbaar. |
| Hoeveel hoofdgoden telt de Griekse mythologie op de berg Olympus (de Twaalf Olympiërs)? | Gehele object, kaart, reeks of schema maakt het antwoord zichtbaar/telbaar; geen veilig detailbeeld beschikbaar. |
| Hoeveel gekleurde vierkantjes telt een standaard Rubik's kubus aan de buitenkant? | Gehele object, kaart, reeks of schema maakt het antwoord zichtbaar/telbaar; geen veilig detailbeeld beschikbaar. |
| Hoeveel planeten in ons zonnestelsel hebben ringen? | Gehele object, kaart, reeks of schema maakt het antwoord zichtbaar/telbaar; geen veilig detailbeeld beschikbaar. |
| Hoeveel pixels breed is een standaard 4K Ultra HD videoscherm? | Gehele object, kaart, reeks of schema maakt het antwoord zichtbaar/telbaar; geen veilig detailbeeld beschikbaar. |
| Hoeveel genummerde publieksingangen had het Colosseum? | Gehele object, kaart, reeks of schema maakt het antwoord zichtbaar/telbaar; geen veilig detailbeeld beschikbaar. |
| Hoeveel meter is één internationale zeemijl exact? | Gehele object, kaart, reeks of schema maakt het antwoord zichtbaar/telbaar; geen veilig detailbeeld beschikbaar. |
| Hoeveel genummerde scorevakken heeft een dartbord? | Gehele object, kaart, reeks of schema maakt het antwoord zichtbaar/telbaar; geen veilig detailbeeld beschikbaar. |
| Hoeveel zuilen had het oorspronkelijke Parthenon volgens de klassieke indeling? | Gehele object, kaart, reeks of schema maakt het antwoord zichtbaar/telbaar; geen veilig detailbeeld beschikbaar. |
| Hoeveel minaretten heeft de Blauwe Moskee in Istanbul? | Gehele object, kaart, reeks of schema maakt het antwoord zichtbaar/telbaar; geen veilig detailbeeld beschikbaar. |
| Hoeveel planeten staan dichter bij de zon dan de aarde? | Gehele object, kaart, reeks of schema maakt het antwoord zichtbaar/telbaar; geen veilig detailbeeld beschikbaar. |
| Hoeveel straten, stations en nutsbedrijven kun je kopen op een klassiek Monopoly-bord? | Gehele object, kaart, reeks of schema maakt het antwoord zichtbaar/telbaar; geen veilig detailbeeld beschikbaar. |
| Hoeveel botten heeft een volwassen menselijke schedel volgens de gebruikelijke anatomische indeling? | Gehele object, kaart, reeks of schema maakt het antwoord zichtbaar/telbaar; geen veilig detailbeeld beschikbaar. |
| Hoeveel kleuren heeft de vlag van Zuid-Afrika? | Gehele object, kaart, reeks of schema maakt het antwoord zichtbaar/telbaar; geen veilig detailbeeld beschikbaar. |
| Hoeveel botten bevat één menselijke hand inclusief de pols? | Gehele object, kaart, reeks of schema maakt het antwoord zichtbaar/telbaar; geen veilig detailbeeld beschikbaar. |
| Hoeveel themaparken had Walt Disney World in Florida in 2025, zonder waterparken? | Geen passend, herkenbaar en vrij beeld visueel kunnen bevestigen in de beschikbare lokale kandidaten; nieuw Commons-onderzoek gestopt na HTTP 429. |
| Hoeveel Europacup I- en Champions League-titels had AC Milan eind 2024 gewonnen? | Geen passend, herkenbaar en vrij beeld visueel kunnen bevestigen in de beschikbare lokale kandidaten; nieuw Commons-onderzoek gestopt na HTTP 429. |
| Hoeveel Matrix-films verschenen er vóór The Matrix Resurrections (2021)? | Geen passend, herkenbaar en vrij beeld visueel kunnen bevestigen in de beschikbare lokale kandidaten; nieuw Commons-onderzoek gestopt na HTTP 429. |
| Hoeveel onafhankelijke landen vormen Centraal-Amerika? | Kaart maakt de landen telbaar. |
| Hoeveel keer had Ierland eind 2024 het Eurovisie Songfestival gewonnen? | Geen passend, herkenbaar en vrij beeld visueel kunnen bevestigen in de beschikbare lokale kandidaten; nieuw Commons-onderzoek gestopt na HTTP 429. |
| Hoeveel verplichte dagelijkse gebeden schrijft de islam voor? | Gebedentijdenbord/gebedshoudingen kan de vijf dagelijkse gebeden verklappen. |
| Hoeveel Europacup I- en Champions League-titels had Real Madrid eind 2024 gewonnen? | Geen passend, herkenbaar en vrij beeld visueel kunnen bevestigen in de beschikbare lokale kandidaten; nieuw Commons-onderzoek gestopt na HTTP 429. |
| Hoeveel afzonderlijke landen zijn lid van de G20, zonder de Europese Unie en de Afrikaanse Unie? | Groepsfoto kan het gevraagde aantal landen telbaar maken. |
| Hoeveel Jurassic Park-films verschenen er vóór Jurassic World (2015)? | Geen passend, herkenbaar en vrij beeld visueel kunnen bevestigen in de beschikbare lokale kandidaten; nieuw Commons-onderzoek gestopt na HTTP 429. |
| Hoeveel kamers heeft het hart van een krokodil? | Geen passend, herkenbaar en vrij beeld visueel kunnen bevestigen in de beschikbare lokale kandidaten; nieuw Commons-onderzoek gestopt na HTTP 429. |
| Hoeveel basiskarakters heeft het moderne Japanse hiragana? | Geen passend, herkenbaar en vrij beeld visueel kunnen bevestigen in de beschikbare lokale kandidaten; nieuw Commons-onderzoek gestopt na HTTP 429. |
| Hoeveel verdiepingen boven de grond heeft de Shanghai Tower? | Gevelverdiepingen kunnen worden geteld. |
| Wat is een perfecte score bij tienpinsbowling? | Geen passend, herkenbaar en vrij beeld visueel kunnen bevestigen in de beschikbare lokale kandidaten; nieuw Commons-onderzoek gestopt na HTTP 429. |
| Hoeveel meter lang is de kortste individuele olympische langebaanschaatsafstand? | Geen passend, herkenbaar en vrij beeld visueel kunnen bevestigen in de beschikbare lokale kandidaten; nieuw Commons-onderzoek gestopt na HTTP 429. |
| Hoeveel spelers per team liggen er bij standaardwaterpolo op volle sterkte in het water, inclusief de keeper? | Geen gecontroleerde uitsnede zonder compleet team. |
| Hoeveel landen ondertekenden in 1957 het Verdrag van Rome tot oprichting van de EEG? | Ondertekenaarsfoto kan de zes landen telbaar maken; gevonden fontein is geen verdrag. |
| Hoeveel spelers staat er per ploeg op het veld bij een rugby league-wedstrijd? | Geen passend, herkenbaar en vrij beeld visueel kunnen bevestigen in de beschikbare lokale kandidaten; nieuw Commons-onderzoek gestopt na HTTP 429. |
| Hoeveel landen hebben een landgrens met Tanzania? | Geen passend, herkenbaar en vrij beeld visueel kunnen bevestigen in de beschikbare lokale kandidaten; nieuw Commons-onderzoek gestopt na HTTP 429. |
| Hoeveel naamvallen heeft het moderne Duits? | Geen passend, herkenbaar en vrij beeld visueel kunnen bevestigen in de beschikbare lokale kandidaten; nieuw Commons-onderzoek gestopt na HTTP 429. |
| Hoeveel innings zijn gepland in een standaardwedstrijd Major League Baseball, zonder extra innings? | Veldpositieschema toont negen posities, hetzelfde getal als het antwoord. |
| Hoeveel Oscar nominaties kreeg La La Land? | Geen passend, herkenbaar en vrij beeld visueel kunnen bevestigen in de beschikbare lokale kandidaten; nieuw Commons-onderzoek gestopt na HTTP 429. |
| Hoeveel letters telt het moderne Hawaïaanse alfabet, inclusief de ʻokina? | Geen passend, herkenbaar en vrij beeld visueel kunnen bevestigen in de beschikbare lokale kandidaten; nieuw Commons-onderzoek gestopt na HTTP 429. |
| Hoeveel landen hebben een landgrens met Argentinië? | Landsgrenzen op de kaart maken de buurlanden telbaar. |
| Hoeveel WK's rugby voor mannen had Nieuw-Zeeland eind 2023 gewonnen? | Geen passend, herkenbaar en vrij beeld visueel kunnen bevestigen in de beschikbare lokale kandidaten; nieuw Commons-onderzoek gestopt na HTTP 429. |
| Hoeveel stippen, inclusief power pellets, telt het eerste doolhof van het oorspronkelijke Pac-Man-arcadespel? | Doolhof kan de stippen zichtbaar maken; makersportret is onvoldoende herkenbaar. |
| Hoeveel jaar duurde de Amerikaanse Onafhankelijkheidsoorlog ongeveer? | Geen passend, herkenbaar en vrij beeld visueel kunnen bevestigen in de beschikbare lokale kandidaten; nieuw Commons-onderzoek gestopt na HTTP 429. |
| Hoeveel verdiepingen boven de grond heeft elke Petronas Twin Tower? | Gevelverdiepingen kunnen worden geteld. |
| Hoeveel films telt de oorspronkelijke Godfather-reeks van Francis Ford Coppola? | Geen passend, herkenbaar en vrij beeld visueel kunnen bevestigen in de beschikbare lokale kandidaten; nieuw Commons-onderzoek gestopt na HTTP 429. |
| Hoeveel Super Bowls won Tom Brady als speler? | Geen passend, herkenbaar en vrij beeld visueel kunnen bevestigen in de beschikbare lokale kandidaten; nieuw Commons-onderzoek gestopt na HTTP 429. |
| Hoeveel standaardtijdzones beslaan de aaneengesloten Verenigde Staten? | Tijdzonekaart kan het aantal gebieden verklappen. |
| Hoeveel genummerde symfonieën voltooide Johannes Brahms? | Geen passend, herkenbaar en vrij beeld visueel kunnen bevestigen in de beschikbare lokale kandidaten; nieuw Commons-onderzoek gestopt na HTTP 429. |
| Hoeveel landen hebben een kust aan de Zwarte Zee? | Landsgrenzen rond de zee maken de kustlanden telbaar. |
| Hoeveel teams speelden er in het NFL-seizoen 2024? | Geen passend, herkenbaar en vrij beeld visueel kunnen bevestigen in de beschikbare lokale kandidaten; nieuw Commons-onderzoek gestopt na HTTP 429. |
| Hoeveel minuten duurt de bioscoopversie van Avatar: The Way of Water (2022)? | Geen passend, herkenbaar en vrij beeld visueel kunnen bevestigen in de beschikbare lokale kandidaten; nieuw Commons-onderzoek gestopt na HTTP 429. |
| Hoeveel spelers telt een cricketteam op het veld? | Volledige teamfoto verklapt het aantal spelers; overige foto is een onherkenbaar veld. |
| Hoeveel wielen heeft een tuk-tuk meestal? | Zichtbare wielen van de tuk-tuk zijn telbaar. |
| Hoeveel minuten reguliere speeltijd heeft een standaard seniorenwedstrijd ijshockey, zonder verlenging? | Geen passend, herkenbaar en vrij beeld visueel kunnen bevestigen in de beschikbare lokale kandidaten; nieuw Commons-onderzoek gestopt na HTTP 429. |
| Hoeveel atomen bevat één molecuul water? | Molecuuldiagram verklapt het aantal atomen. |

## Ook afgekeurde oudere openbare formuleringen

| Vraag | Reden |
|---|---|
| Hoeveel torens heeft het Kremlin in Moskou? | Zichtbare telling, antwoordinformatie of geen passende kandidaat; dezelfde afweging als bij de nieuwe formulering. |
| Hoeveel zuilen heeft de Grote Zuilenzaal van de Tempel van Karnak ongeveer? | Zichtbare telling, antwoordinformatie of geen passende kandidaat; dezelfde afweging als bij de nieuwe formulering. |
| Hoeveel verdiepingen hebben de Petronas Twin Towers? | Zichtbare telling, antwoordinformatie of geen passende kandidaat; dezelfde afweging als bij de nieuwe formulering. |
| Hoeveel stippen (inclusief de 4 grote power pellets) moet Pac-Man opeten om een level uit te spelen? | Zichtbare telling, antwoordinformatie of geen passende kandidaat; dezelfde afweging als bij de nieuwe formulering. |
| Hoeveel verdiepingen heeft de Shanghai Tower? | Zichtbare telling, antwoordinformatie of geen passende kandidaat; dezelfde afweging als bij de nieuwe formulering. |
| Hoeveel gebeden per dag schrijft de islamitische traditie voor? | Zichtbare telling, antwoordinformatie of geen passende kandidaat; dezelfde afweging als bij de nieuwe formulering. |
| Hoeveel themaparken telt Walt Disney World in Florida? | Zichtbare telling, antwoordinformatie of geen passende kandidaat; dezelfde afweging als bij de nieuwe formulering. |
| Hoeveel landen zijn lid van de G20 (de EU en de Afrikaanse Unie niet meegeteld)? | Zichtbare telling, antwoordinformatie of geen passende kandidaat; dezelfde afweging als bij de nieuwe formulering. |
| Hoeveel wielen heeft een Airbus A380? | Zichtbare telling, antwoordinformatie of geen passende kandidaat; dezelfde afweging als bij de nieuwe formulering. |

## Nog open voor vervolgonderzoek

248 vragen hebben nog geen expliciete beoordeling in de uitzonderingenbron. Begin bij onderstaande lijst. De voorlopige null-keuzes hierboven kunnen ook opnieuw worden onderzocht zodra Commons weer bereikbaar is.

- Hoeveel bloedgroepen kent het ABO-systeem?
- Hoeveel basissmaken worden in de moderne smaakleer onderscheiden?
- Hoeveel landen deden mee aan het WK voetbal van 2026?
- Hoeveel meter lang is een olympisch zwembad?
- Hoeveel passagiers voeren met de Mayflower naar Amerika?
- Hoeveel punten scoorde een team in de hoogste basketbalscore ooit?
- Hoeveel afleveringen telt de serie Game of Thrones?
- In welk jaar viel het West-Romeinse Rijk traditioneel?
- In welk jaar werd de eerste commerciële harde schijf geïntroduceerd?
- In welk jaar werd de eerste ruimtestationmodule gelanceerd?
- Uit hoeveel eilanden bestaan de Malediven?
- Hoeveel leden telt het Britse House of Commons?
- Hoeveel huizen werden verwoest bij de Grote Brand van Londen?
- Wat is de hoogste windsnelheid in kilometer per uur die nog bij windkracht 8 hoort?
- In welk jaar werd de eerste commerciële cd uitgebracht?
- Hoe lang was de langste vrouw ooit in centimeters?
- Hoeveel kilometer zijn alle bloedvaten van een volwassene samen lang, volgens de bekende schatting van 60.000 mijl?
- Hoeveel haren heeft een mens gemiddeld op zijn hoofd (afgerond)?
- Hoeveel graden Celsius kan een bliksemschicht bereiken?
- Hoeveel planeten werden bezocht door het Voyager-programma?
- Hoeveel wielen heeft een Boeing 747 volgens de standaardconfiguratie?
- Hoeveel metrolijnen had de Parijse metro in 2025?
- Hoeveel boeken bevat The Chronicles of Narnia?
- Hoe oud werd de oudste hond volgens Guinness World Records in jaren?
- Hoeveel leden vormden de klassieke bezetting van The Beatles?
- Uit hoeveel meren bestaan de Grote Meren van Noord-Amerika?
- Hoeveel minuten duurt een volledige dag-en-nachtcyclus in Minecraft?
- Hoeveel seconden duurde de eerste geslaagde gemotoriseerde vlucht?
- Hoeveel decibel veroorzaakt een gemiddeld gesprek op normale toon?
- Hoeveel kilometer per uur haalt een cheetah op zijn snelst?
- Hoeveel passagiers kan een Boeing 777-300ER maximaal vervoeren?
- Hoeveel spelers staan er per team op het veld bij honkbal?
- Hoeveel poten heeft een standaard statief?
- Hoeveel afleveringen telt de originele Britse serie The Office (inclusief specials)?
- Hoeveel torens heeft de Notre-Dame van Parijs aan de voorzijde?
- Hoeveel kilometer lang is het Victoriameer ongeveer?
- Hoe hoog was de hoogste duik vanaf een klif in meters?
- Hoeveel zetels telt het Zuid-Afrikaanse parlement (National Assembly)?
- Wat is de totale lengte van alle onderzeese internetkabels op aarde in duizend kilometer?
- Hoe groot was de grootste pizza ooit in vierkante meter?
- In welk jaar vertrok de eerste commerciële passagiersvlucht?
- Hoeveel miljard euro bedraagt het Nederlandse defensiebudget?
- Hoeveel chemische elementen telt het huidige periodiek systeem?
- Hoeveel stappen telt de Mayapyramide El Castillo per zijde?
- Hoeveel is de som van de getallen 1 tot en met 100?
- Hoeveel holes heeft een standaard golfbaan?
- Hoeveel Afrikaanse landen produceren koffie?
- Hoeveel miljard neuronen (zenuwcellen) bevat het menselijk brein naar schatting?
- Hoeveel kiesmannen zijn er nodig om de Amerikaanse presidentsverkiezing te winnen?
- Hoeveel kilogram weegt de Moai-beelden op Paaseiland gemiddeld?
- Hoeveel satellieten lanceerde India in één enkele raket als record (2017)?
- Hoeveel procent van de wetlands is sinds 1700 wereldwijd verdwenen?
- Hoeveel uren aan videomateriaal wordt er wereldwijd elke minuut geüpload naar YouTube?
- Hoeveel kilometer van de Maas ligt in Nederland?
- Hoeveel mensen deden mee aan het grootste waterballonnengevecht ooit?
- Hoeveel innings telt een standaard honkbalwedstrijd?
- In welk jaar werd de eerste drukpers met losse letters in Europa gebruikt?
- Hoe lang is de langste levende man in centimeters?
- Hoe lang is de langste levende vrouw in centimeters?
- Hoeveel procent van het voedsel dat wereldwijd wordt geproduceerd gaat verloren of wordt verspild?
- Wat is het atoomnummer van zuurstof?
- Hoeveel procent van de landbouwgrond wordt gebruikt voor voedsel dat uiteindelijk niet wordt opgegeten?
- Hoeveel eilanden telt Fiji?
- Hoeveel graden heeft een rechte hoek?
- Hoeveel delen telt de originele The Godfather-filmreeks?
- Hoeveel volt heeft een standaard stopcontact in Nederland?
- Hoeveel delen CO₂ per miljoen delen lucht mat NASA in 2024?
- Hoe zwaar was de grootste chocoladereep ooit in kilogram?
- Hoeveel kg afval produceert een Nederlander gemiddeld per jaar?
- Hoeveel duikboten telt de Nederlandse marine standaard per vloot?
- Hoeveel kilometer lang is de Murray?
- Hoeveel belangrijkste producten ontstaan bij de reactie tussen azijn en baking soda?
- In welk jaar werd de eerste commerciële mobiele telefoon uitgebracht?
- Hoeveel miljard kilometer legt licht af in één lichtjaar, afgerond?
- Hoeveel UNESCO-werelderfgoedlocaties had Duitsland in 2025?
- Hoeveel procent van de Nederlanders fietst dagelijks?
- Hoeveel minuten duurt de film Avatar: The Way of Water?
- Hoeveel hotels had Hilton eind 2023 wereldwijd ongeveer?
- Hoeveel Grammy-nominaties had Beyoncé in totaal bij de uitreiking van februari 2025?
- Hoeveel minuten duurde de recordplank van Josef Šálek in mei 2023, afgerond?
- Hoeveel deelverzamelingen heeft een verzameling met acht elementen?
- Hoeveel uur duurde het langste videogame-marathonrecord (stand 2026)?
- Hoeveel staten liggen er op het Noord-Amerikaanse vasteland van de VS (exclusief Alaska en Hawaii)?
- Welk percentage van het wereldwijd geproduceerde staal wordt gebruikt in de bouw?
- Hoeveel letters heeft het Armeense alfabet?
- In welk jaar werd India onafhankelijk van Groot-Brittannië?
- Hoeveel velden telt een Engels dambord van 8 bij 8?
- Hoeveel minuten duurt een ijshockeywedstrijd netto?
- Hoeveel minuten duurt een rugbywedstrijd netto?
- Hoeveel afleveringen telt de serie Friends in totaal?
- Wat is de autorij-afstand van Amsterdam naar Rome in km?
- Hoeveel miljoen ton plastic afval lekt jaarlijks in rivieren, meren en zeeën, volgens de ondergrens van de VN-schatting?
- In welk jaar riep Colombia zijn onafhankelijkheid van Spanje uit?
- Wat is de snelheid van het geluid in droge lucht bij 20°C in km/u?
- Hoe hoog was het hoogste paard ooit in centimeters?
- In welk jaar werd de eerste moderne volkstelling gehouden?
- Hoeveel kilometer lang is het metronet van Rotterdam?
- Hoeveel minuten officiële speeltijd heeft een Americanfootballwedstrijd in de NFL?
- Hoeveel verkeerslichten zijn er ongeveer in New York City?
- Hoeveel ton bommen werd tijdens de Blitz op Londen afgeworpen?
- In welk jaar werd Venezuela onafhankelijk van Spanje?
- In welk jaar werd Paraguay onafhankelijk van Spanje?
- Hoeveel milliliter gaat er in een standaard Nederlands borrelglas jenever?
- Hoeveel schepen werden ingezet bij de evacuatie van Duinkerke?
- Hoeveel nationale parken telt de Verenigde Staten?
- Hoe klein was het kleinste paard ooit in centimeters?
- Hoeveel letters heeft het Russische alfabet?
- Hoeveel meter hoog is One World Trade Center?
- Hoeveel miljoen motorvoertuigen werden er in 2022 wereldwijd geproduceerd?
- In welk jaar werd de Al-Qarawiyyin in Fez gesticht, de oudste nog bestaande universiteit?
- Hoeveel wielen heeft een standaard stadsbus meestal?
- Hoeveel terrassen heeft de Euromast in Rotterdam totaal?
- In welk jaar werd Bolivia onafhankelijk van Spanje?
- Hoeveel duizend kilometer fietspad telt Nederland?
- Hoeveel kilometer fietst een Nederlander gemiddeld per jaar?
- Hoeveel staten telt de Verenigde Staten?
- Hoe zwaar was de grootste kaas ooit gemaakt in kilogram?
- Hoeveel uren zitten er in een standaard kalenderjaar?
- Hoeveel verschillende euromunten zijn er?
- Hoeveel schaatsbanen van 400 meter telt Nederland?
- In welk jaar werd penicilline ontdekt?
- Hoeveel genummerde vakjes heeft een Europees roulettewiel, inclusief 0?
- Hoeveel verdiepingen heeft De Rotterdam van architect Rem Koolhaas?
- Hoeveel letters heeft het Thaise alfabet?
- Hoeveel sterren staan er op de vlag van de Verenigde Staten?
- Hoeveel soldaten telde het Brits-geallieerde leger van Wellington bij Waterloo ongeveer?
- Hoeveel korfbal-spelers staan er per team op het veld bij de Nederlandse Korfbal League?
- Hoeveel dieren bevat de klassieke Big Five van Afrika?
- Hoeveel push-ups deed Charles Servizio in 24 uur in april 1993, afgerond op duizendtallen?
- Hoeveel graden is elke binnenhoek van een regelmatige zeshoek?
- In welk jaar werd de eerste radio-uitzending gemaakt?
- Hoeveel meter hoog is het hoogste punt van het Millauviaduct?
- Hoeveel kilometer lang is de kustlijn van Noorwegen ongeveer, inclusief eilanden?
- Hoeveel meter hoog is De Zalmhaven in Rotterdam?
- In welk jaar reed de eerste elektrische auto?
- Hoeveel vierkante kilometer is het Victoriameer ongeveer?
- In welk jaar werd de eerste digitale camera ontwikkeld?
- Hoe lang was de langste kat ooit in centimeters?
- In welk jaar werd de eerste laptop uitgebracht?
- Hoeveel medeklinkerletters heeft het Thaise alfabet?
- Hoeveel tanden wisselt een haai gedurende zijn leven ongeveer?
- Hoeveel minaretten heeft de Taj Mahal?
- Hoeveel kilometer lang is de Niger?
- Hoeveel vel papier zitten er in een standaard riem printpapier?
- Hoeveel procent van de wereldwijde landbouwgrond wordt geïrrigeerd?
- Hoeveel duizend beeldpunten telt een Full HD-scherm?
- Wat is het atoomnummer van ijzer?
- Wat is de snelheid van het licht in vacuüm in kilometer per seconde?
- Hoeveel smaakpapillen heeft een menselijke tong ongeveer?
- Hoeveel procent van het lichaam was bedekt met tatoeages bij de meest getatoeëerde man?
- Hoeveel watt levert de standaard USB-C-lader van Apple voor de iPhone?
- Hoeveel Muzen (dochters van Zeus) telt de Griekse mythologie?
- Hoeveel groepen heeft het moderne periodiek systeem?
- Hoeveel kilometer lang is het metronet van Mexico-Stad?
- Hoeveel bulten heeft een Bactrische kameel?
- Hoeveel piramides telt Egypte ongeveer?
- Hoeveel kilogram rundvlees eet een Argentijn per jaar?
- Hoeveel meter lang is het Millauviaduct in Frankrijk?
- Hoeveel kilometer per uur zwemt een dolfijn op zijn snelst?
- Hoeveel vogelsoorten telt Colombia, het land met de meeste ter wereld?
- Hoeveel duizend knipperbewegingen met je ogen maak je gemiddeld per dag?
- Hoeveel keer werd de FIFA World Cup georganiseerd tot en met 2022?
- Hoeveel liter zuurstof verbruikt een volwassen mens gemiddeld per dag?
- In welk jaar werd de eerste reageerbuisbaby geboren?
- Hoeveel zijvlakken heeft een icosaeder?
- Hoeveel kcal heeft een middelgroot ei?
- Hoeveel landen ondertekenden het Verdrag van Rome in 1957?
- Hoeveel graden Celsius kookt water op zeeniveau?
- Hoeveel soorten worst kent de Duitse keuken ongeveer?
- Hoe lang was de langste man ooit in centimeters?
- Hoeveel noten bevat een standaard majeurtoonladder inclusief het herhaalde octaaf?
- Hoeveel dagen duurde de reis van de Mayflower naar Noord-Amerika?
- Hoeveel millimeter per jaar verschuiven de aardplaten gemiddeld?
- Hoeveel kolibriesoorten komen voor in de Verenigde Staten?
- In welk jaar maakte Robert Fultons onderzeeër Nautilus zijn eerste proefvaart?
- Hoeveel uur per dag slaapt een leeuw gemiddeld?
- Welk percentage van het wereldwijde staal werd in 2023 in China geproduceerd?
- Hoeveel kaassoorten produceert Frankrijk ongeveer?
- Hoeveel ribben heeft een menselijk lichaam in totaal?
- Hoeveel graden Celsius is de gemiddelde zomertemperatuur in Nederland?
- In welk jaar werd de eerste succesvolle orgaantransplantatie uitgevoerd?
- In welk jaar maakte Martin Behaim de oudste bewaard gebleven globe?
- Hoeveel bitcoins kunnen er maximaal worden gecreëerd?
- Wat is de autorij-afstand van Amsterdam naar Parijs in km?
- Hoeveel manieren kun je 3 renners op een podium van 8 deelnemers indelen?
- Hoeveel landen deden mee aan het FIFA World Cup 2022?
- Hoeveel meter lang is het cruiseschip Rotterdam?
- Hoeveel soorten worden volgens de gangbare schatting met uitsterven bedreigd?
- Wat is de totale geschatte lengte van alle bloedvaten in een volwassen menselijk lichaam in kilometers?
- Hoeveel dagvlindersoorten komen voor in Nederland?
- Hoeveel liter water kan een kameel in één keer drinken?
- Hoeveel jongleurs deden mee aan het grootste jongleerrecord?
- Hoe lang duurde de langste voetbalwedstrijd ooit in minuten?
- In welk jaar werd Kenia onafhankelijk van Groot-Brittannië?
- Hoeveel kilometer lang is de Kongo?
- In welk jaar werd de eerste röntgenfoto gemaakt?
- Hoeveel ton koper wordt wereldwijd jaarlijks geproduceerd?
- Hoeveel ton plastic wordt wereldwijd jaarlijks geproduceerd?
- Hoeveel spieren heeft het menselijk lichaam ongeveer?
- Hoeveel werelden verbindt de wereldboom Yggdrasil in de Noorse mythologie?
- Hoeveel zijden heeft een octagoon?
- Hoeveel poten heeft een kreeft?
- Hoeveel elektronen kan de derde elektronenschil maximaal bevatten?
- Hoeveel protonen heeft een neutraal atoom van wolfraam?
- In welk jaar kwam de eerste commerciële microprocessor, de Intel 4004, uit?
- Hoeveel kilometer lang is de Mississippi ongeveer?
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
- Hoeveel halve tonen bevat een octaaf?
- Hoeveel eilanden telt Papoea-Nieuw-Guinea ongeveer?
- Hoeveel procent bedraagt het standaard-btw-tarief in Duitsland?
- Hoeveel oorspronkelijke meetpunten van de Struve-geodetische boog zijn als UNESCO-onderdeel opgenomen?
- Hoeveel meter is de kortste individuele olympische langebaanschaatsafstand?
- Hoeveel snaren heeft een standaard gitaar?
- Hoeveel speelkaarten zitten er in een standaard kaartspel (zonder jokers)?
- Hoeveel dwergplaneten erkent de Internationale Astronomische Unie officieel?
- Hoeveel verdiepingen heeft de Q1 Tower aan de Gold Coast in Australië?
- Hoeveel farao’s hadden de drie grote piramides van Gizeh als opdrachtgever?
- Hoeveel landen worden door de evenaar doorkruist?
- Hoe lang waren de langste vingernagels aan één hand in meters?
- Hoeveel snaren heeft een Chinese guzheng?
- Hoeveel windturbinebladen heeft een moderne windturbine meestal?
- Hoeveel versies van Zonnebloemen in een vaas schilderde Van Gogh in Arles?
- Hoeveel perioden heeft het moderne periodiek systeem?
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
- Hoeveel teams spelen er in de NFL?
- Hoeveel doelpunten maakte Robin van Persie voor het Nederlands elftal?
- Hoeveel miljoen ton groene koffiebonen produceerde de wereld in 2023?
- Hoeveel pionnen gebruikt iedere speler bij Mens-erger-je-niet?
- Hoeveel liter bloed heeft een volwassen mens ongeveer?
