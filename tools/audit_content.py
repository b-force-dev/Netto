"""Build a reproducible inventory, not a new source of truth or fact verification.

python tools/audit_content.py [--check]
"""
import argparse
from collections import Counter, defaultdict
import hashlib
import json
import math
from pathlib import Path
import re
import sys

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/audit'


def read_json(path):
    return json.loads((ROOT / path).read_text(encoding='utf-8'))


def read_js(path):
    text = (ROOT / path).read_text(encoding='utf-8')
    match = re.search(r'window\.\w+\s*=\s*', text)
    return json.JSONDecoder().raw_decode(text[match.end():])[0]


def clean(value):
    if value is None or (isinstance(value, float) and math.isnan(value)):
        return None
    if hasattr(value, 'item'):
        value = value.item()
    return value.strip() if isinstance(value, str) else value


def key(text):
    return re.sub(r'\s+', ' ', str(text).strip()).casefold()


def build():
    records = {}
    puzzles = []
    sources = read_js('data/netto_bronnen.js')
    translations = read_js('data/netto_translations_en.js')
    evidence_en = read_js('data/netto_bronnen_en.js')

    def add(nl, observation):
        if not nl:
            raise ValueError('Question without a label')
        k = key(nl)
        record = records.setdefault(k, {
            'catalog_id': 'text-' + hashlib.sha256(k.encode()).hexdigest()[:16],
            'question_nl': nl, 'source_ids': [], 'observations': [],
            'locations': [], 'flags': [], 'historical_open_items': [],
        })
        observation = {k: clean(v) for k, v in observation.items() if clean(v) is not None}
        record['observations'].append(observation)
        if observation.get('source_id'):
            record['source_ids'].append(observation['source_id'])
        if observation.get('location'):
            record['locations'].append(observation['location'])
        return record['catalog_id']

    bank_path = 'vragen/vragen_review_compleet.xlsx'
    frame = pd.read_excel(ROOT / bank_path, sheet_name='Vragen')
    for index, row in frame.iterrows():
        nr = clean(row['Nr'])
        source_id = f'nr{int(nr)}' if isinstance(nr, (int, float)) else str(nr)
        add(row['Vraag NL'], {
            'kind': 'review_workbook', 'source_id': source_id,
            'location': f'{bank_path}#Vragen!{index + 2}',
            'question_en': clean(row.get('Vraag EN (zoekhulp)')) or translations.get(row['Vraag NL']),
            'answer': row.get('Antwoord'), 'category': row.get('Categorie'),
            'source': row.get('Bron (geverifieerd)'), 'evidence': row.get('Bewijszin'),
            'recorded_review': row.get('Controle'),
            'recorded_source_confidence': row.get('Vertrouwen bron'),
            'recorded_old_source_status': row.get('Status oude bron'),
            'recorded_warning': row.get('Let op'),
        })

    for mode in ('library', 'connection'):
        path = f'puzzels/{mode}_selectie_20260927.json'
        for puzzle in read_json(path)['puzzles']:
            ids = []
            for question in puzzle['questions']:
                ids.append(add(question['original'], {
                    'kind': 'editorial_selection', 'source_id': question['id'],
                    'location': f'{mode}:{puzzle["id"]}',
                    'question_en': question['question'], 'answer': question['answer'],
                    'category': question.get('category'), 'source': question.get('source'),
                    'evidence': question.get('evidence'),
                    'evidence_en': question.get('evidence_en') or evidence_en.get(question.get('evidence')),
                    'recorded_verified_on': question.get('verified_on'),
                    'recorded_status': question.get('status'),
                    'editorial_knowledge_rating': question.get('rating'),
                }))
            puzzles.append(puzzle_record(mode, puzzle, ids, [q['answer'] for q in puzzle['questions']]))

    for mode, path in (('race', 'data/netto_race_pool.js'), ('breinkrakers', 'data/netto_breinkrakers.js')):
        for puzzle in read_js(path):
            ids, answers = [], []
            for i in range(1, 5 if mode == 'breinkrakers' else 4):
                question = puzzle.get(f'q{i}', {})
                nl = question.get('label') or puzzle[f'q{i}_label']
                answer = question.get('answer') if 'answer' in question else puzzle[f'q{i}_answer']
                source = sources.get(nl, {})
                ids.append(add(nl, {
                    'kind': 'generated_public_data', 'location': f'{mode}:{puzzle["id"]}',
                    'question_en': translations.get(nl), 'answer': answer,
                    'source': source.get('bron'), 'evidence': source.get('uitleg'),
                    'evidence_en': evidence_en.get(source.get('uitleg')),
                }))
                answers.append(answer)
            puzzles.append(puzzle_record(mode, puzzle, ids, answers))

    # Historical issues are provenance, never proof that the current wording is wrong.
    audit_path = 'docs/audit/vragen_audit_vervolg_20261113.json'
    unmatched = []
    by_id = defaultdict(list)
    for record in records.values():
        for source_id in record['source_ids']:
            by_id[source_id].append(record)
    for issue in read_json(audit_path):
        if issue.get('status') != 'nog open':
            continue
        matches = {r['catalog_id']: r for r in by_id.get(issue['id'], [])}
        for field in ('old', 'new'):
            if issue.get(field) and key(issue[field]) in records:
                record = records[key(issue[field])]
                matches[record['catalog_id']] = record
        if not matches:
            unmatched.append(issue)
        for record in matches.values():
            record['historical_open_items'].append({'audit': audit_path, **issue})

    for record in records.values():
        observations = record['observations']
        record['source_ids'] = sorted(set(record['source_ids']))
        record['locations'] = sorted(set(record['locations']))
        record['answers'] = sorted({o['answer'] for o in observations if isinstance(o.get('answer'), (int, float))})
        if len(record['answers']) > 1:
            record['flags'].append('conflicting_answers')
        for field in ('source', 'evidence', 'question_en'):
            if not any(o.get(field) for o in observations):
                record['flags'].append('missing_' + field)
        if record['historical_open_items']:
            record['flags'].append('historical_open_issue_requires_recheck')
        bank_observations = [o for o in observations if o['kind'] == 'review_workbook']
        selection_observations = [o for o in observations if o['kind'] == 'editorial_selection']
        if any(not o.get('recorded_review') for o in bank_observations):
            record['flags'].append('review_control_missing')
        if any(not o.get('recorded_verified_on') for o in selection_observations):
            record['flags'].append('unrecorded_selection_verification_date')
        warning_text = ' '.join(str(o.get(f, '')) for o in bank_observations
                                for f in ('recorded_review', 'recorded_old_source_status', 'recorded_warning'))
        if re.search(r'dode link|wijkt af|natellen|veroudert|404|niet bevestigd', warning_text, re.I):
            record['flags'].append('historical_review_warning')
        record['active_in_inventoried_modes'] = any(o['kind'] != 'review_workbook' for o in observations)
        record['verification'] = 'not_externally_verified_by_this_inventory'
    return {
        'schema_version': 1,
        'scope': 'Review workbook, library/connection selections, public race and brainteasers; excludes server Daily data.',
        'identity_policy': 'Group only exact normalized NL text; source IDs are preserved, not assumed equivalent across files. catalog_id changes when wording changes.',
        'verification_policy': 'Recorded status/evidence is provenance, not independent confirmation. Historical issues may already be resolved.',
        'difficulty_policy': 'Numerical flags are heuristics; knowledge ratings and difficulty labels are editorial, not player-calibrated.',
        'questions': sorted(records.values(), key=lambda q: q['catalog_id']),
        'puzzles': sorted(puzzles, key=lambda p: (p['mode'], str(p['id']))),
        'unmatched_historical_open_items': unmatched,
    }


def puzzle_record(mode, puzzle, ids, answers):
    flags = []
    if max(answers) >= 10000:
        flags.append('large_number_review')
    if 1 in answers:
        flags.append('identity_number_review')
    if len(set(ids)) != len(ids):
        flags.append('repeated_question')
    return {'mode': mode, 'id': puzzle['id'], 'questions': ids, 'answers': answers,
            'difficulty': puzzle.get('difficulty'), 'recorded_difficulty_score': puzzle.get('difficulty_score'),
            'operator': puzzle.get('operator') or [puzzle.get('op1'), puzzle.get('op2')],
            'numerical_review_flags': flags}


def markdown(catalog):
    questions, puzzles = catalog['questions'], catalog['puzzles']
    flags = Counter(f for q in questions for f in q['flags'])
    counts = Counter(p['mode'] for p in puzzles)
    coverage = Counter()
    for q in questions:
        for o in q['observations']:
            if o['kind'] == 'review_workbook':
                coverage['review_rows'] += 1
                if not o.get('recorded_review'):
                    coverage['review_control_missing'] += 1
            if o['kind'] == 'editorial_selection':
                mode = o['location'].split(':')[0]
                coverage[mode + '_question_placements'] += 1
                if not o.get('recorded_verified_on'):
                    coverage[mode + '_verification_date_missing'] += 1
    lines = ['# Inhoudscatalogus en kwaliteitswachtrij', '',
             'Gegenereerd met `python tools/audit_content.py`. Dit is een inventaris, geen nieuwe bronbank of afgeronde feitencontrole.', '',
             f'{len(questions)} unieke Nederlandse vraagteksten uit het reviewblad en de onderzochte openbare modi; {len(puzzles)} puzzels.',
             'De server-Dailies en hun detailrecords vallen buiten deze lokale inventaris.', '',
             '## Dekking', '', '| Modus | Puzzels |', '|---|---:|']
    lines += [f'| {mode} | {count} |' for mode, count in sorted(counts.items())]
    lines += ['', '## Vastgelegde broncontrole', '', '| Dekking | Aantal |', '|---|---:|']
    lines += [f'| {name} | {count} |' for name, count in sorted(coverage.items())]
    lines += ['', '## Controlesignalen', '', '| Signaal | Vraagteksten |', '|---|---:|']
    lines += [f'| {flag} | {count} |' for flag, count in sorted(flags.items())]
    lines += ['', 'Een ingevulde bron of bewijszin betekent niet dat de bron tijdens deze ronde is gecontroleerd. Een oude open auditmelding moet opnieuw worden beoordeeld; zij is geen automatisch afkeuringsbesluit.', '',
              '## Vragen die aandacht vragen', '', '| Vraag | Antwoord(en) | Signalen | Vindplaatsen |', '|---|---|---|---|']
    priority = {'conflicting_answers': 0, 'missing_source': 1, 'missing_evidence': 2,
                'historical_open_issue_requires_recheck': 3, 'historical_review_warning': 4}
    queue = sorted((q for q in questions if q['flags']), key=lambda q: (
        not q['active_in_inventoried_modes'],
        min(priority.get(f, 9) for f in q['flags']), q['question_nl']))
    for q in queue[:50]:
        if q['flags']:
            label = q['question_nl'].replace('|', '\\|').replace('\n', ' ')
            lines.append(f'| {label} | {q["answers"]} | {", ".join(q["flags"])} | {", ".join(q["locations"][:4])} |')
    lines += ['', f'Getoond: maximaal 50 van {len(queue)} vraagteksten met controlesignalen, actieve vragen eerst. De volledige wachtrij staat in de JSON.',
              'Ontbrekende controlevelden of datums zijn ontbrekend bewijs in de administratie, geen bewijs dat een antwoord fout is. Oude waarschuwingen kunnen inmiddels zijn opgelost.', '']
    lines += ['', '## Moeilijkheid', '',
              'De bestaande niveaus zijn redactioneel. Grote getallen en het getal 1 worden alleen als handmatige controlesignalen gemeld; zij maken een puzzel niet automatisch slecht of moeilijk.',
              'Kennis van het onderwerp, herkenbaarheid, schatbaarheid en plezier zijn niet betrouwbaar uit het antwoordgetal af te leiden. Beoordeel die per vraag en test ze met nieuwe spelers.', '',
              'Aanbevolen puzzelcontrole: minstens één herkenbaar anker; de andere antwoorden moeten te benaderen zijn; de som moet helpen; geen drie specialistische feiten; een verrassende maar verdedigbare onthulling.', '',
              f'Niet gekoppelde historische open punten: {len(catalog["unmatched_historical_open_items"])}. Zie JSON voor de volledige provenance.', '']
    return '\n'.join(lines)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='Fail if generated inventory is absent or stale; do not write.')
    args = parser.parse_args()
    catalog = build()
    outputs = {'content_catalog.json': json.dumps(catalog, ensure_ascii=False, indent=2) + '\n',
               'content_quality.md': markdown(catalog)}
    stale = []
    for name, content in outputs.items():
        path = OUT / name
        if args.check:
            if not path.exists() or path.read_text(encoding='utf-8') != content:
                stale.append(name)
        else:
            path.write_text(content, encoding='utf-8')
    print(f'{len(catalog["questions"])} question texts; {len(catalog["puzzles"])} puzzles; inventory ' + ('STALE: ' + ', '.join(stale) if stale else 'OK'))
    return 1 if stale else 0


if __name__ == '__main__':
    sys.exit(main())
