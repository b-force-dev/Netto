"""Independent editorial candidate search B; never changes source answers."""
import json
import math
from pathlib import Path
import re
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]

EXCLUDE = re.compile(r'welk jaar|welke eeuw|welk nummer|in welk|atoom|proton|chromos|aflevering|seizoen|hoofdstuk|symfon|verdieping|trap|kolom|provinc|landen|minister|staats|bankbiljet|letter|tafel|dagen telt|werkdag|voetbalwedstrijd|sprintafstand|zwembad|basketbalwedstrijd|speeltijd|millimeter is|seconden zitten|uur zijn|minuten zijn|jaar duurde|jaar duurt|jaar bestond|jaar zaten|jaren|hoofdstructuur|grammat|bijbel|evangel|parlement|trouwjurk|record|kaas|hamburger|taart|friet|waterballon|sampson|zeus|thumbelina|zorba|gelgi|kösen|jinlian|connery|mali|wijnfles|champagnefles|karaat|cirkel|derde|krant', re.I)
SCALE = re.compile(r'kilogram|kilometer|meter |liter|ton |seconden|minuten|dagen|uur|miljoen|miljard|procent|haar|haren|bakstenen|klinknagel|soldaten|militair|toeschouwers|eieren|spieren', re.I)
FAMILIAR = re.compile(r'vinvis|olifant|giraffe|nijlpaard|biz[oó]n|tijger|jaguar|leeuw|slak|bijenvolk|kameel|honing|rundvlees|speeksel|bloed|hart|huid|haar|haren|hers|brein|long|zuurstof|eiffeltoren|piramide|grote muur|golden gate|niagara|amazone|sahara|blitz|d-day|normandi|amerikaanse.*(leger|krijgsmacht)|big ben|koala|iss|neptunus|jupiter|mars|zon |zonne|melkweg|licht|bliksem|lego|mieren|regen|maïs|plastic|koffie|staal|bananen',re.I)

def unit(q):
    for pat, u in [('vierkante kilometer','km2'),('miljoen','million'),('miljard','billion'),('kilometer per uur','kmh'),('kilometer per seconde','kms'),('kilogram','kg'),('kilometer','km'),('centimeter','cm'),('millimeter','mm'),('meter','m'),('liter','liter'),('procent','pct'),('dagen','days'),('minuten','minutes'),('uur','hours'),('ton','ton')]:
        if pat in q.lower(): return u
    return 'count'

def main():
    frame=pd.read_excel(ROOT/'vragen/vragen_review_compleet.xlsx',sheet_name='Vragen')
    facts=[]
    seen=set()
    for _,r in frame.iterrows():
        q=str(r['Vraag NL'])
        try: answer=int(r['Antwoord'])
        except (TypeError,ValueError): continue
        if q in seen or answer<20 or EXCLUDE.search(q) or not SCALE.search(q): continue
        seen.add(q)
        source=r.get('Bron (geverifieerd)')
        if not isinstance(source,str) or not source.startswith('http'): continue
        facts.append({'q':q,'a':answer,'cat':str(r['Categorie']),'url':source,'u':unit(q),'f':bool(FAMILIAR.search(q))})
    by_value={}
    for i,f in enumerate(facts): by_value.setdefault(f['a'],[]).append(i)
    candidates=[]
    seen_triples=set()
    for i,a in enumerate(facts):
        for j,b in enumerate(facts):
            if j<=i: continue
            for op,value in [('+',a['a']+b['a']),('×',a['a']*b['a'])]:
                for k in by_value.get(value,[]):
                    if k in (i,j): continue
                    c=facts[k]; fs=[a,b,c]
                    key=tuple(sorted(f['q'] for f in fs))
                    if key in seen_triples: continue
                    if len(set(f['cat'] for f in fs))<3: continue
                    if sum(f['f'] for f in fs)<2: continue
                    if len(set(f['u'] for f in fs))<2: continue
                    if sum(f['u']=='pct' for f in fs)>1: continue
                    if max(f['a'] for f in fs)<500: continue
                    if any('Inwoners' in f['q'] for f in fs): continue
                    seen_triples.add(key)
                    score=3.0+sum(f['f'] for f in fs)*.35+(len(set(f['u'] for f in fs))==3)*.3+(op=='×')*.2
                    if any(re.search(r'kustlijn|miljard sterren|bloedvaten|spieren|wild|jaarlijks|gemiddeld|ongeveer',f['q'],re.I) for f in fs): score-=.1
                    candidates.append({'candidate_id':f'b-{len(candidates)+1:04d}','question_texts_nl':[f['q'] for f in fs],'answers':[f['a'] for f in fs],'operator':op,'score':round(min(5,score),2),'reason_nl':'Drie verschillende onderwerpen met minstens twee voorstelbare maar onzekere grootheden; de som begrenst de mogelijke schaal.','risks':['Bestaande bankbronnen overgenomen; deze zoekronde bevestigt de feiten niet extern.'],'source_urls':[f['url'] for f in fs]})
    candidates.sort(key=lambda p:(-p['score'],p['candidate_id']))
    # Deliberate editorial shortlist after reading the numerical matches. Not a
    # publication decision: source scope and precision still need source checks.
    chosen_ids = '''0003 0021 0033 0101 0215 0269 0370 0431 0437 0438 0439
    0583 0182 0115 0118 0121 0180 0267 0289 0335 0342 0024 0097 0148
    0169 0284 0287 0380 0408 0416 0432 0461 0478 0485 0490 0510 0113
    0120 0145 0146 0150 0159 0160 0174 0189 0201 0203 0213 0218 0228
    0229 0243 0256 0002 0004 0032 0147 0262 0463 0100 0268 0343 0099
    0117 0122 0155 0156 0162 0163 0167 0242 0261 0314 0171 0123 0104
    0585'''.split()
    chosen = {f'b-{s}' for s in chosen_ids}
    candidates = [p for p in candidates if p['candidate_id'] in chosen]
    priority = ['b-0269', 'b-0113', 'b-0182', 'b-0169', 'b-0123', 'b-0171']
    candidates.sort(key=lambda p:(priority.index(p['candidate_id']) if p['candidate_id'] in priority else len(priority), -p['score'],p['candidate_id']))
    for p in candidates:
        p['score'] = 4 if p['score'] >= 4.2 else 3
        labels = p['question_texts_nl']
        p['reason_nl'] = ('De combinatie vraagt een schatting van drie verschillende onderwerpen. '
            'De antwoorden variëren van '+str(min(p['answers']))+' tot '+str(max(p['answers']))+
            '; de exacte '+('vermenigvuldiging' if p['operator']=='×' else 'optelling')+
            ' laat je de schaal van je schattingen tegen elkaar afwegen. Minstens twee onderwerpen hebben geen vanzelfsprekend exact antwoord.')
        joined=' '.join(labels).lower()
        if re.search(r'gemiddeld|ongeveer|maximaal|kan .*wegen|op zijn snelst|kan .*slapen|maximaal|schatting',joined):
            p['risks'].append('Gemiddelde, maximum en normale waarde expliciet afbakenen; voorkom schijnprecisie bij variabele grootheden.')
        if re.search(r'jaarlijks|per jaar|inwoners|zee-ijs|plastic|koffie|neuronen',joined):
            p['risks'].append('Peildatum/meetdefinitie of schattingsmethode controleren; bankwaarde niet als tijdloze exacte constante behandelen.')
        if 'olifantenslurf' in joined or 'spieren bevat' in joined:
            p['risks'].append('Spieren versus spierbundels/spierfascikels controleren vóór publicatie.')
        if 'bloed pompt' in joined:
            p['risks'].append('Rondgepompt dagvolume is een afleiding uit rustdebiet, niet de hoeveelheid bloed die iemand bezit.')
    reasons = {
        'b-0269': 'Je kunt een olifant, een ruimtestation en een waterval voorstellen, maar niet vanzelf hun schaal. De 400 kilometer en 6000 kilogram laten het verbazingwekkende debiet van 2,4 miljoen liter per seconde ontstaan.',
        'b-0113': 'Een dagelijks lichaamsproces, een massief piramideblok en de bouw van de Titanic leveren drie ver uiteenliggende schalen. De vermenigvuldiging maakt van 1200 en 2500 een verrassende drie miljoen.',
        'b-0182': 'Een grote rivier, een zwaar dier en het materiaal van een beroemde toren zijn tastbaar zonder dat je hun getallen kent. De optelling 6400 + 900 = 7300 is rekenkundig eenvoudig, zodat de uitdaging in het schatten blijft.',
        'b-0169': 'Hoeveel grotgangen passen numeriek tussen de slaaptijd van een koala en het gewicht van een beroemde klok? Alle onderwerpen zijn voorstelbaar, de grootte van Mammoth Cave en Big Ben blijven verrassend.',
        'b-0123': 'Dagelijkse speekselproductie en het gewicht van een moai lopen ver uiteen, maar samen vormen ze het gewicht van Big Ben. De som helpt de schaal afwegen zonder ingewikkeld rekenen.',
        'b-0171': 'Riflengte en ISS-hoogte zijn bekende onderwerpen met onbekende afmetingen; de zware tong van een blauwe vinvis geeft de onthulling een sterk tastbaar verrassingseffect.',
    }
    for p in candidates:
        p['reason_nl'] = reasons.get(p['candidate_id'],p['reason_nl'])
    assert len(candidates)==len(chosen)
    for p in candidates:
        a,b,c=p['answers']
        assert (a+b==c if p['operator']=='+' else a*b==c)
    out=ROOT/'puzzels/legendary/kandidaten_b.json'
    out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(json.dumps(candidates,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    print(len(facts),'facts;',len(candidates),'editorial candidates')
    for n,p in enumerate(candidates[:3]):
        print(n,p['candidate_id'],p['score'],' | '.join(p['question_texts_nl']),p['answers'])

if __name__=='__main__': main()
