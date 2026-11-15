import pandas as pd, re, json, math, itertools
from pathlib import Path
root=Path(__file__).resolve().parents[1]
d=pd.read_excel(root/'vragen/vragen_review_compleet.xlsx',sheet_name='Vragen')
rows=[]
exclude=r'in welk jaar|welk jaar|atoom|chromosom|hoofdstuk|aflevering|seizoen|symfon|elementen|boeken|letter|provinc|landen|buurland|eilanden|lidstat|senator|parlement|zetel|kiesman|gebod|sterrenbeeld|wereldwonder|medaille|grammat|facetten|snaren|tanden|botten|proton|elektron|neutron|eerste.*uitgevonden|voor Christus|na Christus|maanden heeft|dagen telt|minuten.*uur|seconden.*minuut|cent.*euro|dobbel|schaak|poker|kaartspel|domino|Roulette|periodiek|honderd|dozijn|gross|pi decimaal|constante|cijfers|bijbel|Torah|Koran|sura|thes|lettergrep|strof|strepen|kleur|punt.*waard|armen|poten|harten|ogen|oren|vleugel|vinger|teen|tentakel'
physical=r'kilogram|kilo |gram |ton |tonnen|meter|liter|uur|seconde|dagen|dagen |weken|jaar oud|oud werd|haren|haartjes|neuronen|bloed|eieren|eitjes|bezoekers|inwoner|toerist|miljoen|miljard|soldat|militair|huizen|bakstenen|klinknagel|steentjes|stap|trap|treden|hertz|graden|procent|percentage|kamers|kamertjes|passagier'
for _,r in d.iterrows():
 q=str(r['Vraag NL']); a=r['Antwoord']; src=r['Bron (geverifieerd)']
 try:a=float(a)
 except:continue
 if not a.is_integer() or a<=1:continue
 if re.search(exclude,q,re.I) or not re.search(physical,q,re.I):continue
 if not isinstance(src,str) or not src.startswith('http'):continue
 rows.append({'id':int(r['Nr']),'q':q,'a':int(a),'cat':str(r['Categorie']),'src':src,'evidence':str(r['Bewijszin'])})
# Dedupe exact NL
rows=list({r['q']:r for r in rows}.values())
print('POOL',len(rows))
by={}
for r in rows:by.setdefault(r['a'],[]).append(r)
candidates=[];seen=set()
for a,b in itertools.combinations(rows,2):
 if a['cat']==b['cat']:continue
 for op,n in [('+',a['a']+b['a']),('−',a['a']-b['a']),('×',a['a']*b['a']),('÷',a['a']//b['a'] if a['a']%b['a']==0 else 0)]:
  aa,bb=a,b
  if op=='−' and n<0:aa,bb=b,a;n=-n
  for c in by.get(n,[]):
   if c['cat'] in [aa['cat'],bb['cat']] or c['id'] in [aa['id'],bb['id']]:continue
   key=tuple(sorted([aa['q'],bb['q'],c['q']]))
   if key in seen:continue
   seen.add(key)
   rs=[aa,bb,c]; vals=[x['a'] for x in rs]
   # Reward all three genuinely sizable/scale estimates, varied topic types.
   score=sum(min(4,math.log10(x)) for x in vals)
   score+=2 if min(vals)>=20 else 0
   score+=1 if op in ['×','÷'] else 0
   # approximate has necessary caveat, but not punish hard scales
   score-=sum(bool(re.search('record|grootste|zwaarste|langste',x['q'],re.I)) for x in rs)*.5
   candidates.append({'rs':rs,'op':op,'rank':score})
candidates.sort(key=lambda x:-x['rank'])
(root/'puzzels/legendary').mkdir(parents=True,exist_ok=True)


import json,collections,re
from pathlib import Path
root=Path(__file__).resolve().parents[1]

allowed=set(map(int,'''3 7 8 9 11 12 18 20 22 23 24 31 33 34 37 38 43 44 45 59 66 69 70 71 80 81 82 84 95 110 114 119 128 156 157 168 184 185 186 223 224 225 227 230 231 232 233 236 237 238 246 247 253 255 264 265 266 268 271 272 273 274 288 289 290 291 298 299 300 301 307 308 320 330 331 332 333 334 344 345 346 357 358 359 362 363 364 371 379 401 403 404 411 415 434 435 436 437 438 440 441 443 444 445 447 449 450 456 467 468 509 510 511 521 522 523 525 530 534 546 570 571 572 574 605 607 612 635 636 639 643 644 645 646 647 648 649 650 651 652 653 654 655 656 657 658 660 665 686 687 690 691 707 712 718 774 778 782 783 784 785 787 789 792 793 794 796 797 798 799 802 803 812 815 838 849 852 854 855 859 860 862 863 865 866 870 929 930 932 933 934 935 936 937 943 944 945 946 947 948 951 952 978 979 982 986 991 992 1001 1006 1019 1020 1022 1060 1062 1074 1075 1076 1081 1090 1091 1135 1138 1297 1298 1300 1306 1308 1309 1313 1314 1315 1316 1317 1427 1432 1439 1442 1444 1445 1455 1487 1488 1489 1490'''.split()))
# Human selection preference: tangible biology/engineering/nature scales over industrial totals.
star={8,110,114,119,156,168,225,227,264,271,288,308,345,450,523,605,607,612,639,644,654,658,665,686,691,783,1019,1135,1445}

import sys

if '--tiers' in sys.argv:
 from scipy.optimize import milp, Bounds, LinearConstraint
 from scipy.sparse import coo_matrix, vstack
 import numpy as np
 from urllib.parse import urlsplit, unquote
 allowed.add(1011)  # User-selected flagship fact: US WWII armed forces, not casualties.
 normal=set(map(int, "10 56 58 60 75 76 77 78 79 99 106 107 109 113 115 116 117 120 122 123 131 134 136 139 145 148 150 151 152 159 163 164 165 166 167 177 183 187 192 193 194 198 201 203 204 205 212 216 239 240 241 243 245 260 263 276 285 287 292 295 296 311 318 322 335 349 350 373 391 393 398 408 427 430 433 460 465 466 476 480 485 490 493 503 506 507 513 517 519 606 609 661 662 663 664 755 761 762 973 993 996 997 999 1061 1101 1136 1137 1261 1262 1263 1288 1318 1323 1330 1331 1334 1335 1337 1338 1339 1349 1352 1353 1354 1373 1377 1379 1381 1384 1385 1386 1387 1391 1392 1396 1398 1399 1401 1402 1404 1405 1406 1408 1409 1410 1413 1414 1420 1421 1424 1425 1433 1434 1447 1453 1454 1456 1484 1485 1491 1496 1507 1510 1552 1553 1555 1556 1564 1565 1566 1567 1568 1569 1576 1577 1578 1579 1595 1596 1597 1598".split()))
 pool=[]
 for _,r in d.iterrows():
  try:nr=int(r['Nr']);a=float(r['Antwoord'])
  except:continue
  if nr not in allowed|normal or not a.is_integer() or a<=1:continue
  src=r['Bron (geverifieerd)']
  if not isinstance(src,str) or not src.startswith('http'):continue
  q=str(r['Vraag NL'])
  pool.append({'id':nr,'q':q,'a':int(a),'cat':str(r['Categorie']),'src':src,'evidence':str(r['Bewijszin']),'quality':'strong' if nr in allowed else 'normal','quality_reason':'Fysieke/schaalvraag met een voorstelbaar onderwerp en onzeker antwoord.' if nr in allowed else 'Toegankelijk alledaags, sportief, cultureel of schoolkennis-anker; geen specialistische hoofdstuk- of atoomnummervulling.'})

 if '--reviewed' in sys.argv:
  review=json.loads((root/'puzzels/legendary/review.json').read_text(encoding='utf8'))
  reviews={r['question_nl']:r for r in review['question_reviews']}
  pool=[r for r in pool if not reviews.get(r['q'],{}).get('publication_hold')]
  for r in pool:
   if r['q'] in reviews:
    rr=reviews[r['q']];r['quality']=rr['decision'];r['quality_reason']=rr['reason_nl'];r['reviewed']=True;r['semantic_fact_family']=rr['semantic_fact_family']
   else:r['reviewed']=False
 # Manual semantic aliases beyond identical text/source values.
 aliases=[{113,311},{787,789,790},{232,253},{391,392},{1288,1292},{498,1384,1388},{502,1403},{507,1415},{513,1419},{503,1410},{1385,1391},{1387,1389},{1386,1390},{1402,1407},{1409,1412},{1136,1323},{255,352},{789,790},{1439,1440},{419,1247}]
 def canonical_source(url):
  return unquote(urlsplit(url).netloc.lower().removeprefix('www.')+urlsplit(url).path.rstrip('/')).lower()
 def constraints_for(r):
  ks=['nr:'+str(r['id']),'text:'+re.sub(r'\s+',' ',r['q']).strip().casefold(),'sourcevalue:'+canonical_source(r['src'])+':'+str(r['a'])]
  if r.get('semantic_fact_family'):ks.append('reviewfamily:'+r['semantic_fact_family'])
  for j,g in enumerate(aliases):
   if r['id'] in g:ks.append('semantic:'+str(j))
  return ks
 by={}
 for r in pool:by.setdefault(r['a'],[]).append(r)
 edges=[];seen=set()
 for a,b in itertools.combinations(pool,2):
  if a['cat']==b['cat']:continue
  for op,n in [('+',a['a']+b['a']),('-',abs(a['a']-b['a'])),('*',a['a']*b['a']),('/',a['a']//b['a'] if a['a']%b['a']==0 else 0)]:
   aa,bb=(b,a) if op=='-' and a['a']<b['a'] else (a,b)
   for c in by.get(n,[]):
    rs=[aa,bb,c];ids=tuple(sorted(r['id'] for r in rs))
    if ids in seen or len(set(ids))<3 or len({r['cat'] for r in rs})<3:continue
    strong=sum(r['quality']=='strong' for r in rs)
    if strong==0:continue
    keys=[constraints_for(r) for r in rs]
    if any(set(keys[i])&set(keys[j]) for i,j in [(0,1),(0,2),(1,2)]):continue
    seen.add(ids);edges.append({'rs':rs,'op':op,'nstrong':strong})
 keys=sorted({k for c in edges for r in c['rs'] for k in constraints_for(r)});kp={k:i for i,k in enumerate(keys)}
 rr=[];cc=[]
 for j,c in enumerate(edges):
  for r in c['rs']:
   for k in constraints_for(r):rr.append(kp[k]);cc.append(j)
 matrix=coo_matrix((np.ones(len(rr)),(rr,cc)),shape=(len(keys),len(edges))).tocsc()
 flagship=np.array([1.0 if {r['id'] for r in c['rs']}=={308,450,1011} else 0.0 for c in edges])
 assert flagship.sum()>=1, 'Flagship not present'
 matrix=vstack([matrix,np.ones((1,len(edges))),flagship.reshape(1,-1)]).tocsc()
 lb=np.zeros(len(keys)+2);ub=np.ones(len(keys)+2);lb[-2]=ub[-2]=100;lb[-1]=ub[-1]=1
 weights={3:10000,2:100,1:1}
 # Tiny tie preference for less arithmetic-trivial numeric structure.
 objective=-np.array([weights[c['nstrong']]+sum(min(4,math.log10(r['a'])) for r in c['rs'])*0.00001 for c in edges])
 print('TIER POOL',len(pool),'EDGES',len(edges),'strong',sum(r['quality']=='strong' for r in pool),'normal',sum(r['quality']=='normal' for r in pool),flush=True)
 result=milp(objective,integrality=np.ones(len(edges)),bounds=Bounds(0,1),constraints=LinearConstraint(matrix,lb,ub),options={'time_limit':90,'mip_rel_gap':0.001})
 chosen=[c for c,x in zip(edges,result.x) if x>.5] if result.x is not None else []
 output=[]
 for i,c in enumerate(chosen):
  rs=c['rs'];tier={3:'legendary',2:'bijna-legendary',1:'normaal'}[c['nstrong']]
  output.append({'candidate_id':f'a-tier-{i+1:03}','tier':tier,'question_texts_nl':[r['q'] for r in rs],'answers':[r['a'] for r in rs],'operator':{'-':chr(8722),'*':chr(215),'/':chr(247)}.get(c['op'],c['op']),'score':c['nstrong']+2,'question_quality':[{'quality':r['quality'],'reason_nl':r['quality_reason'],'independent_editorial_review':r.get('reviewed',False)} for r in rs],'reason_nl':str(c['nstrong'])+' redactioneel geselecteerde schaalvragen; overige vragen zijn toegankelijke normale ankers.','risks':['Bestaande bronnen zijn niet opnieuw extern geverifieerd in deze zoekronde.','Bronwaarde, afronding en vraagafbakening blijven inhoudelijke reviewpunten.'],'source_urls':[r['src'] for r in rs],'source_bank_ids':[r['id'] for r in rs],'semantic_keys':[constraints_for(r) for r in rs]})
 payload={'stats':{'pool_facts':len(pool),'edges':len(edges),'selected_count':len(output),'tiers':dict(collections.Counter(x['tier'] for x in output)),'solver_status':result.message,'mip_gap':getattr(result,'mip_gap',None),'flagship_required':True,'semantic_rule':'Counting basis variants (pairs/singles, with/without pedestal, roof/antenna) share one global fact slot.'},'selected_100':output,'normal_whitelist':sorted(normal),'strong_whitelist':sorted(allowed),'quality_policy':'Strong whitelist is a broad editorial scale filter, not independently reviewed legendary approval. Normal whitelist deliberately uses accessible knowledge; no zero-strong triples. Source-value and text aliases enforce conservative semantic uniqueness.','scope':'Only within new 100, existing Library overlap allowed.'}
 (root/'puzzels/legendary/tier_selectie_a.json').write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
 print(payload['stats'],flush=True)
 sys.exit(0)

if '--unique' in sys.argv:
 from scipy.optimize import milp, Bounds, LinearConstraint
 from scipy.sparse import coo_matrix
 import numpy as np
 def solve(edges, seconds=45):
  ids=sorted({r['id'] for c in edges for r in c['rs']}); pos={q:i for i,q in enumerate(ids)}
  rr=[];cc=[]
  for j,c in enumerate(edges):
   for r in c['rs']:rr.append(pos[r['id']]);cc.append(j)
  matrix=coo_matrix((np.ones(len(rr)),(rr,cc)),shape=(len(ids),len(edges))).tocsc()
  # One constraint per exact normalized NL text too, source-row duplicates must not bypass uniqueness.
  labels=sorted({r['q'].casefold().strip() for c in edges for r in c['rs']}); lp={q:i for i,q in enumerate(labels)}
  rr=[];cc=[]
  for j,c in enumerate(edges):
   for r in c['rs']:rr.append(lp[r['q'].casefold().strip()]);cc.append(j)
  matrix=coo_matrix((np.ones(len(rr)),(rr,cc)),shape=(len(labels),len(edges))).tocsc()
  objective=np.array([-1-min(20,c['rank'])*0.00001 for c in edges])
  result=milp(objective,integrality=np.ones(len(edges)),bounds=Bounds(0,1),constraints=LinearConstraint(matrix,0,1), options={'time_limit':seconds,'mip_rel_gap':0.001})
  chosen=[c for c,x in zip(edges,result.x) if x>.5] if result.x is not None else []
  print('MATCH',len(edges),'facts',len(labels),'set',len(chosen),'status',result.message, flush=True)
  return chosen, {'candidate_count':len(edges),'eligible_fact_count':len(labels),'selected_count':len(chosen),'solver_status':result.message,'mip_gap':getattr(result,'mip_gap',None)}
 strong=[c for c in candidates if {r['id'] for r in c['rs']}<=allowed and sum(r['a']>=50 for r in c['rs'])>=2]
 strict,stats=solve(strong)
 broad,broadstats=solve(candidates)
 def encode(c,i,prefix):
  rs=c['rs']
  return {'candidate_id':f'{prefix}-{i+1:03}','question_texts_nl':[r['q'] for r in rs],'answers':[r['a'] for r in rs],'operator':{'-':chr(8722),'*':chr(215),'/':chr(247)}.get(c['op'],c['op']),'score':3 if prefix=='strong' else 2,'reason_nl':'Disjuncte exacte combinatie van drie bestaande schaalvragen; inhoudelijke broncontrole en redactie vereist.','risks':['Niet extern geverifieerd in deze ronde.','Disjunctie is op NL-tekst, semantische feitenclusters vereisen nog menselijke controle.']+(['Ruwe zoekpool bevat niet-legendary trivia en is uitsluitend haalbaarheidsanalyse.'] if prefix=='broad' else []),'source_urls':[r['src'] for r in rs],'source_bank_ids':[r['id'] for r in rs]}
 payload={'strong_stats':stats,'broad_stats':broadstats,'strong_disjoint':[encode(c,i,'strong') for i,c in enumerate(strict)],'broad_disjoint':[encode(c,i,'broad') for i,c in enumerate(broad)],'strong_candidate_pool':[[*[r['id'] for r in c['rs']],c['op'],round(c['rank'],3)] for c in strong], 'questions_by_bank_id':{str(r['id']):r for c in strong for r in c['rs']},'scope':'Existing bank only; no automatic legendary approval; semantic duplicate review pending.'}
 (root/'puzzels/legendary/unieke_a.json').write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
 sys.exit(0)

use=collections.Counter(); selected=[]
for turn in range(65):
 best=None;bestscore=-1e9
 for c in candidates:
  ids=[r['id'] for r in c['rs']]
  if not set(ids)<=allowed or any(use[i]>=3 for i in ids):continue
  if any(set(ids)==set(x['ids']) for x in selected):continue
  vals=[r['a'] for r in c['rs']]
  if sum(a>=50 for a in vals)<2:continue
  # at least two genuine large/uncertain scales; avoid easy all-sub100 arithmetic
  sc=sum(i in star for i in ids)*2.5+sum(min(3.7,__import__('math').log10(a)) for a in vals)
  sc-=sum(use[i]**1.6 for i in ids)*3
  sc-=sum(bool(re.search('wereldwijd|Hilton',r['q'],re.I)) for r in c['rs'])*1.8
  sc-=sum(bool(re.search('record|zwaarste|hoogste|langste',r['q'],re.I)) for r in c['rs'])*.4
  if sc>bestscore:best,bestscore=c,sc
 if best is None:break
 ids=[r['id'] for r in best['rs']];use.update(ids);selected.append({'ids':ids,**best})

five={0,1,4,5,9,10,12,14,17,21,23,25,30,32,33,34,38,40,43,48,59,62}
three={7,15,19,20,26,31,35,36,37,39,41,42,44,46,47,49,50,51,52,53,55,56,58,60,61,63,64}
specific={
0:'Speekselproductie is onverwacht groot, een piramideblok is voorstelbaar zwaar en Titanic-klinknagels zorgen voor een sterke miljoenen-onthulling.',
1:'De Amazone geeft een denkbare duizenden-schaal, koalaslaap een biologisch anker en de brugkabels leveren de verrassing in afstand.',
4:'Darm-lengte is vanuit het lichaam te benaderen; Neptunuswind en de Donau vragen schaalgevoel in heel andere onderwerpen.',
5:'Dagelijkse speekselproductie en een potvisduik zijn lichamelijk voorstelbaar maar onzeker; het waterdebiet maakt de eindonthulling groot.',
9:'Een walvistong is een verrassend gewicht; rif en Romeinse grens geven verschillende soorten afstand om te vergelijken.',
12:'Een walvishart kun je niet precies kennen, maar wel fysiek proberen voor te stellen; het meer en het David-beeld hebben verschillende schaalankers.',
14:'Klinknagels en bliksemtemperatuur laten factor-twee-fouten toe; drinkvermogen van een kameel is een voorstelbaar biologisch anker.',
25:'Hartbloed per dag voelt verrassend groot; piramideblokken helpen de orde van grootte van de Kongo te toetsen.',
30:'Waterdebiet, baanhoogte en olifantgewicht zijn herkenbare beelden met veel onzekerheid, waardoor de som werkelijk nuttig kan zijn.',
43:'De trage Venusrotatie en Challenger-diepte zijn sterke verrassingsfeiten; suiker in een blikje biedt een alledaags schatanker.',
62:'Brein, schilderij en piramide zijn bekende onderwerpen waarvan je de aantallen en afmetingen waarschijnlijk niet exact weet.'}
output=[]
for i,c in enumerate(selected):
 rs=c['rs']; risks=['Bestaande bankbron overgenomen; niet in deze kandidaatronde extern geverifieerd.']
 for r in rs:
  if re.search('gemiddeld|ongeveer|schatting|maximaal|kan |op zijn snelst|schat',r['q'],re.I):
   risks.append('Afbakening/variatie bij nr'+str(r['id'])+': bronwaarde, normale waarde versus maximum en afronding inhoudelijk controleren.')
  if re.search('bloedvaten|honing|moai|wereldwijd|wereld jaarlijks|wereld in|zee-ijs|melkweg',r['q'],re.I):
   risks.append('Extra bronrisico nr'+str(r['id'])+': definitie, schaal of meetperiode kan de gespeelde waarde sterk be?nvloeden.')
 score=5 if i in five else 3 if i in three else 4
 output.append({'candidate_id':f'a-{i+1:03}','question_texts_nl':[r['q'] for r in rs], 'answers':[r['a'] for r in rs], 'operator':{'-':chr(8722),'*':chr(215),'/':chr(247)}.get(c['op'],c['op']),'score':score,'reason_nl':specific.get(i,'Drie verschillende onderwerpen met minimaal twee onzekere grootheden; de relatie helpt de schattingen op onderlinge schaal te toetsen. '+('Deze combinatie is een reservekandidaat: afbakening en aantrekkelijkheid vragen extra redactie.' if score==3 else 'De onderwerpen zijn voorstelbaar zonder dat je hun exacte waarde hoeft te kennen.')),'risks':risks,'source_urls':[r['src'] for r in rs],'source_bank_ids':['nr'+str(r['id']) for r in rs], 'verification':'candidate_existing_sources_not_reverified'})
output.sort(key=lambda x:(-x['score'],x['candidate_id']))
(root/'puzzels/legendary/kandidaten_a.json').write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print('OUTPUT',len(output),'scores',dict(collections.Counter(x['score'] for x in output)),'unique facts',len(use))
