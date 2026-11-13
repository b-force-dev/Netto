# -*- coding: utf-8 -*-
"""Netto — kwaliteitsronde van 12 november 2026 op alle zichtbare vragen.

Draaien:  python tools/corrigeer_vragen_20261112.py [--schrijf]

Zonder --schrijf is het een proefdraai: het script meldt wat het zou doen.
Verslag en bronnen: docs/audit/vragen_audit_20261112.md.

WAT HET DOET
1. Vraagteksten, bronnen en bewijszinnen bijwerken. Nooit een antwoord: zo
   blijft elke som kloppen. De nieuwe tekst gaat overal mee waar de oude stond:
   reviewblad, racepool, breinkrakers, netto_bronnen.js en de redactionele
   selecties van bibliotheek en Find the Connection (veld `original`).
2. In de racepool een dubbele of onherstelbare vraag vervangen door een
   andere bankvraag met hetzelfde antwoord, een andere categorie en een andere
   eenheid. Zo blijft de som exact.
3. Racepuzzels weghalen waar zo'n vervanger niet bestaat. De race kiest elke
   ronde willekeurig uit de pool en bewaart geen voortgang per puzzel-id, dus
   weghalen breekt niets bij spelers.

WAT HET NIET DOET
- Geen nieuwe willekeurige puzzels: bibliotheek- en FTC-id's blijven gelijk.
- Dit is de historische eerste migratiestap, geen herhaalbaar onderhoudscommando.
  Gebruik daarna herstel_vraagaudit_20261112.py voor de Engelse catalogi.
  Fotobestanden en bestaande fotokeuzes blijven onaangeroerd.
- website/ wordt niet bijgewerkt; dat doet tools/sync_website.py.

Na afloop: tools/maak_review_library.py, tools/maak_review_connection.py en
tools/synchroniseer_bank.py --schrijf, dan tools/controleer_puzzels.py.
"""

import json
import os
import sys

import openpyxl

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

WORTEL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, WORTEL)
from puzzels.maak_unieke_puzzels import vraag_eenheid  # noqa: E402

DATA = os.path.join(WORTEL, 'data')
REVIEW = os.path.join(WORTEL, 'vragen', 'vragen_review_compleet.xlsx')
SELECTIES = [os.path.join(WORTEL, 'puzzels', f'{m}_selectie_20260927.json')
             for m in ('library', 'connection')]

WP = 'https://en.wikipedia.org/wiki/'
NL = 'https://nl.wikipedia.org/wiki/'

# id -> velden. id is 'nr<Nr>' (rij in het reviewblad) of het review-id uit de
# selecties ('q123', 'N67'). Velden: vraag (nieuwe NL-tekst), en (nieuw Engels
# label, alleen bibliotheek/FTC), bron, bewijs. Wat ontbreekt blijft gelijk.
CORRECTIES = {
    # --- Biologie & gezondheid
    'nr110': dict(bewijs='De dunne darm is bij een volwassene zes tot zeven meter lang en de dikke darm '
                         'ongeveer anderhalve meter: samen ruwweg 750 centimeter.'),
    'nr606': dict(vraag='Hoeveel liter bloed heeft een volwassen mens ongeveer?',
                  bewijs='Een volwassen man heeft gemiddeld 5 tot 6 liter bloed, een volwassen vrouw 4 tot 5 liter.'),
    'nr607': dict(vraag='Hoeveel liter zuurstof verbruikt een volwassen mens gemiddeld per dag?',
                  bewijs='Een veelgebruikte schatting is dat een volwassene per dag ongeveer 550 liter zuurstof '
                         'verbruikt. Ingeademd wordt meer, want uitgeademde lucht bevat nog zuurstof.'),
    'nr119': dict(bewijs='De speekselklieren maken samen per dag tussen de 0,5 en 1,5 liter speeksel.'),
    'q128': dict(bewijs='Volgens een veelgebruikte schatting zijn alle bloedvaten van een volwassene samen '
                        'zo’n 60.000 mijl lang, ongeveer 96.600 kilometer.'),
    # --- Boeken en literatuur
    'q130': dict(bewijs='The Chronicles of Narnia bestaat uit zeven boeken, verschenen tussen 1950 en 1956.'),
    'q131': dict(bewijs='De hoofdreeks bestaat uit zeven boeken, van De Steen der Wijzen (1997) tot '
                        'De Relieken van de Dood (2007).'),
    'nr135': dict(bewijs='Don Quichot verscheen in twee delen, in 1605 en 1615.'),
    'nr136': dict(bron=NL + 'In_de_ban_van_de_ring',
                  bewijs='The Lord of the Rings verscheen oorspronkelijk in drie delen (1954–1955): '
                         'The Fellowship of the Ring, The Two Towers en The Return of the King.'),
    'nr627': dict(bewijs='Volgens de gangbare telling schreef Shakespeare 39 toneelstukken; het exacte aantal '
                         'hangt af van welke samen geschreven stukken meetellen.'),
    'nr144': dict(bewijs='De Relation van Johann Carolus uit Straatsburg, uit 1605, geldt als de eerste '
                         'gedrukte krant.'),
    'q200': dict(vraag='Hoeveel boeken telt de oorspronkelijke The Hunger Games-reeks?'),
    # --- Dieren
    'nr150': dict(vraag='Hoeveel bulten heeft een Bactrische kameel?', bron=NL + 'Kameel',
                  bewijs='De Bactrische kameel heeft twee bulten; de dromedaris heeft er één.'),
    'nr7': dict(bron=WP + 'King_penguin', bewijs='Een volwassen koningspinguïn weegt ongeveer 9 tot 18 kilo.'),
    'nr10': dict(bron=NL + 'Krabben', bewijs='Krabben hebben tien poten; het voorste paar zijn de scharen.'),
    'nr646': dict(vraag='Hoeveel kilogram weegt een volwassen mannetje van de Aziatische olifant gemiddeld?',
                  bron=WP + 'Asian_elephant',
                  bewijs='Mannetjes van de Aziatische olifant wegen gemiddeld ongeveer 4000 kilogram, '
                         'vrouwtjes ongeveer 2700.'),
    'nr653': dict(bewijs='Wombats wegen meestal tussen de 20 en 35 kilo.'),
    'nr156': dict(bewijs='Potvissen duiken tot meer dan 2000 meter diep, op jacht naar inktvissen.'),
    'q665': dict(bewijs='De gewone tuinslak haalt ongeveer 1,3 centimeter per seconde: bijna vijftig meter per uur.'),
    'nr160': dict(bron=WP + 'Dog', bewijs='Honden hebben 78 chromosomen, oftewel 39 paar.'),
    'q162': dict(bewijs='Pissebedden en andere kreeftachtigen uit de orde Isopoda hebben zeven paar poten: '
                        'samen veertien.'),
    'nr677': dict(bron=WP + 'Lemur', bewijs='Madagaskar telt ruim honderd soorten lemuren; ze leven nergens '
                                            'anders in het wild.'),
    # --- Economie & geld
    'q698': dict(vraag='Hoeveel EU-lidstaten gebruiken de euro (2026)?',
                 en='How many EU member states use the euro (2026)?',
                 bron=NL + 'Eurozone',
                 bewijs='Sinds Bulgarije op 1 januari 2026 overstapte, gebruiken 21 van de 27 EU-lidstaten de euro.'),
    'nr173': dict(bewijs='Op 1 januari 2002 kwamen eurobiljetten en -munten in omloop in twaalf landen.'),
    'nr175': dict(vraag='Hoeveel landen zijn lid van de G20 (de EU en de Afrikaanse Unie niet meegeteld)?',
                  bron=WP + 'G20',
                  bewijs='De G20 bestaat uit 19 landen plus de Europese Unie en, sinds 2023, de Afrikaanse Unie.'),
    'nr172': dict(bron=WP + 'CFA_franc',
                  bewijs='Acht West-Afrikaanse en zes Centraal-Afrikaanse landen gebruiken een CFA-frank: '
                         'samen veertien.'),
    'nr178': dict(bron=WP + 'European_Union_value_added_tax',
                  bewijs='Het normale btw-tarief in België is 21 procent.'),
    'nr179': dict(bron=WP + 'European_Union_value_added_tax',
                  bewijs='Het normale btw-tarief in Duitsland is 19 procent.'),
    'nr181': dict(bron=WP + 'History_of_bitcoin',
                  bewijs='Op 12 januari 2009 stuurde Satoshi Nakamoto tien bitcoin naar Hal Finney: '
                         'de eerste bitcointransactie.'),
    'nr1290': dict(bewijs='Brazilië bestaat uit 26 staten en één federaal district.'),
    # --- Eten & drinken
    'nr703': dict(bewijs='Volgens het jaaroverzicht van McDonald’s had de keten eind 2023 wereldwijd '
                         '41.822 restaurants.'),
    'nr185': dict(bron='https://www.mcdonalds.com/us/en-us/product/cheeseburger.html',
                  bewijs='Een Amerikaanse McDonald’s-cheeseburger bevat ongeveer 31 gram koolhydraten.'),
    'nr707': dict(bewijs='Een Amerikaans blikje Coca-Cola van 355 milliliter bevat 39 gram suiker.'),
    'nr712': dict(bewijs='Argentinië hoort bij de grootste rundvleeseters ter wereld: rond de vijftig kilo '
                         'per persoon per jaar, al daalt dat.'),
    'nr1222': dict(vraag='Hoeveel milliliter gaat er in een standaard Nederlands borrelglas jenever?',
                   bewijs='Een standaard jeneverglaasje (tulpje) bevat 35 milliliter.'),
    'nr722': dict(bron=WP + 'Coffee_production_in_Brazil',
                  bewijs='Brazilië is de grootste koffieproducent ter wereld en levert ongeveer 35 procent '
                         'van alle koffie.'),
    'nr191': dict(vraag='Hoeveel suikerklontjes van 4 gram komen overeen met de suiker in een blikje cola '
                        'van 330 ml (afgerond)?',
                  bewijs='Een blikje Coca-Cola van 330 ml bevat 35 gram suiker; gedeeld door 4 gram per klontje '
                         'is dat bijna 9 klontjes.'),
    # --- Films en series
    'nr194': dict(bron=WP + 'Titanic_(1997_film)',
                  bewijs='Titanic (1997) won elf Oscars, evenveel als Ben-Hur en The Lord of the Rings: '
                         'The Return of the King.'),
    'q740': dict(bron=WP + 'Chernobyl_(miniseries)',
                 bewijs='De HBO-miniserie Chernobyl (2019) telt vijf afleveringen.'),
    'q198': dict(bewijs='Game of Thrones telt 73 afleveringen, verdeeld over acht seizoenen.'),
    'nr196': dict(bron=WP + 'The_Office_(British_TV_series)',
                  bewijs='De Britse The Office telt twaalf afleveringen in twee seizoenen plus twee '
                         'kerstspecials: veertien.'),
    'nr203': dict(vraag='Hoeveel Back to the Future-films zijn er gemaakt?',
                  bewijs='De reeks bestaat uit drie films, uit 1985, 1989 en 1990.'),
    'nr204': dict(vraag='Hoeveel Matrix-films verschenen er vóór The Matrix Resurrections (2021)?',
                  bewijs='Vóór Resurrections verschenen The Matrix (1999), The Matrix Reloaded en '
                         'The Matrix Revolutions (beide 2003).'),
    'nr205': dict(vraag='Hoeveel Jurassic Park-films verschenen er vóór Jurassic World (2015)?',
                  bewijs='Vóór Jurassic World verschenen Jurassic Park (1993), The Lost World (1997) '
                         'en Jurassic Park III (2001).'),
    'nr747': dict(bewijs='Avatar: The Way of Water duurt 192 minuten.'),
    'nr206': dict(bewijs='The Sopranos liep zes seizoenen, van 1999 tot 2007.'),
    'nr745': dict(bewijs='De Amerikaanse versie van The Office liep negen seizoenen, van 2005 tot 2013.'),
    'nr207': dict(vraag='Hoeveel seizoenen van The Simpsons waren er in juli 2026 uitgezonden?',
                  bewijs='Tot de zomer van 2026 waren er 37 seizoenen uitgezonden; seizoen 38 begon in het '
                         'najaar van 2026.'),
    'nr208': dict(bewijs='Sean Connery speelde James Bond in zes officiële films, van Dr. No (1962) tot '
                         'Diamonds Are Forever (1971).'),
    # --- Filosofie, psychologie en religie
    'nr16': dict(bewijs='De Griekse mythologie kent negen Muzen, dochters van Zeus en Mnemosyne.'),
    'q757': dict(bron=NL + 'Apostel', bewijs='Volgens de evangeliën koos Jezus twaalf apostelen.'),
    'nr760': dict(vraag='Hoeveel geboden en verboden telt de Thora volgens de joodse traditie?',
                  bewijs='Volgens het jodendom staan er 613 mitswot in de Thora: 248 geboden en 365 verboden.'),
    'q017': dict(bron=WP + 'Twelve_Olympians',
                 bewijs='De Twaalf Olympiërs waren de belangrijkste goden van de Griekse mythologie; '
                        'ze woonden op de berg Olympus.'),
    'nr212': dict(bewijs='Cerberus wordt meestal afgebeeld als een hond met drie koppen.'),
    'nr215': dict(bewijs='Yggdrasil verbindt in de Noorse mythologie negen werelden.'),
    # --- Gebouwen en infrastructuur
    'nr61': dict(vraag='Hoeveel meter hoog is de Euromast in Rotterdam?'),
    'nr219': dict(bewijs='De onderste booglaag van de Pont du Gard telt zes bogen.'),
    'nr220': dict(vraag='Uit hoeveel parallelle boogspanten bestaat de boog van de Sydney Harbour Bridge?',
                  bewijs='De boog bestaat uit twee parallelle stalen boogspanten met elk 28 panelen.'),
    'q221': dict(bewijs='De Eiffeltoren kan bij warmte tot ongeveer 15 centimeter uitzetten.'),
    'q773': dict(bron=WP + 'Colosseum',
                 bewijs='Het Colosseum had 80 ingangen, waarvan 76 genummerde ingangen voor het publiek.'),
    'q223': dict(bewijs='De bouw van de Taj Mahal begon in 1632; het complex was rond 1653 klaar: ongeveer 21 jaar.'),
    'q450': dict(bewijs='Een gemiddeld stenen blok van de Piramide van Cheops weegt ongeveer 2,5 ton.'),
    'nr778': dict(vraag='Hoeveel meter lang is de hoofdoverspanning van de Golden Gate Bridge?',
                  bewijs='De hoofdoverspanning van de Golden Gate Bridge is 4200 voet lang: 1280 meter.'),
    'nr96': dict(vraag='Hoeveel meter steken de torens van de Golden Gate Bridge boven het water uit?'),
    'nr780': dict(bewijs='Het metronet van Mexico-Stad is in totaal 226,5 kilometer lang, waarvan 200,9 '
                         'kilometer voor reizigers.'),
    'q783': dict(bewijs='De twee hoofdkabels bevatten samen ongeveer 80.000 mijl staaldraad: zo’n '
                        '128.000 kilometer.'),
    'nr228': dict(bron=WP + 'Nelson%27s_Column',
                  bewijs='Aan de voet van Nelson’s Column op Trafalgar Square liggen vier bronzen leeuwen.'),
    'nr798': dict(bewijs='De Tokyo Tower is 333 meter hoog.'),
    'nr234': dict(bron=WP + 'Brooklyn_Bridge', bewijs='De torens van de Brooklyn Bridge zijn 84 meter hoog.'),
    'nr1189': dict(vraag='Hoeveel meter overspant de boog van de Van Brienenoordbrug, afgerond op honderdtallen?',
                   bewijs='De stalen boog van de Van Brienenoordbrug overspant 287 meter: afgerond 300 meter.'),
    'nr239': dict(bron=WP + 'Sultan_Ahmed_Mosque',
                  bewijs='De Blauwe Moskee (Sultan Ahmetmoskee) in Istanbul heeft zes minaretten.'),
    'nr813': dict(bewijs='El Castillo heeft vier trappen van elk 91 treden.'),
    'nr816': dict(vraag='Hoeveel tegels bedekken ongeveer het dak van het Sydney Opera House?',
                  bewijs='Het dak is bedekt met 1.056.006 tegels: ongeveer een miljoen.'),
    'nr817': dict(bewijs='Voor de Eiffeltoren werd 7300 ton (puddel)ijzer gebruikt.'),
    'nr818': dict(bron='https://www.toureiffel.paris/en/the-monument/key-figures',
                  bewijs='De Eiffeltoren weegt in totaal ongeveer 10.100 ton.'),
    'nr823': dict(vraag='Hoeveel verdiepingen heeft de Gran Torre Santiago in Chili, het hoogste gebouw van '
                        'Zuid-Amerika?',
                  bron='https://www.skyscrapercenter.com/santiago/torre-costanera/521/',
                  bewijs='De Gran Torre Santiago is 300 meter hoog en telt 62 verdiepingen boven de grond.'),
    'nr824': dict(vraag='Hoeveel verdiepingen heeft de Q1 Tower aan de Gold Coast in Australië?'),
    'nr252': dict(bewijs='De UNESCO-inschrijving van het werk van Le Corbusier omvat zeventien gebouwen in '
                         'zeven landen.'),
    # --- Geografie
    'q835': dict(bewijs='Marokko, Algerije, Tunesië, Libië en Egypte grenzen aan de Middellandse Zee.'),
    'nr259': dict(bron='https://www.usgs.gov/faqs/how-many-active-volcanoes-are-there-earth',
                  bewijs='Wereldwijd zijn er ongeveer 1350 mogelijk actieve vulkanen.'),
    'nr1173': dict(bewijs='Op 1 januari 2025 telde Amsterdam 934.526 inwoners; een jaar eerder ruim 930.000.'),
    'nr838': dict(vraag='Ruim hoeveel duizend inwoners had Luxemburg op 1 januari 2023?',
                  bron='https://statistiques.public.lu/en/actualites/2023/stn21-population-2023.html',
                  bewijs='Op 1 januari 2023 woonden er 660.809 mensen in Luxemburg.'),
    'nr853': dict(vraag='Hoeveel duizend kilometer lang is de kustlijn van het Australische vasteland?',
                  bewijs='Volgens Geoscience Australia is de kustlijn van het vasteland ongeveer 35.900 kilometer lang.'),
    'nr843': dict(vraag='Uit hoeveel eilanden bestaat Indonesië, afgerond op duizendtallen?',
                  bewijs='Indonesië bestaat uit ruim 17.000 eilanden.'),
    'nr262': dict(bewijs='België is verdeeld in drie gewesten: het Vlaams, het Waals en het Brussels '
                         'Hoofdstedelijk Gewest.'),
    'q145': dict(bron=NL + 'Vlag_van_Belgi%C3%AB',
                 bewijs='De Belgische vlag heeft drie verticale banen: zwart, geel en rood.'),
    'nr849': dict(bron='https://www.britannica.com/place/Sahara-desert-Africa',
                  bewijs='De Sahara is van noord naar zuid 1300 tot 1900 kilometer breed, van oost naar west '
                         'zo’n 4800 kilometer.'),
    'nr863': dict(bewijs='De Niger is ongeveer 4200 kilometer lang.'),
    'nr865': dict(bewijs='De Rijn is ongeveer 1230 kilometer lang.'),
    'nr866': dict(bewijs='De Zambezi is 2574 kilometer lang.'),
    'nr270': dict(bron='https://www.cia.gov/the-world-factbook/countries/norway/',
                  bewijs='Volgens het CIA World Factbook is de Noorse kustlijn, met fjorden en eilanden, '
                         '25.148 kilometer lang.'),
    'nr563': dict(bewijs='Brazilië grenst aan tien landen: alle Zuid-Amerikaanse landen behalve Chili en '
                         'Ecuador, plus Frankrijk via Frans-Guyana.'),
    'nr277': dict(bewijs='Aan de Dode Zee liggen Jordanië en Israël; ook de Westelijke Jordaanoever '
                         'grenst eraan.'),
    'nr281': dict(bewijs='Aan de Adriatische Zee liggen Italië, Slovenië, Kroatië, Bosnië en '
                         'Herzegovina, Montenegro en Albanië.'),
    'q288': dict(bewijs='Over de Niagarawatervallen stroomt gemiddeld ongeveer 2400 kubieke meter water per '
                        'seconde: 2,4 miljoen liter.'),
    'q936': dict(bewijs='Uluru steekt 348 meter boven de omgeving uit (863 meter boven zeeniveau).'),
    'q939': dict(bewijs='De hoogste top van de Kilimanjaro is 5895 meter hoog.'),
    'q945': dict(bewijs='Argentinië telde bij de volkstelling van 2022 ruim 46 miljoen inwoners.'),
    'nr947': dict(vraag='Hoeveel miljoen inwoners had Brazilië in 2024?'),
    'q948': dict(bewijs='Chili heeft ongeveer twintig miljoen inwoners.'),
    'q952': dict(bewijs='Peru heeft ongeveer 34 miljoen inwoners.'),
    'nr961': dict(bewijs='De Volksrepubliek China telt officieel 23 provincies; Taiwan rekent zij daar als 23e bij.'),
    'q971': dict(bewijs='Heel India gebruikt één tijdzone: Indian Standard Time (UTC+5:30).'),
    'q974': dict(vraag='Uit hoeveel meren bestaan de Grote Meren van Noord-Amerika?', bron=NL + 'Grote_Meren',
                 bewijs='De Grote Meren zijn vijf meren: het Bovenmeer, het Michiganmeer, het Huronmeer, '
                        'het Eriemeer en het Ontariomeer.'),
    'N67': dict(vraag='Uit hoeveel eilanden bestaan de Malediven?'),
    'q307': dict(vraag='Op hoeveel meter boven zeeniveau ligt het Titicacameer ongeveer?'),
    'nr422': dict(bron='https://www.google.com/maps/dir/Amsterdam/Rome',
                  bewijs='Over de weg is het van Amsterdam naar Rome ongeveer 1650 kilometer.'),
    # --- Geschiedenis
    'q991': dict(vraag='Hoeveel dagen zaten er tussen D-Day en de bevrijding van Parijs?',
                 bron=NL + 'Bevrijding_van_Parijs',
                 bewijs='D-Day was op 6 juni 1944; Parijs werd op 25 augustus 1944 bevrijd: 80 dagen later.'),
    'nr992': dict(vraag='Hoeveel dagen duurde de Slag bij Verdun ongeveer?',
                  bewijs='De Slag bij Verdun duurde van 21 februari tot 18 december 1916: ongeveer 300 dagen.'),
    'q1001': dict(bewijs='De apartheid werd in 1948 ingevoerd en eindigde in 1994 met de eerste vrije verkiezingen.'),
    'q1004': dict(bewijs='Nelson Mandela zat van 1962 tot 1990 gevangen: 27 jaar.'),
    'q1012': dict(bewijs='Bij de uitbarsting van 79 na Christus kwamen in Pompeï volgens een veelgebruikte '
                         'schatting ongeveer 2000 mensen om.'),
    'q1014': dict(bewijs='Vier Amerikaanse presidenten werden vermoord: Lincoln, Garfield, McKinley en Kennedy.'),
    'q1018': dict(bewijs='Columbus vertrok in 1492 met drie schepen: de Santa María, de Pinta en de Niña.'),
    'nr329': dict(bewijs='Bij de evacuatie van Duinkerken werden ruim 850 schepen en boten ingezet.'),
    'nr1013': dict(vraag='De hoeveelste president van de Verenigde Staten was Joe Biden?'),
    'nr1016': dict(vraag='Hoeveel schepen telde de Griekse vloot tijdens de Slag bij Salamis ongeveer?',
                   bewijs='De Griekse vloot telde ongeveer 370 triremen; de Perzische vloot was ruim twee keer '
                          'zo groot.'),
    'nr1020': dict(vraag='Hoeveel soldaten telde het Brits-geallieerde leger van Wellington bij Waterloo ongeveer?'),
    'N40': dict(vraag='Hoeveel huizen werden verwoest bij de Grote Brand van Londen?'),
    'N35': dict(vraag='Hoeveel kilometer lang was de Berlijnse Muur?'),
    'N72': dict(vraag='Hoeveel passagiers voeren met de Mayflower naar Amerika?'),
    'N38': dict(vraag='Hoeveel seconden duurde de eerste geslaagde gemotoriseerde vlucht?'),
    'nr1058': dict(vraag='In welk jaar bereikte Columbus op zijn eerste reis Amerika?'),
    'nr306': dict(vraag='In welk jaar maakte Martin Behaim de oudste bewaard gebleven globe?'),
    'nr1042': dict(vraag='In welk jaar riep Colombia zijn onafhankelijkheid van Spanje uit?'),
    'nr629': dict(vraag='In welk jaar werd de Al-Qarawiyyin in Fez gesticht, de oudste nog bestaande universiteit?'),
    'nr1045': dict(bewijs='India werd op 15 augustus 1947 onafhankelijk van Groot-Brittannië.'),
    # --- Kunst en cultuur
    'nr1064': dict(vraag='Hoeveel UNESCO-werelderfgoedlocaties had China in 2025?',
                   bewijs='Na de inschrijvingen van juli 2025 stond China op zestig werelderfgoedlocaties, '
                          'één minder dan Italië.'),
    'nr1065': dict(vraag='Hoeveel UNESCO-werelderfgoedlocaties had Duitsland in 2025?'),
    'nr1165': dict(vraag='Hoeveel etsen maakte Rembrandt ongeveer?',
                   bewijs='Rembrandt maakte ongeveer driehonderd etsen.'),
    'nr1224': dict(bewijs='Amsterdam telt ongeveer tachtig musea.'),
    'nr354': dict(vraag='Hoeveel versies van Zonnebloemen in een vaas schilderde Van Gogh in Arles?',
                  bron=WP + 'Sunflowers_(Van_Gogh_series)',
                  bewijs='In Arles schilderde Van Gogh zeven versies: vier in augustus 1888 en drie herhalingen '
                         'in januari 1889.'),
    'nr814': dict(vraag='Hoeveel beelden telt het Terracottaleger ongeveer?'),
    'nr355': dict(bron=WP + 'Self-portraits_by_Rembrandt',
                  bewijs='Rembrandt schilderde ongeveer veertig zelfportretten.'),
    # --- Landbouw en industrie
    'nr358': dict(bewijs='De draagtijd van een schaap is gemiddeld 147 dagen, met een spreiding van 142 tot 152.'),
    'nr359': dict(bewijs='Een gemiddelde nieuwe Europese auto bevatte in 2022 ongeveer 200 kilo aluminium.'),
    'nr1085': dict(bron='https://worldsteel.org/data/world-steel-in-figures/',
                   bewijs='Ruim de helft van al het staal gaat naar gebouwen en infrastructuur.'),
    'nr1086': dict(vraag='Welk percentage van het wereldwijde staal werd in 2023 in China geproduceerd?',
                   bewijs='In 2023 maakte China 1019 miljoen ton van de 1888 miljoen ton ruwstaal: 54 procent.'),
    # --- Merken
    'q1089': dict(bron='https://www.retaildetail.eu/news/food/lidl-now-has-13000-stores-worldwide/',
                  bewijs='In september 2026 passeerde Lidl de grens van 13.000 winkels wereldwijd.'),
    # --- Milieu en duurzaamheid
    'nr372': dict(vraag='Hoeveel miljoen ton plastic afval lekt jaarlijks in rivieren, meren en zeeën, '
                        'volgens de ondergrens van de VN-schatting?',
                  bewijs='Volgens UNEP lekt jaarlijks 19 tot 23 miljoen ton plastic afval in rivieren, meren '
                         'en zeeën.'),
    'nr49': dict(bewijs='Ongeveer de helft van alle plant- en diersoorten op aarde leeft in tropische regenwouden.'),
    'nr376': dict(bron='https://www.fao.org/forest-resources-assessments/en/',
                  bewijs='Ongeveer 31 procent van het landoppervlak van de aarde is bedekt met bos.'),
    'nr380': dict(bewijs='Volgens de OESO werd in 2019 22 procent van het plastic afval slecht beheerd.'),
    # --- Mode en lifestyle
    'nr400': dict(vraag='Hoeveel facetten heeft een rond briljant geslepen diamant, zonder de punt (culet) '
                        'mee te tellen?',
                  bewijs='Een ronde briljant heeft 57 facetten; met een culet erbij worden het er 58.'),
    # --- Muziek
    'nr386': dict(vraag='Hoeveel Grammy-nominaties had Beyoncé in totaal bij de uitreiking van februari 2025?',
                  bewijs='Met elf nieuwe nominaties voor 2025 kwam Beyoncé op 99 Grammy-nominaties, meer dan '
                         'wie ook.'),
    'nr1195': dict(bewijs='Het carillon van de Domtoren telt vijftig klokken.'),
    'q1110': dict(bewijs='De klassieke bezetting van The Beatles bestond uit vier leden: John Lennon, Paul '
                         'McCartney, George Harrison en Ringo Starr.'),
    'nr388': dict(bewijs='Un Verano Sin Ti (2022) telt 23 nummers.'),
    'nr140': dict(bewijs='Een concertpedaalharp heeft 47 snaren.'),
    'nr392': dict(bewijs='Een standaard gitaar heeft zes snaren.'),
    'nr394': dict(bewijs='Beethoven schreef zestien strijkkwartetten.'),
    'nr395': dict(bewijs='Michael Jackson bracht tien solo-studioalbums uit, van Got to Be There (1972) tot '
                         'Invincible (2001).'),
    'q1130': dict(vraag='Hoeveel studioalbums met nieuw werk had Taylor Swift eind 2025 uitgebracht?',
                  bron=WP + 'The_Life_of_a_Showgirl',
                  bewijs='The Life of a Showgirl (oktober 2025) is het twaalfde studioalbum van Taylor Swift. '
                         'Heropnames (Taylor’s Version) tellen niet mee.'),
    # --- Natuurkunde
    'q404': dict(vraag='Wat is de hoogste windsnelheid in kilometer per uur die nog bij windkracht 8 hoort?',
                 bewijs='Windkracht 8 loopt van 62 tot 74 kilometer per uur.'),
    # --- Politiek en recht
    'nr410': dict(bewijs='De Nederlandse Grondwet telt 142 artikelen.'),
    'nr425': dict(bron=NL + 'Verklaring_van_de_rechten_van_de_mens_en_de_burger',
                  bewijs='De Verklaring van de Rechten van de Mens en de Burger (1789) telt zeventien artikelen.'),
    'nr1254': dict(vraag="In hoeveel regio's is Peru bestuurlijk verdeeld?", bron=WP + 'Regions_of_Peru',
                   bewijs="Peru is verdeeld in 25 regio's, met daarnaast de provincie Lima."),
    'nr1266': dict(vraag='Hoeveel landen horen bij de Schengenzone (2026)?',
                   bewijs='Sinds Bulgarije en Roemenië op 1 januari 2025 volledig toetraden, telt de '
                          'Schengenzone 29 landen. Cyprus is nog geen lid.'),
    'nr1294': dict(vraag='Hoeveel zetels telde het Australische Huis van Afgevaardigden na de verkiezingen van 2022?',
                   bron='https://www.aph.gov.au/About_Parliament/Parliamentary_departments/Parliamentary_Library/'
                        'Research/FlagPost/2025/August/2025_Australian_Federal_Election',
                   bewijs='Na de verkiezingen van 2022 telde het Huis 151 zetels; sinds de verkiezingen van 2025 '
                          'zijn het er 150.'),
    'nr1293': dict(vraag='Hoeveel zetels telt het Nieuw-Zeelandse parlement normaal, zonder overhangzetels?',
                   bewijs='Het parlement heeft normaal 120 zetels; door overhangzetels zijn het er na de '
                          'verkiezingen van 2023 tijdelijk 123.'),
    # --- Records en vergelijkingen
    'nr434': dict(bewijs='De grootste pizza ooit besloeg 1296,72 vierkante meter; Pizza Hut en Airrack maakten '
                         'hem in 2023 in Los Angeles.'),
    'nr438': dict(bewijs='Het kleinste paard ooit volgens Guinness, Thumbelina, mat 44,5 centimeter.'),
    'q447': dict(bewijs='Bluey werd 29 jaar en 5 maanden. Bobi nam de titel in 2023 over, maar Guinness trok '
                        'die in 2024 weer in.'),
    'nr71': dict(vraag='Hoeveel kilogram woog de zwaarste pompoen ter wereld eind 2025?',
                 bron='https://www.guinnessworldrecords.com/news/2026/10/'
                      'pumpkinpalooza-how-the-worlds-biggest-pumpkin-record-fell-twice-in-one-week',
                 bewijs='Eind 2025 stond het record op naam van de broers Ian en Stuart Paton: 1278,8 kilogram. '
                        'In oktober 2026 werd het twee keer verbroken.'),
    'nr452': dict(vraag='Hoeveel marathons had de Duitser Horst Preisler eind 2004 gelopen?',
                  bewijs='Horst Preisler liep tussen 1974 en eind 2004 1305 marathons of langere afstanden.'),
    'nr454': dict(vraag='Hoeveel piercings had Rolf Buchholz, de man met de meeste piercings, in 2012?',
                  bewijs='Guinness telde in 2012 453 piercings bij de Duitser Rolf Buchholz.'),
    'nr72': dict(bewijs='Lucky Diamond Rich heeft zijn hele lichaam laten tatoeëren, tot en met de '
                        'oogleden en de binnenkant van zijn mond.'),
    # --- Reizen en toerisme
    'nr1316': dict(vraag='Hoeveel hotels had Hilton eind 2023 wereldwijd ongeveer?',
                   bewijs='Hilton had eind 2023 ruim 7500 hotels.'),
    'nr1317': dict(vraag='Ruim hoeveel miljoen passagiers verwerkte Atlanta Airport, de drukste luchthaven ter '
                         'wereld, in 2023?',
                   bewijs='Hartsfield-Jackson verwerkte in 2023 104,7 miljoen passagiers, meer dan enige andere '
                          'luchthaven.'),
    # --- Scheikunde
    'nr462': dict(bron=NL + 'Covalente_binding',
                  bewijs='Een enkelvoudige covalente binding is één gedeeld elektronenpaar: twee elektronen.'),
    'nr1320': dict(bron=NL + 'Chloride',
                   bewijs='Chloor heeft 17 elektronen; het chloride-ion Cl⁻ heeft er één extra: 18.'),
    # --- Spellen en speelgoed
    'q1335': dict(bewijs='Een standaard Rubiks kubus heeft zes kleuren, één per zijvlak.'),
    'nr1336': dict(bewijs='Het totaal aantal geproduceerde LEGO-steentjes loopt in de honderden miljarden en '
                          'groeit elk jaar.'),
    'q1337': dict(bewijs='Bij schaken begint elke speler met acht pionnen.'),
    'nr1340': dict(bewijs='Een dambord van 8 bij 8 heeft 64 velden.'),
    'nr491': dict(vraag='Hoeveel vakjes telt de looproute rond een standaard Mens-erger-je-niet-bord?',
                  bewijs='De looproute rond het bord telt veertig vakjes, tien per kleur.'),
    'N19': dict(vraag='Hoeveel minuten duurt een volledige dag-en-nachtcyclus in Minecraft?'),
    # --- Sport
    'nr495': dict(bewijs='De Honda RA168E uit 1988 was een V6-turbomotor: zes cilinders.'),
    'nr1359': dict(bewijs='Van 1930 tot en met 2022 werd het WK voetbal 22 keer gehouden.'),
    'q1360': dict(vraag='Hoeveel keer won Argentinië het WK voetbal bij de mannen, tot en met 2026?'),
    'q1363': dict(vraag='Hoeveel keer won Brazilië het WK voetbal bij de mannen, tot en met 2026?'),
    'q1364': dict(vraag='Hoeveel keer won Duitsland het WK voetbal bij de mannen, tot en met 2026?'),
    'nr1366': dict(bron=WP + 'List_of_Tour_de_France_general_classification_winners',
                   bewijs='Franse renners wonnen de Tour de France 36 keer; de laatste was Bernard Hinault in 1985.'),
    'nr1373': dict(bewijs='Een marathon is 42,195 kilometer lang.'),
    'nr1375': dict(bron=WP + '2022_FIFA_World_Cup', bewijs='Aan het WK van 2022 in Qatar deden 32 landen mee.'),
    'q1377': dict(vraag='Hoeveel landen deden mee aan het WK voetbal van 2026?',
                  bewijs='Het WK van 2026 was het eerste met 48 landen.'),
    # --- Sterrenkunde & ruimte
    'q508': dict(bewijs='Het volume van de zon is ongeveer 1,3 miljoen keer dat van de aarde.'),
    'q1420': dict(vraag='Hoeveel Apollo-missies landden met astronauten op de maan?'),
    'q512': dict(bewijs='Jupiter draait in ongeveer 9 uur en 56 minuten om zijn as: bijna tien uur.'),
    'q517': dict(bron=WP + 'Apollo_11',
                 bewijs='Apollo 11 had drie bemanningsleden: Neil Armstrong, Buzz Aldrin en Michael Collins.'),
    'nr349': dict(vraag='Hoeveel dwergplaneten erkent de Internationale Astronomische Unie officieel?',
                  bewijs='De IAU erkent vijf dwergplaneten: Pluto, Ceres, Eris, Haumea en Makemake.'),
    'nr516': dict(vraag='Hoeveel bekende manen had Saturnus in maart 2026?',
                  bron='https://earthsky.org/space/more-moons-for-jupiter-and-saturn-total-satellite-discoveries/',
                  bewijs='Na de aankondiging van elf nieuwe manen op 16 maart 2026 kwam Saturnus op 285 bekende manen.'),
    'nr520': dict(bewijs='Aan boord van het ISS ligt ongeveer dertien kilometer elektrische bekabeling.'),
    'nr403': dict(bewijs='De aarde beweegt met gemiddeld bijna 30 kilometer per seconde om de zon.'),
    'nr525': dict(bewijs='Een lichtjaar is ongeveer 9,46 biljoen kilometer: 9460 miljard kilometer.'),
    'q139': dict(bewijs='Mars heeft twee manen: Phobos en Deimos.'),
    'nr526': dict(vraag='Hoeveel bekende ringen heeft Uranus?', bron=WP + 'Rings_of_Uranus',
                  bewijs='Uranus heeft dertien bekende ringen.'),
    'q527': dict(bewijs='Jupiter, Saturnus, Uranus en Neptunus hebben allemaal ringen.'),
    'q528': dict(bewijs='Alleen Mercurius en Venus staan dichter bij de zon dan de aarde.'),
    'q534': dict(bron=WP + 'International_Space_Station',
                 bewijs='Het ISS draait op gemiddeld ongeveer 400 kilometer hoogte om de aarde.'),
    'q1439': dict(vraag='Hoeveel kilometer per uur is de baansnelheid van het ISS ongeveer?'),
    'nr1441': dict(vraag='Hoeveel kilometer is de gemiddelde diameter van de aarde?'),
    'nr1445': dict(vraag='Hoeveel graden Celsius is het aan het oppervlak van de zon ongeveer?'),
    # --- Taal
    'nr542': dict(bewijs='Het moderne Georgische alfabet telt 33 letters.'),
    'nr86': dict(bewijs='Het Hebreeuwse alfabet telt 22 letters.'),
    'nr543': dict(bewijs='Het Russische alfabet telt 33 letters.'),
    'nr322': dict(bewijs='Het moderne Latijnse alfabet telt 26 letters.'),
    'nr430': dict(bewijs='De Verenigde Naties hebben zes officiële talen: Arabisch, Chinees, Engels, Frans, '
                         'Russisch en Spaans.'),
    'q957': dict(bewijs='België heeft drie officiële talen: Nederlands, Frans en Duits.'),
    'nr956': dict(vraag='Hoeveel talen staan in de Achtste Bijlage van de Indiase grondwet?'),
    # --- Technologie
    'nr1458': dict(bewijs='Volgens de binaire definitie is een gigabyte 1024 megabyte.'),
    'nr550': dict(vraag='Hoeveel watt levert de standaard USB-C-lader van Apple voor de iPhone?',
                  bewijs='Apple verkoopt een 20W USB-C Power Adapter als standaardlader voor de iPhone.'),
    'nr553': dict(bron=WP + 'HTC_Dream',
                  bewijs='De eerste Android-telefoon, de HTC Dream (T-Mobile G1), kwam in 2008 uit.'),
    'nr1474': dict(vraag='In welk jaar kwam de eerste commerciële microprocessor, de Intel 4004, uit?'),
    'nr93': dict(bewijs='Parijs en Brussel kregen in 1887 een telefoonverbinding: de eerste internationale lijn.'),
    # --- Vervoer
    'nr1184': dict(bewijs='De HSL-Zuid is ongeveer 125 kilometer lang.'),
    'nr1455': dict(vraag='Hoeveel kilometer per uur haalde de Shanghai Maglev in de reguliere dienst tot 2021?',
                   bewijs='Tot 2021 reed de Shanghai Maglev in dienst tot 431 km/u; sindsdien is dat 300 km/u.'),
    'nr414': dict(bron=NL + 'Rotterdamse_metro',
                  bewijs='De Rotterdamse metro heeft vijf lijnen: A, B, C, D en E.'),
    'nr416': dict(bron=NL + 'Amsterdamse_metro',
                  bewijs='De Amsterdamse metro heeft vijf lijnen: 50, 51, 52, 53 en 54.'),
    'q576': dict(vraag='Hoeveel metrolijnen had de Parijse metro in 2025?',
                 en='How many lines did the Paris Métro have in 2025?',
                 bewijs='De Parijse metro had in 2025 zestien lijnen: 1 tot en met 14 plus 3bis en 7bis.'),
    'q579': dict(bewijs='Heathrow heeft twee parallelle start- en landingsbanen.'),
    'nr98': dict(bewijs='Schiphol heeft zes start- en landingsbanen.'),
    'q580': dict(bewijs='De MTA telt 472 stations in de New York City Subway.'),
    'q584': dict(bewijs='De Boeing 747 staat op achttien wielen: vier hoofdlandingsgestellen met elk vier '
                        'wielen en een neuswiel met twee.'),
    'N53': dict(vraag='Hoeveel kilometer per uur kon de Concorde halen?'),
    'nr590': dict(vraag='In welk jaar maakte Robert Fultons onderzeeër Nautilus zijn eerste proefvaart?',
                  bewijs='Robert Fulton testte zijn onderzeeër Nautilus in 1800 in Frankrijk.'),
    'nr593': dict(bron=WP + 'First_aerial_circumnavigation',
                  bewijs='In 1924 vlogen twee vliegtuigen van het Amerikaanse leger als eersten rond de wereld.'),
    'nr1488': dict(vraag='Hoeveel miljoen motorvoertuigen werden er in 2022 wereldwijd geproduceerd?',
                   bewijs='Volgens OICA werden in 2022 wereldwijd ruim 85 miljoen motorvoertuigen gemaakt.'),
    # --- Wiskunde
    'nr1505': dict(bewijs='Een n-hoek heeft n(n−3)/2 diagonalen; voor een twaalfhoek is dat 12 × 9 / 2 = 54.'),
    'q350': dict(bewijs='Een volledige cirkel meet per definitie 360 graden.'),
    'nr600': dict(bewijs='Een octagoon (achthoek) heeft acht zijden.'),
    'nr599': dict(bewijs='Een icosaëder heeft twintig zijvlakken en dertig ribben.'),
}

# Zes vragen stonden met dezelfde Nederlandse tekst in de bibliotheek en in de
# vragenbank/race, maar met een ander antwoord. Elk krijgt nu een eigen tekst
# die bij zijn eigen antwoord past. review-id -> (bibliotheektekst,
# bank- en racetekst, bewijszin bank of None, bron bank of None).
SPLITSINGEN = {
    'q698': ('Hoeveel EU-lidstaten gebruiken de euro (2026)?',
             'Hoeveel EU-lidstaten gebruikten de euro in 2025?',
             'In 2025 gebruikten 20 van de 27 EU-lidstaten de euro; Bulgarije volgde op 1 januari 2026.',
             NL + 'Eurozone'),
    'q773': ('Hoeveel genummerde publieksingangen had het Colosseum?',
             'Hoeveel ingangen had het Colosseum?', None, None),
    'q1249': ('Hoeveel miljoen inwoners heeft China volgens de VN-schatting voor 2025?',
              'Hoeveel miljoen inwoners heeft China?', None, None),
    'q1309': ('Hoeveel kilogram woog de zwaarste lederschildpad ooit, volgens Guinness World Records?',
              'Hoeveel kilogram woog de zwaarste schildpad ooit, volgens het National Museum Wales?',
              'De lederschildpad die in 1988 bij Harlech aanspoelde, woog volgens het National Museum Wales '
              '916 kilo. Guinness World Records noemt 961 kilo.',
              'https://museum.wales/articles/1009/The-largest-turtle-in-the-world'),
    'q128': ('Hoeveel kilometer zijn alle bloedvaten van een volwassene samen lang, volgens de bekende '
             'schatting van 60.000 mijl?',
             'Wat is de totale geschatte lengte van alle bloedvaten in een volwassen menselijk lichaam in kilometers?',
             'Een veelgebruikte schatting is dat alle bloedvaten van een volwassene samen zo’n 100.000 '
             'kilometer lang zijn.', None),
    'q1439': ('Hoeveel kilometer per uur is de baansnelheid van het ISS, afgerond op duizendtallen?',
              'Hoeveel kilometer per uur is de baansnelheid van het ISS ongeveer?',
              'Het ISS draait met ongeveer 27.600 kilometer per uur om de aarde.', None),
}

# racepuzzel -> (positie, Nr van de vervangende bankvraag). Zelfde antwoord,
# andere categorie en eenheid dan de twee overgebleven vragen.
VERVANGINGEN = {
    'pool-227': (2, 161),   # G20 (derde keer in de pool)      -> chromosomenparen kat
    'pool-253': (2, 163),   # euromunten (dubbel)              -> poten van een spin
    'pool-265': (1, 196),   # China-buurlanden (dubbel)        -> The Office UK
    'pool-192': (2, 1410),  # Middellandse Zee-landen (dubbel)  -> voetballers op het veld
    'pool-234': (3, 567),   # 13 koloniën (dubbel)              -> landen op de evenaar
    'pool-059': (2, 1007),  # gitaarsnaren (dubbel)            -> Verdrag van Rome
    'pool-135': (1, 88),    # Schengen (dubbel)                -> Turks alfabet
    'pool-049': (2, 1377),  # NBA-speeltijd (drie keer)        -> landen WK 2026
    'pool-019': (2, 584),   # honkbal "18 tegelijk" (onjuist)  -> wielen Boeing 747
    'pool-133': (2, 1290),  # wereldhandel 26 biljoen (onjuist) -> staten van Brazilië
    'pool-060': (3, 1136),  # "water en land samen" (onzin)   -> kookpunt water
}

# Racepuzzels zonder passende vervanger. Reden staat in het verslag.
WEGHALEN = {
    'pool-170': 'G20 dubbel; ook de ridders bij Hastings en de "eerste laptop" zijn twijfelachtig',
    'pool-115': 'Shakespeare 39 dubbel en "werken" dubbelzinnig',
    'pool-224': 'Koran 114 dubbel en "boeken" onjuist (het zijn soera’s)',
    'pool-030': 'diepte Grand Canyon dubbel',
    'pool-190': 'eilanden Great Barrier Reef dubbel',
    'pool-215': 'Honderdjarige Oorlog dubbel',
    'pool-203': 'lichtsnelheid dubbel',
    'pool-023': 'Lagerhuis 650 dubbel',
    'pool-199': 'golf/minigolf 18 dubbel',
    'pool-236': 'golf 18 dubbel',
    'pool-178': 'NBA-speeltijd dubbel',
    'pool-198': 'Jupiter heeft 101 bekende manen, niet 115',
    'pool-180': 'Jupiter heeft 101 bekende manen, niet 115',
    'pool-048': 'afstand aarde-zon dubbel',
    'pool-028': 'Thaise letters dubbel',
    'pool-045': 'Parijse metro heeft 321 stations, niet 308',
    'pool-126': 'oppervlakte provincie Utrecht 1449 km² klopt niet meer (1560 km²)',
    'pool-073': 'twee jaartalvragen in één puzzel (verborgen door de typfout "In welk year")',
}

# Breinkrakers worden niet meer ingeladen, maar moeten wel door de controle.
# Na het herstel van de teksten vallen deze twee op een dubbele eenheid.
BREIN_WEGHALEN = {
    'bk-151': 'Titicacameer en Millauviaduct allebei in meters',
    'bk-153': 'twee jaartalvragen (verborgen door de typfout "In welk year")',
}


def lees_js(naam):
    tekst = open(os.path.join(DATA, naam), encoding='utf-8').read()
    i = tekst.index('window.')
    j = tekst.index('=', i)
    return tekst[:i], tekst[i:j].strip(), json.loads(tekst[j + 1:].strip().rstrip(';'))


def schrijf_js(naam, kop, globaal, waarde):
    with open(os.path.join(DATA, naam), 'w', encoding='utf-8', newline='\n') as f:
        f.write(kop + globaal + ' = ' + json.dumps(waarde, ensure_ascii=False, separators=(',', ':')) + ';\n')


def main():
    schrijf = '--schrijf' in sys.argv
    boek = openpyxl.load_workbook(REVIEW)
    blad = boek['Vragen']
    kol = {c.value: n for n, c in enumerate(blad[1], start=1)}
    rijen = {}
    for r in range(2, blad.max_row + 1):
        nr = blad.cell(r, kol['Nr']).value
        if nr is not None:
            rijen[int(nr)] = r

    def cel(r, naam):
        return blad.cell(r, kol[naam])

    selecties = {pad: json.load(open(pad, encoding='utf-8')) for pad in SELECTIES}
    sel_vragen = {}
    for sel in selecties.values():
        for p in sel['puzzles']:
            for q in p['questions']:
                sel_vragen.setdefault(q['id'], []).append(q)

    kop_r, glob_r, race = lees_js('netto_race_pool.js')
    kop_b, glob_b, brein = lees_js('netto_breinkrakers.js')
    kop_n, glob_n, bronnen = lees_js('netto_bronnen.js')
    _, _, fotos = lees_js('netto_fotos.js')   # alleen lezen

    gewijzigd_nl, gewijzigd_bewijs, log = [], [], []

    # 1. Teksten, bronnen en bewijszinnen
    for sleutel, v in CORRECTIES.items():
        if sleutel.startswith('nr'):
            rij = rijen[int(sleutel[2:])]
            oud = cel(rij, 'Vraag NL').value
        else:
            oud = sel_vragen[sleutel][0]['original']
            rij = next((r for r in rijen.values() if cel(r, 'Vraag NL').value == oud), None)
        nieuw = v.get('vraag', oud)
        if rij:
            if 'vraag' in v:
                cel(rij, 'Vraag NL').value = nieuw
            if 'bron' in v:
                cel(rij, 'Bron (geverifieerd)').value = v['bron']
            if 'bewijs' in v:
                cel(rij, 'Bewijszin').value = v['bewijs']
        for q in sel_vragen.get(sleutel, []) + [q for qs in sel_vragen.values() for q in qs
                                                  if q['original'] == oud and sleutel not in sel_vragen]:
            q['original'] = nieuw
            if 'bron' in v:
                q['source'] = v['bron']
            if 'bewijs' in v:
                q['evidence'] = v['bewijs']
            if 'en' in v:
                q['question'] = v['en']
        for p in race:
            for i in (1, 2, 3):
                if p[f'q{i}_label'] == oud:
                    p[f'q{i}_label'] = nieuw
        for p in brein:
            for i in (1, 2, 3, 4):
                if p[f'q{i}']['label'] == oud:
                    p[f'q{i}']['label'] = nieuw
        oude_bron = bronnen.pop(oud, None)
        if oude_bron is not None or 'bewijs' in v:
            vermelding = dict(oude_bron or {})
            if 'bron' in v:
                vermelding['bron'] = v['bron']
            if 'bewijs' in v:
                vermelding['uitleg'] = v['bewijs']
            if rij and not vermelding.get('bron'):
                vermelding['bron'] = cel(rij, 'Bron (geverifieerd)').value
            if vermelding.get('bron') and vermelding.get('uitleg'):
                bronnen[nieuw] = vermelding
        if nieuw != oud:
            gewijzigd_nl.append((sleutel, oud, nieuw))
            log.append(f'{sleutel}: "{oud}"\n      -> "{nieuw}"')
        if 'bewijs' in v:
            gewijzigd_bewijs.append(sleutel)

    # 1b. Splitsen: bibliotheek en bank/race krijgen elk een eigen tekst.
    for qid, (lib_tekst, bank_tekst, bewijs, bron) in SPLITSINGEN.items():
        nu = sel_vragen[qid][0]['original']
        rij = rijen[int(qid[1:])]
        oud_bank = cel(rij, 'Vraag NL').value
        antwoord = int(cel(rij, 'Antwoord').value)
        for q in sel_vragen[qid]:
            q['original'] = lib_tekst
        cel(rij, 'Vraag NL').value = bank_tekst
        if bewijs:
            cel(rij, 'Bewijszin').value = bewijs
        if bron:
            cel(rij, 'Bron (geverifieerd)').value = bron
        for p in race:
            for i in (1, 2, 3):
                if p[f'q{i}_label'] in (nu, oud_bank) and p[f'q{i}_answer'] == antwoord:
                    p[f'q{i}_label'] = bank_tekst
        for p in brein:
            for i in (1, 2, 3, 4):
                if p[f'q{i}']['label'] in (nu, oud_bank) and p[f'q{i}']['answer'] == antwoord:
                    p[f'q{i}']['label'] = bank_tekst
        vermelding = bronnen.pop(nu, None) or bronnen.pop(oud_bank, None) or {}
        vermelding = {'bron': bron or cel(rij, 'Bron (geverifieerd)').value or vermelding.get('bron'),
                      'uitleg': bewijs or cel(rij, 'Bewijszin').value or vermelding.get('uitleg')}
        if vermelding['bron'] and vermelding['uitleg']:
            bronnen[bank_tekst] = vermelding
        for tekst in (lib_tekst, bank_tekst):
            if tekst != oud_bank:
                gewijzigd_nl.append((qid, oud_bank, tekst))
        log.append(f'{qid} gesplitst: bibliotheek "{lib_tekst}" / bank en race "{bank_tekst}"')

    # 2. Vervangingen in de racepool
    labels_race = {p[f'q{i}_label'] for p in race for i in (1, 2, 3)}
    for pid, (pos, nr) in VERVANGINGEN.items():
        p = next(p for p in race if p['id'] == pid)
        rij = rijen[nr]
        tekst = cel(rij, 'Vraag NL').value
        antwoord = int(cel(rij, 'Antwoord').value)
        cat = cel(rij, 'Categorie').value
        assert antwoord == p[f'q{pos}_answer'], (pid, nr)
        assert tekst not in labels_race, (pid, tekst)
        andere = [i for i in (1, 2, 3) if i != pos]
        assert cat not in {p['categories'][i - 1] for i in andere}, (pid, cat)
        eenheden = {vraag_eenheid(p[f'q{i}_label']) for i in andere} - {None}
        assert vraag_eenheid(tekst) not in eenheden or vraag_eenheid(tekst) is None, (pid, tekst)
        log.append(f'{pid} positie {pos}: "{p[f"q{pos}_label"]}" -> nr{nr} "{tekst}"')
        p[f'q{pos}_label'] = tekst
        p['categories'][pos - 1] = cat
        labels_race.add(tekst)
        bron, bewijs = cel(rij, 'Bron (geverifieerd)').value, cel(rij, 'Bewijszin').value
        if tekst not in bronnen and bron and bewijs and 'bestaande bron opgehaald' not in bewijs.lower():
            bronnen[tekst] = {'bron': bron, 'uitleg': bewijs}

    # 3. Weghalen
    voor = len(race)
    race[:] = [p for p in race if p['id'] not in WEGHALEN]
    assert voor - len(race) == len(WEGHALEN)
    brein[:] = [p for p in brein if p['id'] not in BREIN_WEGHALEN]

    for regel in log:
        print(regel)
    print(f'\n{len(gewijzigd_nl)} vraagteksten, {len(gewijzigd_bewijs)} bewijszinnen, '
          f'{len(VERVANGINGEN)} racevragen vervangen, {len(WEGHALEN)} racepuzzels weg '
          f'({voor} -> {len(race)}).')

    if not schrijf:
        print('\n(proefdraai — voeg --schrijf toe om op te slaan)')
        return
    boek.save(REVIEW)
    for pad, sel in selecties.items():
        with open(pad, 'w', encoding='utf-8', newline='\n') as f:
            f.write(json.dumps(sel, ensure_ascii=False, indent=2) + '\n')
    schrijf_js('netto_race_pool.js', kop_r, glob_r, race)
    schrijf_js('netto_breinkrakers.js', kop_b, glob_b, brein)
    schrijf_js('netto_bronnen.js', kop_n, glob_n, bronnen)
    with open(os.path.join(WORTEL, 'docs', 'audit', 'vragen_audit_20261112_teksten.json'), 'w',
              encoding='utf-8', newline='\n') as f:
        json.dump([{'id': s, 'oud': o, 'nieuw': n} for s, o, n in gewijzigd_nl], f, ensure_ascii=False, indent=1)
    print('Opgeslagen.')


if __name__ == '__main__':
    main()
