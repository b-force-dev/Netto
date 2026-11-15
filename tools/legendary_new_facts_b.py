"""Source-backed extra facts collected independently, before puzzle matching."""
import json
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
FACTS=[]

def rounded(value, factor=1, quantum=1):
    return int((Decimal(str(value))*Decimal(str(factor))/Decimal(str(quantum))).quantize(Decimal('1'),rounding=ROUND_HALF_UP)*Decimal(str(quantum)))

def add(key,nl,en,value,source_unit,play_unit,url,evidence,category='Wetenschap & technologie',factor=1,quantum=1,risks=None):
    FACTS.append({'id':f'new-b-{len(FACTS)+1:03d}','fact_key':key,'question_nl':nl,'question_en':en,
        'answer':rounded(value,factor,quantum),'category':category,'source_url':url,
        'source_value':value,'source_unit':source_unit,'play_unit':play_unit,
        'rounding_rule':f'Bronwaarde × {factor}; afronden op het dichtstbijzijnde veelvoud van {quantum} {play_unit} (halve waarden omhoog). Vastgelegd vóór matching.',
        'evidence_nl':evidence,'checked_on':'2026-11-15','verification':'page_read',
        'risks':risks or ['Bronwaarde is een wetenschappelijke benadering; geen exact onveranderlijk meetgetal.']})

def main():
    nasa='https://nssdc.gsfc.nasa.gov/planetary/factsheet/'
    # The NASA table was read in the web tool, not inferred from memory.
    for name,en,value in [('Mercurius','Mercury',4879),('Venus','Venus',12104),('Saturnus','Saturn',120536),('Uranus','Uranus',51118),('Neptunus','Neptune',49528),('Pluto','Pluto',2376)]:
        add(en.lower()+'_diameter_km',f'Hoeveel kilometer bedraagt de diameter van {name}, afgerond op hele kilometers?',f'How many kilometres is {en}\'s diameter, rounded to whole kilometres?',value,'km','km',nasa,f'NASA-tabel: diameter van {name} {value} km.',risks=['NASA-diameterdefinitie gebruiken; bij gas- en ijsreuzen betreft dit wolkentoppen, geen vaste grond.'])
    for name,en,value in [('de aarde','Earth',5514),('de maan','Moon',3340),('Mars','Mars',3934),('Jupiter','Jupiter',1326),('Saturnus','Saturn',687)]:
        add(en.lower()+'_mean_density_kgm3',f'Hoeveel kilogram per kubieke meter is de gemiddelde dichtheid van {name}, afgerond?',f'What is the mean density of {en} in kilograms per cubic metre, rounded?',value,'kg/m³','kg/m³',nasa,f'NASA vermeldt een gemiddelde dichtheid van {value} kg/m³.',risks=['Gemiddelde van de hele planeet of maan; niet de dichtheid van één gesteente of atmosferische laag.','Dichtheid is een minder direct voorstelbaar concept; redactioneel beoordelen.'])
    for name,en,value in [('de aarde','Earth',11.2),('Venus','Venus',10.4),('Jupiter','Jupiter',59.5),('Saturnus','Saturn',35.5),('Uranus','Uranus',21.3),('Neptunus','Neptune',23.5)]:
        add(en.lower()+'_escape_velocity_ms',f'Hoeveel meter per seconde is de ontsnappingssnelheid van {name}, ongeveer?',f'What is the escape velocity from {en} in metres per second, approximately?',value,'km/s','m/s',nasa,f'NASA geeft {value} km/s; vermenigvuldigen met duizend levert meter per seconde.',factor=1000,risks=['Ideale ontsnappingssnelheid; geen lanceersnelheid inclusief luchtweerstand of raketroute.','Bij gasreuzen is het referentieniveau de conventionele planeetgrens.'])
    for name,en,value in [('Mercurius','Mercury',4222.6),('Venus','Venus',2802.0),('de maan','the Moon',708.7)]:
        add(en.lower().replace('the ','')+'_solar_day_hours',f'Hoeveel aardse uren duurt op {name} een zonnedag van middag tot middag, afgerond?',f'How many Earth hours is a solar day from noon to noon on {en}, rounded?',value,'hours','uur',nasa,f'NASA Length of Day: {value} aardse uren.',risks=['Zonnedag is iets anders dan de rotatieduur ten opzichte van de sterren; die twee niet verwisselen.'])
    for name,en,value in [('Mercurius','Mercury',88),('Saturnus','Saturn',10747),('Uranus','Uranus',30589)]:
        add(en.lower()+'_orbital_period_days',f'Hoeveel aardse dagen duurt een volledige omloop van {name} om de zon, afgerond?',f'How many Earth days does {en} take to orbit the Sun, rounded?',value,'days','dagen',nasa,f'NASA Orbital Period: {value} dagen.',risks=['Gebruik de huidige tabeldefinitie voor de omlooptijd; andere NASA-uitgaven kunnen licht afwijken.'])
    for name,en,value in [('Mercurius','Mercury',57.9),('Venus','Venus',108.2),('Uranus','Uranus',2867)]:
        add(en.lower()+'_sun_distance_million_km',f'Hoeveel miljoen kilometer is de gemiddelde afstand van {name} tot de zon, afgerond?',f'How many million kilometres is {en}\'s mean distance from the Sun, rounded?',value,'million km','miljoen km',nasa,f'NASA Distance from Sun: {value} miljoen km.',risks=['Gemiddelde baanmaat, niet de actuele afstand op een gekozen datum.'])
    sun='https://science.nasa.gov/sun/facts/'
    add('sun_earth_mass_ratio','Hoeveel aardmassa’s zijn ongeveer nodig om de massa van de zon te evenaren?','Approximately how many Earth masses equal the mass of the Sun?',330000,'Earth masses','aardmassa’s',sun,'NASA vergelijkt de zonnemassa met ruim 330.000 aardmassa’s.',risks=['Afgeronde vergelijking; niet verwarren met de bestaande vraag over hoeveel aardvolumes in de zon passen.'])
    add('sun_corona_temperature_c','Tot ongeveer hoeveel graden Celsius kan de corona van de zon oplopen?','About how many degrees Celsius can the Sun\'s corona reach?',2000000,'°C','°C',sun,'NASA noemt voor de corona temperaturen tot ongeveer twee miljoen graden Celsius.',risks=['Corona, niet fotosfeer of kern; temperatuur varieert sterk per gebied.'])
    add('sun_galactic_orbit_million_years','Hoeveel miljoen jaar duurt een omloop van de zon rond het centrum van de Melkweg ongeveer?','About how many million years does the Sun take to orbit the centre of the Milky Way?',230,'million years','miljoen jaar',sun,'NASA noemt ongeveer 230 miljoen jaar voor een omloop om het Melkwegcentrum.')
    nps='https://www.nps.gov/seki/learn/nature/sherman.htm'
    for key,nl,en,value,u in [
        ('sherman_trunk_volume_m3','Hoeveel kubieke meter hout bevat de stam van de General Sherman-boom ongeveer?','About how many cubic metres of wood are in the General Sherman tree\'s trunk?',1486.6,'m³'),
        ('sherman_height_m','Hoeveel meter hoog is de General Sherman-boom, afgerond?','How many metres tall is the General Sherman tree, rounded?',83.8,'m'),
        ('sherman_ground_circumference_m','Hoeveel meter is de omtrek van de General Sherman-boom aan de grond, afgerond?','How many metres is the General Sherman tree\'s circumference at ground level, rounded?',31.1,'m'),
        ('sherman_crown_spread_m','Hoeveel meter bedraagt de gemiddelde kroonbreedte van de General Sherman-boom, afgerond?','How many metres is the General Sherman tree\'s average crown spread, rounded?',32.5,'m')]:
        add(key,nl,en,value,u,u,nps,f'De NPS-statistiek voor deze eigenschap geeft {value} {u}.','Natuur',risks=['Een specifieke benoemde boom; geen gemiddelde voor alle reuzensequoia’s.','Boommetingen kunnen tussen meetrondes licht veranderen.'])
    hump='https://www.fisheries.noaa.gov/species/humpback-whale'
    add('humpback_max_length_m','Hoeveel meter lang kan een bultrug ongeveer worden, afgerond?','About how many metres long can a humpback whale grow, rounded?',60,'feet','m',hump,'NOAA noemt een lengte tot ongeveer zestig voet; omrekening met 0,3048 meter per voet.','Natuur',factor=.3048,risks=['Bovengrens bij benadering; niet gemiddelde volwassen lengte.'])
    add('humpback_gestation_months','Hoeveel maanden duurt de draagtijd van een bultrug ongeveer?','About how many months is a humpback whale\'s gestation?',11,'months','maanden',hump,'NOAA beschrijft een draagtijd van ongeveer elf maanden.','Natuur')
    add('humpback_lifespan_upper_years','Tot ongeveer hoeveel jaar reikt de levensduur van een bultrug volgens NOAA?','About how many years does the upper end of a humpback whale\'s lifespan reach, according to NOAA?',90,'years, upper end of 80–90 range','jaar',hump,'NOAA geeft als levensduur ongeveer tachtig tot negentig jaar.','Natuur',risks=['Bovenkant van een gebruikelijke schattingsrange; geen bewezen individueel leeftijdsrecord.'])
    add('humpback_alaska_hawaii_trip_days','In hoeveel dagen kunnen sommige bultruggen de tocht van Alaska naar Hawaï al afleggen?','In as few as how many days can some humpback whales travel from Alaska to Hawaii?',28,'days','dagen',hump,'NOAA vermeldt dat sommige bultruggen de circa drieduizend mijl lange tocht in slechts 28 dagen afleggen.','Natuur',risks=['Voorbeeld van een snelle tocht van sommige dieren, geen universele gemiddelde reisduur.'])
    sperm='https://www.fisheries.noaa.gov/species/sperm-whale'
    add('sperm_male_max_length_m','Hoeveel meter lang kan een mannelijke potvis volgens NOAA ongeveer worden, afgerond?','About how many metres long can a male sperm whale grow, according to NOAA, rounded?',52,'feet','m',sperm,'NOAA noemt voor mannetjes circa 52 voet; omrekening met 0,3048 meter per voet.','Natuur',factor=.3048,risks=['NOAA-profielmaat voor mannetjes, geen absolute recordlengte.'])
    add('sperm_lifespan_years','Tot ongeveer hoeveel jaar kan een potvis volgens NOAA leven?','Up to about how many years can a sperm whale live, according to NOAA?',60,'years','jaar',sperm,'NOAA geeft een levensduur tot ongeveer zestig jaar.','Natuur',risks=['Levensduurschatting; geen garantie voor elk dier en geen harde biologische bovengrens.'])
    add('sperm_dive_duration_minutes','Hoeveel minuten kan een gewone diepe voedselduik van een potvis volgens NOAA duren?','How many minutes can a sperm whale\'s routine deep feeding dive last, according to NOAA?',45,'minutes','minuten',sperm,'NOAA beschrijft gebruikelijke diepe voedselduiken die 45 minuten kunnen duren.','Natuur',risks=['Dit is een gebruikelijke diepe duik, niet het maximale duikrecord.'])
    add('sperm_gestation_upper_months','Tot ongeveer hoeveel maanden duurt de draagtijd van een potvis volgens NOAA?','Up to about how many months is a sperm whale\'s gestation, according to NOAA?',16,'months, upper end of 14–16 range','maanden',sperm,'NOAA geeft voor de draagtijd een bereik van veertien tot zestien maanden.','Natuur',risks=['Bovengrens van de beschreven normale range, geen exacte vaste duur.'])
    dam='https://www.usbr.gov/projects/index.php?id=122'
    for key,nl,en,value,factor,u in [
        ('hoover_height_m','Hoeveel meter hoog is de Hooverdam vanaf de fundering, afgerond?','How many metres high is Hoover Dam from its foundation, rounded?',726.4,.3048,'ft'),
        ('hoover_crest_length_m','Hoeveel meter lang is de kruin van de Hooverdam, afgerond?','How many metres long is Hoover Dam\'s crest, rounded?',1244,.3048,'ft'),
        ('hoover_base_thickness_m','Hoeveel meter dik is de Hooverdam aan de basis, afgerond?','How many metres thick is Hoover Dam at its base, rounded?',660,.3048,'ft'),
        ('hoover_crest_width_m','Hoeveel meter breed is de kruin van de Hooverdam, afgerond?','How many metres wide is Hoover Dam\'s crest, rounded?',45,.3048,'ft')]:
        add(key,nl,en,value,u,'m',dam,f'Bureau of Reclamation vermeldt {value} voet; één voet is 0,3048 meter.','Bouw & techniek',factor=factor,risks=['Exact benoemde damafmeting; hoogte boven fundering is iets anders dan waterdiepte.'])
    add('hoover_dam_concrete_m3','Hoeveel kubieke meter beton bevat de Hooverdam zelf, afgerond op honderdduizendtallen?','How many cubic metres of concrete are in Hoover Dam itself, rounded to the nearest hundred thousand?',3250000,'cubic yards','m³',dam,'Bureau of Reclamation geeft 3,25 miljoen kubieke yard voor de dam zelf, exclusief bijbehorende werken.','Bouw & techniek',factor=.764554857984,quantum=100000,risks=['Alleen de dam: niet het hogere totaal inclusief centrale en bijkomende bouwwerken.'])
    canyon='https://home.nps.gov/grca/learn/management/statistics.htm'
    for key,nl,en,value,source_unit,play_unit,factor in [
        ('grand_canyon_max_width_km','Hoeveel kilometer breed is de Grand Canyon op het breedste punt tussen de randen, afgerond?','How many kilometres wide is the Grand Canyon at its widest rim-to-rim point, rounded?',28.8,'km','km',1),
        ('grand_canyon_average_depth_m','Hoeveel meter diep is de Grand Canyon gemiddeld volgens de NPS, ongeveer?','About how many metres deep is the Grand Canyon on average, according to the NPS?',1.6,'km','m',1000),
        ('colorado_canyon_average_width_m','Hoeveel meter breed is de Colorado gemiddeld binnen Grand Canyon National Park?','How many metres wide is the Colorado River on average within Grand Canyon National Park?',90,'m','m',1)]:
        add(key,nl,en,value,source_unit,play_unit,canyon,f'NPS Park Statistics: {value} {source_unit} voor deze afgebakende maat.','Aardrijkskunde',factor=factor,risks=['Gemiddelde of maximum zoals expliciet gevraagd; niet verwarren met bestaande maximale diepte of totale canyonlengte.'])
    add('global_ocean_average_depth_m','Hoeveel meter diep is de oceaan gemiddeld volgens NOAA, ongeveer?','About how many metres deep is the ocean on average, according to NOAA?',3682,'m','m','https://oceanservice.noaa.gov/facts/oceandepth.html','NOAA vermeldt een wereldgemiddelde oceaandiepte van ongeveer 3682 meter.','Aardrijkskunde',risks=['Wereldgemiddelde; niet de diepste plek of alleen de Pacifische Oceaan.'])
    assert len(FACTS)==50,len(FACTS)
    assert len({f['fact_key'] for f in FACTS})==len(FACTS)
    assert all(isinstance(f['answer'],int) and f['answer']>0 for f in FACTS)
    out=ROOT/'puzzels/legendary/nieuwe_feiten_b.json'
    out.write_text(json.dumps(FACTS,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    print(len(FACTS),'source-backed facts; no matching performed before rounding rules.')

if __name__=='__main__':main()
