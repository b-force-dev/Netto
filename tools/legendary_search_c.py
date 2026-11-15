"""Independent editorial search C: existing facts, exact arithmetic, scale estimation."""
from collections import Counter, defaultdict
import json
from pathlib import Path
import re
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]

# Deliberate pool of physical/scalable questions with recognizable subjects.
# Existing evidence is provenance, not a new verification of these facts.
POOL = set(map(int, '''2 3 7 8 9 12 20 31 33 34 35 37 38 43 44 45 49 59 61 62 66 69 70 71 74 80 81 82 84 95 96 110 119 128 156 157 167 168 184 186 221 225 230 231 232 233 234 235 236 237 238 253 254 255 264 265 266 267 268 269 270 271 272 273 274 288 289 290 297 298 299 300 301 302 307 308 317 318 320 323 344 345 346 352 357 358 359 360 362 363 364 365 371 374 378 383 404 407 411 412 415 434 435 437 438 439 440 441 443 444 445 448 449 450 453 456 509 510 511 521 522 523 525 530 534 546 570 572 574 605 607 609 612 635 636 643 644 645 646 647 648 649 650 651 652 654 655 656 657 658 665 671 690 691 710 712 720 721 774 778 779 780 783 784 785 786 791 792 793 794 796 797 798 799 801 802 803 815 817 818 849 852 854 855 859 860 862 863 865 866 867 868 869 870 929 930 931 932 933 934 935 936 937 939 942 943 944 945 947 949 950 959 960 977 978 979 980 981 982 984 991 992 1001 1006 1009 1010 1011 1012 1020 1022 1062 1074 1075 1076 1078 1079 1080 1081 1082 1083 1084 1090 1091 1096 1098 1138 1181 1183 1184 1185 1186 1189 1193 1196 1197 1208 1213 1214 1215 1217 1219 1221 1229 1230 1231 1249 1250 1297 1298 1300 1302 1306 1307 1308 1309 1311 1313 1314 1316 1317 1336 1426 1427 1428 1429 1432 1433 1439 1441 1442 1444 1455 1487 1488'''.split()))

def group(text):
    t = text.lower()
    # Avoid duplicate species/landmark variants and especially same-landmark triples.
    for term in ('eiffeltoren', 'empire state', 'golden gate', 'chinese muur', 'grote muur',
                 'everest', 'vinvis', 'olifant', 'piramide', 'koe', 'big ben', 'suez',
                 'iss', 'noordzee', 'sahara', 'victoria', 'baikal', 'congo', 'kongo'):
        if term in t:
            return term
    return text

def main():
    frame = pd.read_excel(ROOT / 'vragen/vragen_review_compleet.xlsx', sheet_name='Vragen')
    rows, used_groups = [], set()
    for _, r in frame.iterrows():
        if int(r['Nr']) not in POOL:
            continue
        question = str(r['Vraag NL'])
        g = group(question)
        if g in used_groups:
            continue
        answer = r['Antwoord']
        source = r['Bron (geverifieerd)']
        if not pd.notna(source) or not float(answer).is_integer() or answer <= 1:
            continue
        used_groups.add(g)
        rows.append(dict(id=int(r['Nr']), text=question, answer=int(answer),
                         category=str(r['Categorie']), source=str(source), group=g))
    by_value = defaultdict(list)
    for r in rows:
        by_value[r['answer']].append(r)
    found = []
    seen = set()
    for a in rows:
        for b in rows:
            if a['id'] >= b['id']:
                continue
            for op, value in (('+', a['answer'] + b['answer']), ('×', a['answer'] * b['answer'])):
                for c in by_value.get(value, []):
                    triple = (a, b, c)
                    if len({r['id'] for r in triple}) != 3 or len({r['category'] for r in triple}) != 3:
                        continue
                    if len({r['answer'] for r in triple}) != 3:
                        continue
                    signature = (op, tuple(sorted(r['id'] for r in triple)))
                    if signature in seen:
                        continue
                    seen.add(signature)
                    # Every pool member is a plausible scale question. Reward broad interest,
                    # two substantial uncertain answers and multiplication across scales.
                    score = 3.0 + (0.5 if op == '×' else 0)
                    if min(r['answer'] for r in triple) >= 50:
                        score += .4
                    if max(r['answer'] for r in triple) >= 10000:
                        score += .3
                    if sum(bool(re.search('ongeveer|gemiddeld|schatting|maximaal', r['text'], re.I)) for r in triple) >= 2:
                        score += .2
                    if any(re.search('ton .*produce|ton .*wereld|miljoen inwoners|hoeveel procent', r['text'], re.I) for r in triple):
                        score -= .4
                    if any(re.search('Nederland|Rotterdam|Hanzelijn|Betuweroute|HSL-Zuid|Lind(t|l)', r['text'], re.I) for r in triple):
                        score -= .3
                    found.append((score, triple, op))
    found.sort(key=lambda x: (-x[0], tuple(r['id'] for r in x[1])))
    # Spread subject exposure; identical facts may be reused at most three times.
    chosen, uses, pairs = [], Counter(), Counter()
    for ceiling in (2, 3):
        for score, triple, op in found:
            ids = tuple(r['id'] for r in triple)
            signature = (op, tuple(sorted(ids)))
            if signature in {x[0] for x in chosen}:
                continue
            if any(uses[i] >= ceiling for i in ids):
                continue
            pairkeys = [tuple(sorted((ids[i],ids[j]))) for i,j in ((0,1),(0,2),(1,2))]
            if any(pairs[k] for k in pairkeys):
                continue
            chosen.append((signature, score, triple, op))
            uses.update(ids)
            pairs.update(pairkeys)
            if len(chosen) >= 80:
                break
        if len(chosen) >= 80:
            break
    output = []
    for n, (_, score, triple, op) in enumerate(chosen, 1):
        risks = ['Bronnen en bestaande antwoorden overgenomen uit reviewbank; niet opnieuw extern geverifieerd.',
                 'Schaal, peildatum, gemiddelde of maximum en afronding vóór publicatie broninhoudelijk controleren.']
        if any(re.search('produce|wereldwijd|per jaar|jaarlijks|inwoners', r['text'], re.I) for r in triple):
            risks.append('Veranderlijke statistiek: expliciete peildatum vereist; geen tijdloze claim.')
        if any(re.search('per seconde|per uur|hoogste|record|maximaal', r['text'], re.I) for r in triple):
            risks.append('Snelheid, piek of record is gevoelig voor meetdefinitie en conditie.')
        output.append(dict(candidate_id=f'C-{n:03}', question_texts_nl=[r['text'] for r in triple],
                           answers=[r['answer'] for r in triple], operator=op,
                           score=round(min(score,5),1),
                           reason_nl='Drie voorstelbare onderwerpen uit verschillende categorieën. De schaal van minstens twee antwoorden moet worden geschat; het verband laat je een te grote of te kleine inschatting bijstellen.',
                           risks=risks, source_urls=[r['source'] for r in triple],
                           bank_ids=[r['id'] for r in triple]))
    # Explicit editorial pass after reading all eighty proposals, not just a
    # numerical ranking. Weak proposals stay visible as reserves, never promoted
    # to "legendary" merely to fill a quota.
    reserve = {4,6,7,9,10,14,19,20,26,28,31,32,34,35,44,49,50,51,62,64,75,79}
    favourites = {
        8: 'Speeksel per dag, een duikende potvis en Niagara zijn drie levendige beelden. De stap van milliliters naar miljoenen liters geeft een sterke onthulling; alle drie zijn zonder rekenverband lastig nauwkeurig te schatten.',
        13: 'De door de gebruiker gekozen referentie: rivierlengte, blokgewicht en miljoenen militairen hebben elk een voorstelbare schaal maar geen vanzelfsprekend antwoord. Twee plausibele schattingen begrenzen de derde.',
        16: 'Een enorme hond, een kruipende slak en een massief stenen beeld geven drie tastbare schatbeelden. De slakkensnelheid in meter per uur is verrassend; beeldgewicht kan gemakkelijk een factor drie verkeerd worden geschat.',
        23: 'Een absurd lange gamemarathon, een slak en de dagelijkse hoeveelheid rondgepompt bloed geven drie sterke onthullingen. Duur en snelheid kunnen het moeilijk voorstelbare bloedvolume ontsluiten.',
        30: 'Breinneuronen, cheetahsnelheid en een lichtjaar combineren drie verschillende schalen. Het gebruik van miljarden is expliciet maar vraagt zorgvuldige eenheden; geen van de drie is een triviale telvraag.',
        40: 'Een fabriek die LEGO-steentjes uitspuugt, dagelijkse speekselproductie en een piramideblok zijn direct voorstelbaar. De getallen liggen dicht genoeg voor optellen maar zijn onafhankelijk onzeker.',
        48: 'Mayflower-reis, de oudste kat en een lange rivier geven drie verschillende schatstrategieën. De kat is een licht anker, terwijl de rivierlengte aanzienlijk moeilijker te benaderen is.',
        57: 'Watervalhoogte, een uitzonderlijk lange persoon en geluidssnelheid laten drie visuele/alledaagse referenties botsen. De persoon biedt houvast zonder de waterval en snelheid meteen te verraden.',
        68: 'Wolkenkrabber, gamemarathon en honderden kilometers ondergrondse gangen leveren herkenbare beelden op. Het grottenstelsel is de verrassende schaal die door de andere twee beter te schatten wordt.',
        70: 'Een beroemde wolkenkrabber, stormwindsnelheid en Michelangelo’s David zijn voorstelbaar en niet vanzelf exact bekend. Vooral het beeld in centimeters kan spelers flink verrassen.',
        72: 'Uitgegraven aarde, een tijger en de Dode Zee zijn breed voorstelbaar. Het Panamakanaalvolume is lastig maar de andere twee begrenzen het; schaaleenheid miljoen m³ moet extra duidelijk zijn.',
        76: 'Draagtijd, vliegtuiglengte en tijgergewicht geven drie concrete mentale beelden. Geen rond cijfer verklapt de som; een goede schatting van twee grootheden scherpt de derde aan.',
    }
    for p in output:
        n = int(p['candidate_id'].split('-')[1])
        p['editorial_review'] = 'reserve' if n in reserve else 'candidate'
        if n in reserve:
            p['score'] = 2.5
            p['risks'].append('Redactionele reserve: te veranderlijk, arbitrair, lokaal of minder sterk houvast; alleen opnemen na extra beoordeling.')
        elif n in favourites:
            p['score'] = 5 if n in (8,13,70) else 4.5
            p['reason_nl'] = favourites[n]
    output.sort(key=lambda p: (-p['score'],p['candidate_id']))
    path = ROOT / 'puzzels/legendary/kandidaten_c.json'
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(output, ensure_ascii=False, indent=2)+'\n',encoding='utf8')
    print(f'{len(rows)} scale facts; {len(found)} exact candidates; {len(output)} diverse proposals')
    for p in output[:12]:
        print(p['candidate_id'], p['score'], p['answers'], p['operator'], ' / '.join(p['question_texts_nl']))

if __name__ == '__main__':
    main()
