"""Pas de gecontroleerde openbare vraagmigraties uit het vervolgverslag toe.

Gebruik: python tools/verwerk_vraagaudit_vervolg_20261113.py
Bron: docs/audit/vragen_audit_vervolg_20261113.json.
Behoudt antwoorden en puzzel-id's en slaat Daily-data over. Werkt alleen root-
data bij; fotogeneratie, cacheversies en website/ zijn voor de integrator.
"""
import json,sys,re,collections
from pathlib import Path
import openpyxl
ROOT=Path(__file__).resolve().parents[1]
ledger=ROOT/'docs/audit/vragen_audit_vervolg_20261113.json'
all_rows=json.loads(ledger.read_text(encoding='utf8'))
limit=int(sys.argv[1]) if len(sys.argv)>1 else len(all_rows)
if limit!=len(all_rows):raise SystemExit('Gebruik een volledig auditbestand; inkorten zou het bronbestand overschrijven.')
rows=all_rows
changes=[r for r in rows if r['status']!='nog open' and 'new' in r]
def read(name):
 p=ROOT/'data'/name;t=p.read_text(encoding='utf8');i=t.index('=',t.index('window.'))+1;return t[:i],json.loads(t[i:].strip().rstrip(';'))
def write(name,h,d):
 p=ROOT/'data'/name;new=h+' '+json.dumps(d,ensure_ascii=False,indent=2 if name.endswith('_en.js') else None,separators=None if name.endswith('_en.js') else (',',':'))+';\n'
 if p.read_text(encoding='utf8')!=new:p.write_text(new,encoding='utf8')
th,tr=read('netto_translations_en.js');eh,ev=read('netto_bronnen_en.js');sh,src=read('netto_bronnen.js')
old_en={r['old']:tr.get(r['old']) for r in changes}
for r in changes:
 tr[r['new']]=r['en'];ev[r['evidence']]=r['evidence_en'];src[r['new']]={'bron':r['source'],'uitleg':r['evidence']}
# Existing aliases remain valid; add each new NL label with its previous key.
ap=ROOT/'vragen/hernoemingen_fotos.json';aliases=json.loads(ap.read_text(encoding='utf8'))
for r in changes:
 if r['old']!=r['new'] and not any(a['oud']==r['old'] and a['nieuw']==r['new'] for a in aliases):aliases.append({'id':r['id'],'oud':r['old'],'nieuw':r['new']})
ap.write_text(json.dumps(aliases,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
# Canonical review and generator bank: edit matching rows, never answer cells.
for fname,sheet,qcol,scol,ecol in [('vragen_review_compleet.xlsx','Vragen','Vraag NL','Bron (geverifieerd)','Bewijszin'),('1000+ vragen netjes gecategoriseerd.xlsx',None,'Vraag NL','Bron EN',None)]:
 p=ROOT/'vragen'/fname;w=openpyxl.load_workbook(p);s=w[sheet] if sheet else w.worksheets[0];c={x.value:x.column for x in s[1]};changed=False
 for row in range(2,s.max_row+1):
  for r in changes:
   if s.cell(row,c[qcol]).value not in (r['old'],r['new']):continue
   assert s.cell(row,c['Antwoord']).value==r['answer'],(fname,r['id'],'answer mismatch')
   vals={qcol:r['new'],scol:r['source']}
   if ecol:vals.update({ecol:r['evidence'],'Vraag EN (zoekhulp)':r['en']})
   for key,value in vals.items():
    if s.cell(row,c[key]).value!=value:s.cell(row,c[key]).value=value;changed=True
 if changed:w.save(p)
 w.close()
# Curated selections are canonical for Library/Connection. No Daily selections.
for mode in ('library','connection'):
 p=ROOT/f'puzzels/{mode}_selectie_20260927.json';d=json.loads(p.read_text(encoding='utf8'));changed=False
 for pu in d['puzzles']:
  for q in pu['questions']:
   for r in changes:
    if q['original'] not in (r['old'],r['new']):continue
    assert q['answer']==r['answer']
    for key,value in {'original':r['new'],'question':r['en'],'evidence':r['evidence'],'source':r['source']}.items():
     if q[key]!=value:q[key]=value;changed=True
 if changed:p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
# Mirror the targeted label migration used by the previous audit. Do not rebuild IDs.
for name in ('netto_frontend_puzzles.js','netto_race_pool.js','netto_breinkrakers.js','netto_connections.js'):
 if not (ROOT/'data'/name).exists():continue
 h,d=read(name);before=json.dumps(d,ensure_ascii=False);daily_before=json.dumps(d.get('daily')) if isinstance(d,dict) else None
 def visit(obj):
  if isinstance(obj,list):
   for a in obj:visit(a)
  elif isinstance(obj,dict):
   for r in changes:
    for i in range(1,5):
     key=f'q{i}_label'
     if obj.get(key) in (r['old'],old_en[r['old']]) and obj.get(key) is not None:
      assert obj[f'q{i}_answer']==r['answer'];obj[key]=r['en'] if obj[key]==old_en[r['old']] else r['new']
    if obj.get('label')==r['old']:
     assert obj['answer']==r['answer'];obj['label']=r['new']
   for k,v in obj.items():
    if k not in ('daily','daily_review'):visit(v)
 if name=='netto_frontend_puzzles.js':
  for mode in ('library','connection'):
   selection=json.loads((ROOT/f'puzzels/{mode}_selectie_20260927.json').read_text(encoding='utf8'))
   outputs={pu['id']:pu for pu in d[mode]}
   for pu in selection['puzzles']:
    for i,q in enumerate(pu['questions'],1):
     assert outputs[pu['id']][f'q{i}_answer']==q['answer']
     outputs[pu['id']][f'q{i}_label']=q['question']
   metadata=d.get(mode+'_review',{})
   for key,meta in list(metadata.items()):
    for r in changes:
     if meta.get('original') in (r['old'],r['new']):
      meta.update(original=r['new'],bron=r['source'],uitleg=r['evidence'],uitleg_en=r['evidence_en'])
      if key!=r['en']:del metadata[key]
      metadata[r['en']]=meta
 visit(d)
 if isinstance(d,dict):assert json.dumps(d.get('daily'))==daily_before
 if json.dumps(d,ensure_ascii=False)!=before:write(name,h,d)
# Source-only updates for unchanged, verified questions (where there is a bank row).
for r in rows:
 if r['id']=='nr1505':
  src[r['old']]['bron']=r['source']
write('netto_translations_en.js',th,tr);write('netto_bronnen_en.js',eh,ev);write('netto_bronnen.js',sh,src)
# Durable, machine-readable migration ledger for the integrator; no Daily answers.
manifest=ROOT/'docs/audit/vragen_audit_vervolg_20261113.json';manifest.write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
counts=collections.Counter(r['status'] for r in rows)
lines=['# Vervolg vragenaudit — 13 november 2026','',f'Bereik: {len(rows)} van de 122 open punten uit het verslag van 12 november. De letterlijke categorie “Definitie, bron of afbakening vereist vervolgcontrole” bevat 39 punten; de 122 omvatten ook records, statistiek en redactionele keuzes.','',f'Uitkomsten: '+', '.join(f'{k}: {counts[k]}' for k in ('in orde','aangescherpt','antwoord gecorrigeerd','vraag vervangen','nog open'))+'.','', 'Bronnen zijn op 13 november 2026 geraadpleegd. Een bron bij **nog open** is een gecontroleerde verwijzing, geen bevestiging van het oude antwoord. Foutpagina’s zonder bruikbare broninhoud zijn niet als bewijs aanvaard. Waar de zoekindex wel de concrete passage uit een betrouwbaar rapport ontsloot, is die passage gebruikt. Getallen zijn niet van een verzonnen peildatum voorzien.','', 'Alle puzzel-id’s en antwoorden blijven behouden. Daardoor blijven de bestaande berekeningen exact gelijk en blijven alle antwoorden positieve gehele getallen. Voor onopgeloste fouten is geen vervangende vraag zonder verificatie toegevoegd; de concrete puzzel-id’s staan bij elk open punt.','', 'Werkwijze conform de vorige audit: gerichte migratie van reviewblad, generatorbank, Library/Connection-selecties, vertalingen, bewijszinnen en root-data voor openbare modi. De JSON naast dit verslag bevat per punt de oude tekst, uitkomst, bron en waar van toepassing de nieuwe NL/EN-tekst en bewijszinnen. Deze gerichte migratie bewaart de bestaande Race-/ketting-id’s en is herhaalbaar met python tools/verwerk_vraagaudit_vervolg_20261113.py. Het historische werkbestand puzzels/breinkrakers.xlsx (100.000 kandidaten) wordt niet opnieuw getrokken.','', 'Daily-selecties, de Daily-lijst in frontenddata, Supabase, foto-assets, handgeschreven JS/CSS/HTML, cacheversies en website/ zijn niet gewijzigd. Nederlandse hernoemingen zijn vastgelegd in vragen/hernoemingen_fotos.json. De integrator verzorgt de fotogeneratie, cacheversies en mirror. Een proef met de fotogenerator wijzigde ook bestaande, niet-gerelateerde sleutels; de uitvoer is teruggezet en data/netto_fotos.js is in het eindresultaat ongewijzigd. Controleer die generatie afzonderlijk bij integratie.','']
for n,r in enumerate(rows,1):
 lines += [f"## {n}. {r['id']} — {r['status']}",'',f"Oud: {r['old']} Antwoord: **{r['answer']}**.",'',r['reason'],'',f"Bron: [geraadpleegde bron]({r['source']}).",'',f"Vindplaatsen: {r['locations']}.",'']
 if r['status']!='nog open' and 'new' in r:lines += [f"NL: {r['new']}",'',f"EN: {r['en']}",'']
lines += ['## Nog open', '', ', '.join(r['id'] for r in rows if r['status']=='nog open')+'. Zie de afzonderlijke punten voor de reden, bron en alle betrokken puzzel-id’s.', '']
lines += ['## Controles','', 'Per partij: python tools/controleer_puzzels.py (ALLES IN ORDE), node tests/puzzle-library.cjs, node tests/photo-links.cjs, node tests/daily-reliability.cjs en node tests/daily-server.cjs. De partij wordt pas gecommit nadat deze controles slagen.','']
(ROOT/'docs/audit/vragen_audit_vervolg_20261113.md').write_text('\n'.join(lines),encoding='utf8')
print(counts)
