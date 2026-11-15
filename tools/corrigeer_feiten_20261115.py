"""Gerichte broncorrecties; behoudt alle vraagteksten, antwoorden en puzzel-ID's.

Geen Daily-selectie, mirror, cacheversies of brede generator uitvoeren.
"""
import json
from pathlib import Path
import openpyxl

ROOT = Path(__file__).resolve().parents[1]
FIXES = {
    'q148': {
        'source': 'https://www.marlin.ac.uk/species/detail/1194/common_starfish_asterias_rubens',
        'evidence': 'De gewone zeester (Asterias rubens) heeft normaal vijf armen; zeldzame exemplaren hebben vier tot acht armen.',
        'evidence_en': 'The common starfish (Asterias rubens) normally has five arms; rare individuals have four to eight arms.',
    },
    'q190': {
        'source': 'https://iei.coffee/en/espresso-italiano-certificato/',
        'evidence': 'Een traditionele Italiaanse cappuccino bevat één espresso van ongeveer 25 milliliter. Het Istituto Espresso Italiano specificeert 25 milliliter espresso voor zijn gecertificeerde cappuccino.',
        'evidence_en': 'A traditional Italian cappuccino contains one espresso of about 25 millilitres. The Istituto Espresso Italiano specifies 25 millilitres of espresso for its certified cappuccino.',
    },
}


def read_js(name):
    path = ROOT / 'data' / name
    text = path.read_text(encoding='utf8')
    split = text.index('=', text.index('window.')) + 1
    return path, text[:split], json.loads(text[split:].strip().rstrip(';'))


def write_js(name, header, value):
    path = ROOT / 'data' / name
    indent = 2 if name.endswith('_en.js') else None
    text = header + ' ' + json.dumps(value, ensure_ascii=False, indent=indent,
        separators=None if indent else (',', ':')) + ';\n'
    if path.read_text(encoding='utf8') != text:
        path.write_text(text, encoding='utf8')


def main():
    path = ROOT / 'puzzels/library_selectie_20260927.json'
    selection = json.loads(path.read_text(encoding='utf8'))
    changed = False
    for puzzle in selection['puzzles']:
        for question in puzzle['questions']:
            if question['id'] not in FIXES:
                continue
            fix = FIXES[question['id']]
            fix['label'] = question['original']
            fix['answer'] = question['answer']
            for key in ('source', 'evidence'):
                if question[key] != fix[key]:
                    question[key] = fix[key]
                    changed = True
            if question['id'] == 'q148' and question.get('notes') == 'Species and scope still need tightening.':
                question['notes'] = 'Common starfish means Asterias rubens; five arms is its normal anatomy, not a universal rule for all sea stars.'
                changed = True
    if changed:
        path.write_text(json.dumps(selection, ensure_ascii=False, indent=2) + '\n', encoding='utf8')

    for filename, sheet, source_column in (
        ('vragen_review_compleet.xlsx', 'Vragen', 'Bron (geverifieerd)'),
        ('1000+ vragen netjes gecategoriseerd.xlsx', None, 'Bron EN'),
    ):
        path = ROOT / 'vragen' / filename
        book = openpyxl.load_workbook(path)
        ws = book[sheet] if sheet else book.worksheets[0]
        columns = {cell.value: cell.column for cell in ws[1]}
        changed = False
        for row in range(2, ws.max_row + 1):
            for fix in FIXES.values():
                if ws.cell(row, columns['Vraag NL']).value != fix['label']:
                    continue
                assert ws.cell(row, columns['Antwoord']).value == fix['answer']
                values = {source_column: fix['source']}
                if sheet:
                    values['Bewijszin'] = fix['evidence']
                for key, value in values.items():
                    cell = ws.cell(row, columns[key])
                    if cell.value != value:
                        cell.value = value
                        changed = True
        if changed:
            book.save(path)
        book.close()

    _, header, sources = read_js('netto_bronnen.js')
    for fix in FIXES.values():
        sources[fix['label']] = {'bron': fix['source'], 'uitleg': fix['evidence']}
    sodium_label = 'Hoeveel elektronen heeft een natriumion, Na⁺?'
    sodium_evidence = 'Een natriumion Na⁺ heeft elf protonen en tien elektronen: het neutrale natriumatoom heeft één elektron afgestaan.'
    sources[sodium_label] = {
        'bron': 'https://www.acs.org/middleschoolchemistry/lessonplans/chapter4/lesson5.html',
        'uitleg': sodium_evidence,
    }
    write_js('netto_bronnen.js', header, sources)
    _, header, translations = read_js('netto_bronnen_en.js')
    for fix in FIXES.values():
        translations[fix['evidence']] = fix['evidence_en']
    translations[sodium_evidence] = 'A sodium ion, Na⁺, has eleven protons and ten electrons: the neutral sodium atom has lost one electron.'
    write_js('netto_bronnen_en.js', header, translations)
    _, header, data = read_js('netto_frontend_puzzles.js')
    for mode in ('library_review', 'connection_review'):
        for metadata in data.get(mode, {}).values():
            fix = FIXES.get(metadata.get('id'))
            if fix:
                metadata.update(bron=fix['source'], uitleg=fix['evidence'], uitleg_en=fix['evidence_en'])
    write_js('netto_frontend_puzzles.js', header, data)
    print('Twee bestaande feiten en één ontbrekende bronkoppeling bijgewerkt; labels en antwoorden behouden.')


if __name__ == '__main__':
    main()
