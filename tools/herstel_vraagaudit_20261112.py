"""Gerichte vervolgstap; behoud puzzel-id's, antwoorden, foto's en website/.

Pas toe na het historische checkpoint eb50086. De eerste auditstap is geen
idempotente migratie; deze vervolgstap wel. Engelse invoer is redactioneel
vastgelegd naast het auditverslag. Geen online vertaaldienst nodig.
"""
import json
from pathlib import Path
import openpyxl
from corrigeer_vragen_20261112 import CORRECTIES
from verwerk_vertalingen import lees_tsv

ROOT = Path(__file__).resolve().parents[1]


def read(name):
    text = (ROOT / 'data' / name).read_text(encoding='utf8')
    pos = text.index('=', text.index('window.')) + 1
    return text[:pos], json.loads(text[pos:].strip().rstrip(';'))


def write(name, header, data):
    if name == 'netto_translations_en.js':
        (ROOT / 'data' / name).write_text(header + ' ' + json.dumps(data, ensure_ascii=False, indent=2) + ';\n', encoding='utf8')
        return
    (ROOT / 'data' / name).write_text(header + ' ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n', encoding='utf8')


# old -> (new NL, new EN, evidence NL, evidence EN, source)
FIXES = {
    'Hoeveel beelden staan er op de top van de Brandenburger Tor?': (
        'Hoeveel paarden en godinnen beeldt de quadriga op de Brandenburger Tor samen uit?',
        'How many horses and goddesses together are depicted in the Brandenburg Gate quadriga?',
        'De quadriga beeldt vier paarden en de godin Victoria uit: samen vijf figuren.',
        'The quadriga depicts four horses and the goddess Victoria: five figures in total.',
        'https://www.berlin.de/en/attractions-and-sights/3560266-3104052-brandenburg-gate.en.html'),
    'Hoeveel meter sprintt een schaatser op de kortebaan-afstand?': (
        'Hoeveel meter is de kortste individuele olympische langebaanschaatsafstand?',
        'How many metres is the shortest individual Olympic long-track speed skating distance?',
        'De kortste individuele olympische afstand bij langebaanschaatsen is 500 meter.',
        'The shortest individual Olympic long-track speed skating distance is 500 metres.',
        'https://www.isu-skating.com/en/speed-skating/events/isu-championships/'),
    'In welk jaar reed de eerste auto met een verbrandingsmotor?': (
        'In welk jaar vroeg Carl Benz patent aan op zijn driewielige Motorwagen?',
        'In which year did Carl Benz apply for the patent for his three-wheeled Motorwagen?',
        'Carl Benz vroeg op 29 januari 1886 patent aan voor zijn Motorwagen.',
        'Carl Benz applied for the Motorwagen patent on 29 January 1886.',
        'https://group.mercedes-benz.com/company/tradition/company-history/1885-1886.html'),
    'Hoe lang duurde de langste plank ooit in minuten?': (
        'Hoeveel minuten duurde de recordplank van Josef Šálek in mei 2023, afgerond?',
        'How many minutes did Josef Šálek hold his record plank in May 2023, rounded?',
        'Šálek hield op 20 mei 2023 de plank 9 uur, 38 minuten en 47 seconden vol: afgerond 579 minuten.',
        'Šálek held the plank for 9 hours, 38 minutes and 47 seconds on 20 May 2023, rounding to 579 minutes.',
        'https://www.guinnessworldrecords.com/news/2023/5/mans-incredible-physical-feat-as-he-holds-abdominal-plank-for-almost-10-hours-750261'),
    'Hoeveel push-ups werden er in 24 uur uitgevoerd bij het huidige record?': (
        'Hoeveel push-ups deed Charles Servizio in 24 uur in april 1993, afgerond op duizendtallen?',
        'How many push-ups did Charles Servizio do in 24 hours in April 1993, rounded to the nearest thousand?',
        'Servizio deed op 24–25 april 1993 46.001 push-ups: afgerond 46.000.',
        'Servizio did 46,001 push-ups on 24–25 April 1993, rounding to 46,000.',
        'https://www.guinnessworldrecords.com/world-records/most-push-ups-in-24-hours'),
    'Hoe lang was de langste hotdog ooit in meters?': (
        'Ruim hoeveel meter lang was de recordhotdog van Novex in Paraguay in 2011?',
        'Just over how many metres long was Novex\'s record hot dog in Paraguay in 2011?',
        'De hotdog van Novex uit 2011 mat 203,80 meter: ruim 203 meter.',
        'The Novex hot dog made in 2011 measured 203.80 metres, just over 203 metres.',
        'https://www.guinnessworldrecords.com/world-records/longest-hot-dog'),
    'Hoeveel metrolijnen heeft de New York City Subway?': (
        'Hoeveel fysieke spoorlijnen telt de New York City Subway volgens de gangbare indeling?',
        'How many physical rail lines make up the New York City Subway under the usual classification?',
        'De gebruikelijke indeling telt 36 fysieke spoorlijnen. Dit zijn niet de letter- en nummerdiensten op de kaart.',
        'The usual classification counts 36 physical rail lines, distinct from the lettered and numbered train services.',
        'https://en.wikipedia.org/wiki/List_of_New_York_City_Subway_lines'),
    'Hoeveel meter breed mag een internationaal voetbalveld maximaal zijn?': (
        'Hoeveel meter breed mag een voetbalveld maximaal zijn buiten internationale wedstrijden?',
        'How many metres wide may a football pitch be at most outside international matches?',
        'Buiten internationale wedstrijden is de maximale breedte 90 meter; internationaal is het 75 meter.',
        'Outside international matches the maximum width is 90 metres; for international matches it is 75 metres.',
        'https://theifab.com/laws/latest/the-field-of-play/'),
    'Hoeveel megabytes zitten er volgens de binaire definitie in één gigabyte?': (
        'Hoeveel mebibytes (MiB) zitten er in één gibibyte (GiB)?',
        'How many mebibytes (MiB) are in one gibibyte (GiB)?',
        'Een GiB is 2³⁰ bytes; een MiB is 2²⁰ bytes. De verhouding is 1024.',
        'A GiB is 2³⁰ bytes and a MiB is 2²⁰ bytes, giving a ratio of 1,024.',
        'https://physics.nist.gov/cuu/Units/binary.html'),
    'Hoeveel discipelen had Jezus volgens de Bijbel?': (
        'Hoeveel apostelen koos Jezus volgens de evangeliën?',
        'How many apostles did Jesus choose according to the Gospels?',
        'Volgens de evangeliën koos Jezus twaalf apostelen uit zijn grotere groep volgelingen.',
        'According to the Gospels, Jesus chose twelve apostles from his larger group of followers.',
        'https://en.wikipedia.org/wiki/Apostles_in_the_New_Testament'),
    'Hoeveel procent van het Amazonebekken ligt ongeveer in Brazilië?': (
        'Hoeveel procent van het Amazoneregenwoud ligt ongeveer in Brazilië?',
        'Approximately what percentage of the Amazon rainforest is in Brazil?',
        'Ongeveer zestig procent van het Amazoneregenwoud ligt in Brazilië; regenwoud en stroomgebied zijn verschillende gebieden.',
        'Approximately sixty percent of the Amazon rainforest lies in Brazil; the forest and drainage basin are different areas.',
        'https://en.wikipedia.org/wiki/Amazon_rainforest'),
    'Hoeveel mensen dienden in totaal in het Amerikaanse leger tijdens de Tweede Wereldoorlog?': (
        'Hoeveel mensen dienden in de Amerikaanse strijdkrachten tijdens de Tweede Wereldoorlog, afgerond op miljoenen?',
        'How many people served in the US armed forces during World War II, rounded to millions?',
        'Ruim zestien miljoen Amerikanen dienden tijdens de Tweede Wereldoorlog in alle krijgsmachtdelen samen.',
        'Over sixteen million Americans served across all branches of the armed forces during World War II.',
        'https://www.nationalww2museum.org/war/wwii-veteran-statistics'),
    'Hoeveel miljoen inwoners heeft China volgens de VN-schatting voor 2025?': (
        'Hoeveel miljoen inwoners had China volgens de VN-schatting voor 2025, afgerond?',
        'How many million people lived in China according to the UN estimate for 2025, rounded?',
        'UNData vermeldt 1.416.096 duizend inwoners voor 2025: afgerond 1416 miljoen.',
        'UNData lists 1,416,096 thousand inhabitants for 2025, rounding to 1,416 million.',
        'https://data.un.org/en/iso/CN.html'),
    'Hoeveel meter ligt de Dode Zee ongeveer onder zeeniveau?': (
        'Hoeveel meter onder zeeniveau lag de waterspiegel van de Dode Zee op 1 juli 2026?',
        'How many metres below sea level was the Dead Sea surface on 1 July 2026?',
        'De Israëlische waterautoriteit vermeldt voor 1 juli 2026 een waterstand van −441 meter.',
        'The Israel Water Authority lists a water level of −441 metres on 1 July 2026.',
        'https://www.gov.il/he/pages/dead_sea_report'),
    'Hoeveel winkels heeft Lidl wereldwijd ongeveer?': (
        'Hoeveel winkels had Lidl wereldwijd in september 2026?',
        'How many stores did Lidl have worldwide in September 2026?',
        'Lidl opende in september 2026 zijn 13.000e winkel.',
        'Lidl opened its 13,000th store in September 2026.',
        'https://unternehmen.lidl.de/pressemitteilungen/2026/260903_13.000-filiale-raunheim'),
    'Hoeveel kilometer lang is de langste grot ter wereld, Mammoth Cave, ongeveer?': (
        'Hoeveel kilometer gekarteerde gangen had Mammoth Cave volgens de NPS in 2024 ongeveer?',
        'Approximately how many kilometres of mapped passages did Mammoth Cave have according to the NPS in 2024?',
        'De National Park Service vermeldt 426 mijl, ongeveer 685 kilometer aan gekarteerde gangen.',
        'The National Park Service lists 426 miles, approximately 685 kilometres of mapped passages.',
        'https://www.nps.gov/maca/learn/management/statistics.htm'),
}


def main():
    changes = json.loads((ROOT / 'docs/audit/vragen_audit_20261112_teksten.json').read_text(encoding='utf8'))
    labels = (ROOT / 'docs/audit/vragen_audit_20261112_en.txt').read_text(encoding='utf8').splitlines()
    assert len(labels) == len(changes)
    th, translations = read('netto_translations_en.js')
    eh, english = read('netto_bronnen_en.js')
    for change, label in zip(changes, labels):
        translations[change['nieuw']] = label
    en_by_id = lees_tsv(ROOT / 'docs/audit/vragen_audit_20261112_bewijs_en.tsv')
    for qid, correction in CORRECTIES.items():
        if 'bewijs' in correction:
            assert qid in en_by_id, qid
            english[correction['bewijs']] = en_by_id[qid]
    # The six splits have their own evidence as well as their own keys.
    english['In 2025 gebruikten 20 van de 27 EU-lidstaten de euro; Bulgarije volgde op 1 januari 2026.'] = 'In 2025, twenty EU member states used the euro; Bulgaria followed on 1 January 2026.'
    english['De lederschildpad die in 1988 bij Harlech aanspoelde, woog volgens het National Museum Wales 916 kilo. Guinness World Records noemt 961 kilo.'] = 'National Museum Wales reports 916 kilograms for the leatherback found at Harlech in 1988; Guinness reports 961 kilograms.'
    english['Een veelgebruikte schatting is dat alle bloedvaten van een volwassene samen zo’n 100.000 kilometer lang zijn.'] = 'A widely quoted estimate gives the combined length of an adult\'s blood vessels as approximately 100,000 kilometres.'
    english['Het ISS draait met ongeveer 27.600 kilometer per uur om de aarde.'] = 'The ISS orbits Earth at approximately 27,600 kilometres per hour.'

    nh, sources = read('netto_bronnen.js')
    rh, race = read('netto_race_pool.js')
    bh, brain = read('netto_breinkrakers.js')
    book = openpyxl.load_workbook(ROOT / 'vragen/vragen_review_compleet.xlsx')
    sheet = book['Vragen']; columns = {c.value:c.column for c in sheet[1]}
    # The bank and the curated series deliberately use different answers.
    # Preserve each value, but distinguish the corresponding dates/scopes.
    for row in range(2, sheet.max_row + 1):
        qcell = sheet.cell(row, columns['Vraag NL']); answer = sheet.cell(row, columns['Antwoord']).value
        if sheet.cell(row, columns['Nr']).value == 1308:
            sheet.cell(row, columns['Antwoord']).value = 669
            qcell.value = 'Hoeveel kilogram woog de recordportie friet in Boise op 2 oktober 2026, afgerond?'
            evidence = 'De portie friet woog 668,6 kilogram: afgerond 669 kilogram.'
            sheet.cell(row, columns['Bewijszin']).value = evidence
            url = 'https://www.guinnessworldrecords.com/world-records/largest-serving-of-chips-fries'
            sheet.cell(row, columns['Bron (geverifieerd)']).value = url
            sources[qcell.value] = {'bron':url,'uitleg':evidence}
            translations[qcell.value] = 'How many kilograms did the record serving of fries in Boise on 2 October 2026 weigh, rounded?'
            english[evidence] = 'The serving of fries weighed 668.6 kilograms, rounding to 669 kilograms.'
        if qcell.value == 'Hoeveel studioalbums met nieuw werk had Taylor Swift eind 2025 uitgebracht?' and answer == 11:
            new = 'Hoeveel studioalbums met nieuw werk had Taylor Swift eind 2024 uitgebracht?'
            translations[new] = 'How many original studio albums had Taylor Swift released by the end of 2024?'
            evidence = 'Eind 2024 had Taylor Swift elf studioalbums uitgebracht, zonder de heropnames.'
            english[evidence] = 'By the end of 2024, Taylor Swift had released eleven studio albums, excluding rerecordings.'
            old = qcell.value; qcell.value = new
            sheet.cell(row, columns['Bewijszin']).value = evidence
            for p in race:
                for i in (1,2,3):
                    if p[f'q{i}_label'] == old and p[f'q{i}_answer'] == 11:p[f'q{i}_label'] = new
            for p in brain:
                for i in (1,2,3,4):
                    if p[f'q{i}']['label'] == old and p[f'q{i}']['answer'] == 11:p[f'q{i}']['label'] = new
            sources[new] = {'bron':sheet.cell(row, columns['Bron (geverifieerd)']).value,'uitleg':evidence}
        if qcell.value in FIXES:
            old = qcell.value; new,nlen,nl,en,url = FIXES[old]
            # The bank's old Dead Sea answer (430) refers to a different date.
            if old.startswith('Hoeveel meter ligt de Dode Zee') and answer != 441:
                continue
            qcell.value = new
            sheet.cell(row, columns['Bewijszin']).value = nl
            sheet.cell(row, columns['Bron (geverifieerd)']).value = url
    book.save(ROOT / 'vragen/vragen_review_compleet.xlsx')
    # No rounding convention can turn the verified 668.6 kg into 1000 kg.
    # Retire only affected random-pool puzzles, retaining all other IDs.
    bad = 'Hoe zwaar was de grootste portie friet ooit in kilogram?'
    race[:] = [p for p in race if all(p[f'q{i}_label'] != bad for i in (1,2,3))]
    brain[:] = [p for p in brain if all(p[f'q{i}']['label'] != bad for i in (1,2,3,4))]
    for old, (new,en,nl,een,url) in FIXES.items():
        translations[new] = en; english[nl] = een
        sources[new] = {'bron':url,'uitleg':nl}
        for p in race:
            for i in (1,2,3):
                if p[f'q{i}_label'] == old and not (old.startswith('Hoeveel meter ligt de Dode Zee') and p[f'q{i}_answer'] != 441):p[f'q{i}_label'] = new
        for p in brain:
            for i in (1,2,3,4):
                if p[f'q{i}']['label'] == old and not (old.startswith('Hoeveel meter ligt de Dode Zee') and p[f'q{i}']['answer'] != 441):p[f'q{i}']['label'] = new
    aliases = changes + [{'id':'vervolg', 'oud':old, 'nieuw':v[0]} for old,v in FIXES.items()]
    (ROOT / 'docs/audit/vragen_audit_20261112_aliases.json').write_text(json.dumps(aliases,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    for mode in ('library','connection'):
        path = ROOT / f'puzzels/{mode}_selectie_20260927.json'
        selection = json.loads(path.read_text(encoding='utf8'))
        for p in selection['puzzles']:
            for q in p['questions']:
                old = q['original']
                if old in FIXES:
                    q['original'],q['question'],q['evidence'],_,q['source'] = FIXES[old]
                q['question'] = translations.get(q['original'],q['question'])
                if q['evidence'] == 'Bestaande bron opgehaald; het antwoord staat op de pagina.':
                    evidence = {'q149':('Een dromedaris heeft één bult.','A dromedary has one hump.'),
                                'q503':('Bij voetbal staan normaal elf spelers per team op het veld.','In association football, each team normally fields eleven players.'),
                                'q398':('Een standaard moderne piano heeft 88 toetsen.','A standard modern piano has 88 keys.'),
                                'q432':('De NAVO had twaalf oprichtende lidstaten in 1949.','NATO had twelve founding member states in 1949.')}[q['id']]
                    q['evidence'] = evidence[0]; english[evidence[0]] = evidence[1]
                elif q['evidence'] not in english:
                    # These curated additions already contain English source
                    # sentences. Register them explicitly for coverage checks.
                    assert q['evidence'].startswith(('Plimoth','Berlin','NASA:','Guinness','BAE','Official Visit','European Parliament','London Museum','Mars completes','Together, Voyager','FIFA','United Nations:','Minecraft Education:','National Park Service:','U.S. Federal Aviation'))
                    english[q['evidence']] = q['evidence']
        path.write_text(json.dumps(selection,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    for name,h,obj in [('netto_translations_en.js',th,translations),('netto_bronnen_en.js',eh,english),('netto_bronnen.js',nh,sources),('netto_race_pool.js',rh,race),('netto_breinkrakers.js',bh,brain)]:write(name,h,obj)


if __name__ == '__main__':main()
