"""Extra independent candidates and maximum non-overlapping packing estimate."""
import json
import re
from pathlib import Path
from collections import Counter
import numpy as np
import pandas as pd
from scipy.optimize import milp, Bounds, LinearConstraint
from scipy.sparse import lil_matrix
from legendary_search_b import EXCLUDE, SCALE, FAMILIAR, unit

ROOT=Path(__file__).resolve().parents[1]
BAD=re.compile(r'koffie.*per jaar|bloedvaten|miljard LEGO|miljard sterren|breed is de Sahara|breed is de Kalahari|aardoppervlak bestaat|tatoeages|Nederlandse betalingen|toeristenovernachtingen|schaatsbanen|rijtjeshuis|Betuweroute|Hanzelijn|melk per koe|di[ae]m[e]?ter|pH|zuurstofatomen|bestuursgebieden|windkracht 5|aardse uren duurt.*Mars|Defensie|defensie|jenever|salmanazar|methusalem|wijnfles',re.I)

def main():
    df=pd.read_excel(ROOT/'vragen/vragen_review_compleet.xlsx',sheet_name='Vragen')
    facts=[]; seen=set()
    for _,r in df.iterrows():
        q=str(r['Vraag NL'])
        try:a=int(r['Antwoord'])
        except (ValueError,TypeError):continue
        source=r.get('Bron (geverifieerd)')
        if q in seen or a<20 or EXCLUDE.search(q) or BAD.search(q) or not SCALE.search(q):continue
        if not isinstance(source,str) or not source.startswith('http'):continue
        seen.add(q)
        facts.append({'q':q,'a':a,'source':source,'category':str(r['Categorie']),'unit':unit(q),'familiar':bool(FAMILIAR.search(q))})
    by_value={}
    for n,f in enumerate(facts):by_value.setdefault(f['a'],[]).append(n)
    out=[]; triples=set()
    for i,a in enumerate(facts):
        for j,b in enumerate(facts):
            if j<=i:continue
            for op,value in [('+',a['a']+b['a']),('×',a['a']*b['a'])]:
                for k in by_value.get(value,[]):
                    if k in (i,j):continue
                    c=facts[k]; fs=[a,b,c]
                    key=tuple(sorted(f['q'] for f in fs))
                    if key in triples:continue
                    if len(set(f['category'] for f in fs))<2:continue
                    if len(set(f['unit'] for f in fs))<2:continue
                    if not any(f['familiar'] for f in fs):continue
                    if sum(f['unit']=='pct' for f in fs)>1:continue
                    if min(f['a'] for f in fs)==max(f['a'] for f in fs):continue
                    if max(f['a'] for f in fs)<500:continue
                    triples.add(key)
                    risks=['Bronnen uit bestaande bank; nog niet onafhankelijk extern gecontroleerd.','Kandidaat, geen gegarandeerd legendary-spelplezier.']
                    joined=' '.join(key).lower()
                    if re.search(r'gemiddeld|maximaal|ongeveer|kan .*wegen|kan .*slapen|schatting',joined):risks.append('Normale waarde, gemiddelde of maximum en afronding expliciet in bron/tekst controleren.')
                    if re.search(r'jaarlijks|per jaar|inwoners|zee-ijs|plastic',joined):risks.append('Peildatum en meetdefinitie controleren; veranderlijke statistiek.')
                    if re.search(r'spieren',joined):risks.append('Spieren versus spierbundels kan de bankwaarde ambigu maken; hold vóór broncontrole.')
                    out.append({'candidate_id':f'extra-b-{len(out)+1:04d}','question_texts_nl':[f['q'] for f in fs],'answers':[f['a'] for f in fs],'operator':op,'score':4 if sum(f['familiar'] for f in fs)>=2 else 3,'reason_nl':'Exacte combinatie van voorstelbare schaalvragen; minstens één breed herkenbaar onderwerp. Controleer of de overige onderwerpen echte schatruimte bieden.','risks':risks,'source_urls':[f['source'] for f in fs],'_indices':[i,j,k]})
    existing_path=ROOT/'puzzels/legendary/kandidaten_b.json'
    existing=json.loads(existing_path.read_text(encoding='utf8')) if existing_path.exists() else []
    existing_keys={tuple(sorted(p['question_texts_nl'])) for p in existing}
    out=[p for p in out if tuple(sorted(p['question_texts_nl'])) not in existing_keys]
    out.sort(key=lambda p:(-p['score'],p['candidate_id']))
    matrix=lil_matrix((len(facts),len(out)),dtype=float)
    for n,p in enumerate(out):
        for idx in p['_indices']:matrix[idx,n]=1
    result=milp(c=-np.ones(len(out)),integrality=np.ones(len(out)),bounds=Bounds(0,1),constraints=LinearConstraint(matrix.tocsc(),0,1),options={'time_limit':30,'mip_rel_gap':0})
    chosen=[p for p,x in zip(out,result.x) if x>.5]
    print('Facts:',len(facts),'candidate triples:',len(out),'largest disjoint:',len(chosen),'solver:',result.message,'upper bound:',-result.mip_dual_bound)
    public=[]
    for p in out:
        p.pop('_indices')
        public.append(p)
    (ROOT/'puzzels/legendary/extra_b.json').write_text(json.dumps(public,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    # Console only: no second output file containing unsupported quality claims.
    print('MATCH_IDS:',','.join(p['candidate_id'] for p in chosen))
    print('Distinct questions with any match:',len({q for p in out for q in p['question_texts_nl']}))
    print('Unused source questions:',len(facts)-len({q for p in out for q in p['question_texts_nl']}))
    print('Operator counts:',dict(Counter(p['operator'] for p in chosen)))

if __name__=='__main__':main()
