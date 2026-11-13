"""Schrijf controleerbare verschillen en de volledige vrageninventaris."""
import io
import json
from pathlib import Path
import re
import subprocess
import openpyxl
from controleer_puzzels import laad
from corrigeer_vragen_20261112 import WEGHALEN, VERVANGINGEN, BREIN_WEGHALEN

BASE = 'f7597a6'


def oldfile(path):
    return subprocess.check_output(['git', 'show', BASE + ':' + path])


def oldjs(name):
    t = oldfile('data/' + name).decode('utf8')
    return json.loads(t[t.index('=', t.index('window.')) + 1:].strip().rstrip(';'))


def rows(book):
    sheet = book['Vragen']
    headers = [c.value for c in sheet[1]]
    return {r[0]: dict(zip(headers, r)) for r in sheet.iter_rows(min_row=2, values_only=True) if r[0] is not None}


def esc(value):
    return str(value if value is not None else '').replace('|', '/').replace('\n', ' ').replace('\t', ' ')


def main():
    old = rows(openpyxl.load_workbook(io.BytesIO(oldfile('vragen/vragen_review_compleet.xlsx'))))
    new = rows(openpyxl.load_workbook('vragen/vragen_review_compleet.xlsx'))
    bank = {r['Vraag NL']: r for r in new.values()}
    fr = laad('netto_frontend_puzzles.js')
    race = laad('netto_race_pool.js')
    brain = laad('netto_breinkrakers.js')
    sources = laad('netto_bronnen.js')
    translations = laad('netto_translations_en.js')
    inventory = {}
    for mode in ('library', 'connection'):
        for p in fr[mode]:
            for i in (1, 2, 3):
                m = fr[mode + '_review'][p[f'q{i}_label']]
                entry = inventory.setdefault(m['original'], dict(id=m['id'], answer=p[f'q{i}_answer'], source=m['bron'], evidence=m['uitleg'], where=[]))
                entry['where'].append(mode + ':' + str(p['id']))
    for mode, puzzles in [('race', race), ('breinkrakers', brain)]:
        for p in puzzles:
            for i in range(1, 5 if mode == 'breinkrakers' else 4):
                q = p[f'q{i}']['label'] if mode == 'breinkrakers' else p[f'q{i}_label']
                a = p[f'q{i}']['answer'] if mode == 'breinkrakers' else p[f'q{i}_answer']
                row = bank.get(q, {})
                entry = inventory.setdefault(q, dict(id='nr' + str(row.get('Nr', '?')), answer=a, source=sources.get(q, {}).get('bron', row.get('Bron (geverifieerd)', '')), evidence=sources.get(q, {}).get('uitleg', row.get('Bewijszin', '')), where=[]))
                entry['where'].append(mode + ':' + p['id'])
    changes = []
    for nr, row in new.items():
        diffs = [f'{k}: {esc(old[nr].get(k))} → {esc(row.get(k))}' for k in ('Vraag NL', 'Antwoord', 'Categorie', 'Bewijszin', 'Bron (geverifieerd)') if old[nr].get(k) != row.get(k)]
        if diffs:
            changes.append(('nr' + str(nr), diffs, row.get('Bron (geverifieerd)')))
    selections = []
    for mode in ('library', 'connection'):
        path = 'puzzels/' + mode + '_selectie_20260927.json'
        prior = json.loads(oldfile(path))
        current = json.loads(Path(path).read_text(encoding='utf8'))
        before = {q['id']: q for p in prior['puzzles'] for q in p['questions']}
        for p in current['puzzles']:
            for q in p['questions']:
                diffs = [f'{k}: {esc(before[q["id"]].get(k))} → {esc(q.get(k))}' for k in ('original', 'question', 'answer', 'category', 'source', 'evidence') if before[q['id']].get(k) != q.get(k)]
                if diffs:
                    selections.append((q['id'], diffs, q['source']))
    open_items = []
    for q, e in inventory.items():
        flags = []
        if re.search(r'ooit|record|langste levende|hoogste hond|hoogste paard|zwaarste', q, re.I):
            flags.append('Record: persoon, datum, afronding en bron nog afzonderlijk controleren.')
        if re.search(r'inwoners|toeristen|jaarlijks|per jaar|per seconde gemaakt|zoekopdrachten|winkels|hotels|vogelsoorten|plant- en diersoorten|wereldkoffie|wereldcacao|wetlands|procent.*wereld|wereld.*procent|spieren|tanden wisselt|defensiebudget', q, re.I) and not re.search(r'\b(19|20)\d\d\b', q):
            flags.append('Veranderlijke statistiek: peildatum en meetdefinitie controleren.')
        if re.search(r'landen telt (Europa|Azië)|eerste (internationale|camera|radio|laptop|elektrische|moderne volkstelling)|pure chocolade|eierdoos|autorij-afstand|Morsealfabet|sushi|officiële talen heeft Zwitserland|provincies heeft Argentinië|eilanden vormen Indonesië|gezonde menselijke cel|Zeelandbrug|Hoeveel kilogram weegt|Hoeveel uur per dag slaapt|landen grenzen aan de Dode Zee|start van Catan|manen heeft Jupiter|provincie Utrecht', q, re.I):
            flags.append('Definitie, bron of afbakening vereist vervolgcontrole.')
        if re.search(r'Big Five|vijfarmige|Twaalf Olympiërs|\(1948-1994\)|diagonalen|som van de getallen|deelverzamelingen|mogelijke worpen|manieren kun je', q, re.I):
            flags.append('Speelplezier: antwoord gegeven of direct berekenbaar; redactionele keuze.')
        if flags:
            open_items.append((q, e, flags))
    preamble = Path('docs/audit/vragen_audit_20261112_inleiding.md').read_text(encoding='utf8')
    lines = [preamble, '', f'Geteld: **{len(inventory)} unieke vraagteksten**, **{len(changes)} gewijzigde bankregels**, **{len(selections)} gewijzigde selectievragen** en **{len(open_items)} expliciete vervolgpunten**. Overlap tussen modi telt eenmaal.', '', '## Alle gewijzigde bankregels', '', '| Id | Oud → nieuw: alle gewijzigde velden | Bron |', '|---|---|---|']
    for qid, diffs, url in changes:
        lines.append(f'| {qid} | ' + '<br>'.join(diffs) + f' | {url} |')
    lines += ['', '## Alle gewijzigde selectievragen', '', '| Id | Oud → nieuw | Bron |', '|---|---|---|']
    for qid, diffs, url in selections:
        lines.append(f'| {qid} | ' + '<br>'.join(diffs) + f' | {url} |')
    lines += ['', '## Racevervangingen', '']
    for pid, (pos, nr) in VERVANGINGEN.items():
        op = next(p for p in oldjs('netto_race_pool.js') if p['id'] == pid)
        np = next(p for p in race if p['id'] == pid)
        lines.append(f'- {pid}, vraag {pos}: {op[f"q{pos}_label"]} → nr{nr}: {np[f"q{pos}_label"]}. Zelfde antwoord. Bron: {new[nr].get("Bron (geverifieerd)")}')
    lines += ['', '## Vervallen puzzels', '', 'Alle overige id’s zijn behouden. De race bewaart geen voortgang per pool-id.']
    for pid, reason in WEGHALEN.items():
        lines.append(f'- {pid}: {reason}.')
    lines += ['- pool-024: frietrecord 1000 kg is onjuist; bankantwoord nu 669 kg (afgerond van 668,6). Bron: https://www.guinnessworldrecords.com/world-records/largest-serving-of-chips-fries']
    remaining = {p['id'] for p in brain}
    for p in oldjs('netto_breinkrakers.js'):
        if p['id'] not in remaining:
            lines.append(f'- {p["id"]}: ' + BREIN_WEGHALEN.get(p['id'], 'bevatte het onjuiste frietantwoord 1000 kg') + '.')
    lines += ['', '## Open punten per vraag', '', 'Dit zijn zowel feiten die verder geverifieerd moeten worden als redactionele keuzes. De lijst is geen goedkeuring van de overige feiten.', '', '| Id | Vraag (antwoord); vindplaats | Open punt | Bron |', '|---|---|---|---|']
    for q, e, flags in open_items:
        lines.append(f'| {e["id"]} | {esc(q)} ({e["answer"]}); {", ".join(e["where"])} | ' + ' '.join(flags) + f' | {e["source"]} |')
    Path('docs/audit/vragen_audit_20261112.md').write_text('\n'.join(lines) + '\n', encoding='utf8')
    inv = ['id\tantwoord\tvraag\tengels\tbron\tbewijs\tvindplaatsen\tstatus']
    open_qs = {q for q, _, _ in open_items}
    for q, e in inventory.items():
        inv.append('\t'.join(esc(v) for v in [e['id'], e['answer'], q, translations.get(q, ''), e['source'], e['evidence'], ','.join(e['where']), 'vervolgcontrole' if q in open_qs else 'tekst gescreend; externe herverificatie niet volledig']))
    Path('docs/audit/vragen_audit_20261112_inventaris.tsv').write_text('\n'.join(inv) + '\n', encoding='utf8')
    print(len(inventory), 'unieke vragen;', len(changes), 'bankregels;', len(selections), 'selectievragen;', len(open_items), 'vervolgpunten')


if __name__ == '__main__':
    main()
