"""Combine independent editorial proposals without inventing or changing facts.

python tools/maak_legendary_selectie.py [--count 100] [--check]
This prepares an editorial set; it does not publish or certify source accuracy.
"""
import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path
import re

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
FOLDER = ROOT / 'puzzels/legendary'


def load_bank():
    bank = {}
    for _, row in pd.read_excel(ROOT / 'vragen/vragen_review_compleet.xlsx', sheet_name='Vragen').iterrows():
        text = str(row['Vraag NL']).strip()
        value = row['Antwoord']
        if pd.isna(value) or not float(value).is_integer() or value <= 0:
            continue
        question = {
            'id': f"nr{int(row['Nr'])}", 'question_nl': text,
            'question_en': None if pd.isna(row['Vraag EN (zoekhulp)']) else str(row['Vraag EN (zoekhulp)']),
            'answer': int(value), 'category': str(row['Categorie']),
            'source_url': '' if pd.isna(row['Bron (geverifieerd)']) else str(row['Bron (geverifieerd)']),
            'evidence_nl': '' if pd.isna(row['Bewijszin']) else str(row['Bewijszin']),
            'source_status': 'requires_external_review',
            'recorded_bank_control': None if pd.isna(row['Controle']) else str(row['Controle']),
            'recorded_source_confidence': None if pd.isna(row['Vertrouwen bron']) else str(row['Vertrouwen bron']),
        }
        if text in bank and bank[text]['answer'] != question['answer']:
            raise ValueError(f'Conflicting bank answers: {text}')
        bank.setdefault(text, question)
    return bank


def matches(op, values):
    a, b, c = values
    return {'+': a + b == c, '−': a - b == c, '×': a * b == c,
            '÷': b != 0 and a == b * c}.get(op, False)


def identity(questions):
    # Different phrasings of the same sourced value should not create fake variety.
    return tuple(sorted((q['source_url'].rstrip('/'), q['answer']) for q in questions))


def build(count):
    import numpy as np
    from scipy.optimize import Bounds, LinearConstraint, milp
    from scipy.sparse import lil_matrix
    bank = load_bank()
    proposals = {}
    errors = []
    paths = sorted(FOLDER.glob('kandidaten_[abc].json'))
    if len(paths) != 3:
        raise ValueError('All three independent candidate files must exist.')
    for path in paths:
        agent = path.stem[-1]
        candidates = json.loads(path.read_text(encoding='utf8'))
        if isinstance(candidates, dict):
            candidates = candidates['candidates']
        for candidate in candidates:
            try:
                labels = candidate['question_texts_nl']
                questions = [bank[label.strip()] for label in labels]
                values = [q['answer'] for q in questions]
                assert len(questions) == 3 and len(set(labels)) == 3, 'three distinct questions required'
                assert values == candidate['answers'], 'answer differs from bank'
                assert all(q['source_url'].startswith(('https://', 'http://')) and q['evidence_nl'] for q in questions), 'source/evidence missing'
                op = candidate['operator']
                assert matches(op, values), 'equation does not match'
                assert not (op in ('×', '÷') and 1 in values), 'identity equation'
                assert not any(re.search(r'^(in welk jaar|in welke eeuw)', q['question_nl'], re.I) for q in questions), 'calendar trivia'
                signature = identity(questions)
                entry = proposals.setdefault(signature, {
                    'questions': questions, 'operator': op, 'agents': {}, 'risks': set(),
                })
                previous = entry['agents'].get(agent)
                if previous is None or candidate['score'] > previous['score']:
                    entry['agents'][agent] = {'score': candidate['score'], 'reason_nl': candidate['reason_nl']}
                entry['risks'].update(candidate.get('risks', []))
            except (KeyError, AssertionError, TypeError) as error:
                errors.append({'file': path.name, 'candidate': candidate.get('candidate_id'), 'reason': str(error)})
    ranked = sorted(proposals.values(), key=lambda p: (
        -max(v['score'] for v in p['agents'].values()),
        -len(p['agents']),
        -sum(v['score'] for v in p['agents'].values()) / len(p['agents']),
        identity(p['questions']),
    ))
    # Hard rule: one question and one sourced fact can occur in only one puzzle.
    # Set packing avoids the avoidable shortages produced by greedy selection.
    keys = sorted({('text', q['question_nl']) for p in ranked for q in p['questions']} |
                  {('fact', q['source_url'].rstrip('/') + ':' + str(q['answer']))
                   for p in ranked for q in p['questions']})
    row_of = {key: i for i, key in enumerate(keys)}
    matrix = lil_matrix((len(keys) + 1, len(ranked)))
    for j, p in enumerate(ranked):
        for q in p['questions']:
            matrix[row_of[('text', q['question_nl'])], j] = 1
            matrix[row_of[('fact', q['source_url'].rstrip('/') + ':' + str(q['answer']))], j] += 1
        matrix[-1, j] = 1
    objective = np.array([-(10000 + max(v['score'] for v in p['agents'].values()) +
                           len(p['agents']) / 100) for p in ranked])
    upper = np.array([1] * len(keys) + [count])
    result = milp(objective, integrality=np.ones(len(ranked)), bounds=Bounds(0, 1),
                  constraints=LinearConstraint(matrix.tocsc(), 0, upper),
                  options={'time_limit': 45, 'mip_rel_gap': 0})
    if result.x is None:
        raise ValueError('No feasible unique selection found.')
    selected = []
    for entry in [p for i, p in enumerate(ranked) if result.x[i] > .5]:
        entry = {**entry, 'risks': sorted(entry['risks'])}
        digest = hashlib.sha256(json.dumps(identity(entry['questions'])).encode()).hexdigest()[:12]
        entry.update(id='legendary-' + digest, number=len(selected) + 1,
                     status='editorial_candidate', source_status='requires_external_review',
                     calculation=f"{entry['questions'][0]['answer']} {entry['operator']} {entry['questions'][1]['answer']} = {entry['questions'][2]['answer']}")
        selected.append(entry)
    return {
        'edition': 'legendary-editorial-v1', 'status': 'editorial_candidates_not_published',
        'selection_policy': 'Independent proposals; exact existing answers; every question and sourced fact used at most once. Agent agreement is not verification.',
        'requested_count': count, 'shortfall': max(0, count - len(selected)),
        'solver_status': result.message,
        'source_policy': 'Existing sources and evidence preserved; external recheck and rounding/definition review required before publication.',
        'candidate_count': sum(len(p['agents']) for p in proposals.values()),
        'unique_proposed_triples': len(proposals), 'rejected_proposals': errors,
        'puzzles': selected,
    }


def report(data):
    puzzles = data['puzzles']
    lines = ['# Legendary — redactionele selectie', '',
             f"{len(puzzles)} concrete puzzels; doel {data['requested_count']}; tekort {data['shortfall']}; {data['unique_proposed_triples']} unieke voorgestelde combinaties.",
             '', 'Dit zijn redactionele kandidaten. Bronnen zijn overgenomen uit de bank, niet allemaal opnieuw extern bevestigd. De reeks is nog niet gepubliceerd.',
             'Overeenstemming tussen agents is een selectiesignaal, geen bewijs van juistheid of speelplezier.',
             'Harde regel: elke vraag en elk bronfeit komt maximaal in één puzzel voor. Een tekort wordt gemeld, niet met herhaling opgevuld.',
             '', '| Nr. | Vragen | Som | Agents | Waarom |', '|---|---|---|---|---|']
    for p in puzzles:
        questions = '<br>'.join('[' + q['question_nl'].replace('|', '/') + '](' + q.get('source_review', {}).get('source_url', q['source_url']) + ')' for q in p['questions'])
        reason = next(iter(p['agents'].values()))['reason_nl'].replace('|', '/')
        tier = p.get('tier', 'voorlopig')
        lines.append(f"| {p['number']} ({tier}) | {questions} | {p['calculation']} | {', '.join(sorted(p['agents']))} | {reason} |")
    if 'editorial_audit' in data:
        audit = data['editorial_audit']
        lines[4:7] = [
            'Alle 300 oorspronkelijke Engelse teksten zijn geredigeerd, inclusief 14 ontbrekende teksten. Ook Nederlandse vragen zijn ingekort en verduidelijkt.',
            'Elke vraag maximaal eenmaal; varianten van hetzelfde onderwerp (bijvoorbeeld chromosomen en chromosomenparen) mogen naast elkaar bestaan.',
            'Antwoorden en bankherkomst zijn ongewijzigd. De website laadt deze reeks niet; niets is gepubliceerd.',
        ]
        lines += ['', '## Eindcontrole ' + audit['review_date'], '',
                  '| Tier | Voor | Na |', '|---|---:|---:|']
        for tier in ('legendary', 'near-legendary', 'normal'):
            lines.append(f"| {tier} | {audit['before_tiers'].get(tier, 0)} | {data['tier_counts'].get(tier, 0)} |")
        lines += ['', f"{len(audit['excluded_puzzles'])} puzzels / {3 * len(audit['excluded_puzzles'])} vragen geschrapt; 0 vragen vervangen. Teksten van geschrapte vragen staan ook in `puzzels/legendary/redactie.json`.",
                  f"{audit['review_attempts']} vragen extern onderzocht; {audit['confirmed_facts']} bevestigd (inclusief expliciet beschreven afrondingen); {audit['rejected_facts']} afgewezen; {audit['unresolved_facts']} niet voldoende bevestigd.",
                  'Alle vragen uit de oorspronkelijke legendary- en bijna-legendary-puzzels zijn onderzocht, ook wanneer de puzzel afviel. Een bronopvraag zonder passende bewijszin telt niet als bevestiging.',
                  'Normale vragen zonder nieuwe controle behouden requires_external_review. De banknotities zijn geen nieuwe feitencontrole.',
                  f"In de overgebleven reeks: {sum(q['source_status'] in ('verified', 'verified_rounded') for p in puzzles for q in p['questions'])} bevestigde vragen en {sum(q['source_status'] == 'requires_external_review' for p in puzzles for q in p['questions'])} normale vragen zonder nieuwe externe bevestiging.",
                  'Een schatting blijft een schatting: de bewijszin vermeldt de bronwaarde, omrekening en afronding. De rekensom met de bestaande speelgetallen is wel exact.',
                  'Sterkte is opnieuw beoordeeld: eenvoudige telvragen, bekende ankers en historische telweetjes zijn normaal. Daardoor zijn ook bevestigde puzzels naar een lagere tier verplaatst.',
                  '', '### Geschrapte combinaties', '', '| Oorspronkelijk nr. | Reden |', '|---|---|']
        for number, reason in audit['excluded_puzzles'].items():
            lines.append(f'| {number} | {reason} |')
        lines += ['', '### Feitencontrole per vraag', '',
                  'Bewijszinnen zijn Nederlandse parafrases van de geraadpleegde webbronnen. Een lege bewijszin betekent dat bevestiging ontbreekt; dat is geen bewijs dat het bankantwoord onjuist is.',
                  '', '| Bank-ID | Status | Datum | Bron en bewijs / beperking |', '|---|---|---|---|']
        for id, review in audit['fact_reviews'].items():
            note = (review['evidence_nl'] or review.get('review_note_nl', '')).replace('|', '/')
            lines.append(f"| {id} | {review['source_status']} | {review['checked_on']} | [Bron]({review['source_url']}) — {note} |")
    lines += ['', '## Publicatiepoort', '',
              'Controleer per feit bronwaarde, definitie, schaal, afronding en NL/EN; laat een tweede redacteur de combinatie beoordelen. Een exact kloppende som maakt een benaderd feit niet exact.',
              'Gebruik deze reeks afzonderlijk: bestaande Library-uniciteit en gespeelde puzzel-IDs mogen niet stilzwijgend worden overschreven.',
              f"Afgewezen voorstellen door structuurcontrole: {len(data['rejected_proposals'])}. Details in de JSON.", '']
    return '\n'.join(lines)


def load_editorial_base():
    """The saved 376e308 selection differs from the older solver input."""
    editorial = json.loads((FOLDER / 'redactie.json').read_text(encoding='utf8'))
    data = editorial['original_selection']
    bank = load_bank()
    for puzzle in data['puzzles']:
        puzzle['questions'] = [{**bank[q['question_nl']], **q} for q in puzzle['questions']]
    return data


def apply_editorial(data):
    """Apply the versioned editorial decisions without altering bank answers."""
    path = FOLDER / 'redactie.json'
    if not path.exists():
        return data
    editorial = json.loads(path.read_text(encoding='utf8'))
    selected = []
    for puzzle in data['puzzles']:
        if str(puzzle['number']) in editorial['excluded_puzzles']:
            continue
        puzzle['original_tier'] = puzzle['tier']
        for question in puzzle['questions']:
            question['bank_question_nl'] = question['question_nl']
            edit = editorial['question_edits'][question['id']]
            assert set(edit) <= {'question_nl', 'question_en', 'quality', 'quality_reason_nl'}
            question.update(edit)
            review = editorial['fact_reviews'].get(question['id'])
            if review:
                question['source_status'] = review['source_status']
                question['source_review'] = review
            # A family marks related facts, not necessarily identical questions.
            # Different answers (e.g. 46 chromosomes / 23 pairs) remain allowed.
            question['semantic_keys'] = [
                key + ':' + str(question['answer']) if key.startswith('reviewfamily:') else key
                for key in question['semantic_keys']]
        strong = sum(q['quality'] == 'strong' for q in puzzle['questions'])
        puzzle['tier'] = {3: 'legendary', 2: 'near-legendary', 1: 'normal'}.get(strong)
        assert puzzle['tier'], 'Three normal questions are forbidden'
        description = '1 sterke schaalvraag' if strong == 1 else f'{strong} sterke schaalvragen'
        puzzle['agents']['a-tier']['reason_nl'] = description + '; overige vragen zijn normale ankers. Redactioneel herbeoordeeld.'
        selected.append(puzzle)
    data['puzzles'] = selected
    data['edition'] = editorial['edition']
    data['shortfall'] = max(0, data['requested_count'] - len(selected))
    data['tier_counts'] = dict(Counter(p['tier'] for p in selected))
    data['selection_policy'] = 'At most 100; quality and confirmed facts take precedence. Each question once; related facts with distinct answers allowed. No all-normal puzzles.'
    data['source_policy'] = 'Bank answers unchanged. Per-question web reviews distinguish confirmed, rounded, rejected and unresolved facts. Normal questions may still require external review.'
    reviews = editorial['fact_reviews']
    statuses = Counter(r['source_status'] for r in reviews.values())
    data['editorial_audit'] = {
        'review_date': editorial['review_date'], 'before_tiers': editorial['before_tiers'],
        'excluded_puzzles': editorial['excluded_puzzles'], 'fact_reviews': reviews,
        'review_attempts': len(reviews),
        'confirmed_facts': statuses['verified'] + statuses['verified_rounded'],
        'unresolved_facts': statuses['checked_unresolved'],
        'rejected_facts': sum(n for s, n in statuses.items() if s.startswith('rejected_')),
    }
    return data


def build_tiers(count):
    """Normalize the saved, reviewed solver result; never rerun it on --check."""
    path = FOLDER / 'tier_selectie_a.json'
    source = json.loads(path.read_text(encoding='utf8'))
    bank = load_bank()
    selected = []
    seen_labels, seen_keys, seen_facts = set(), set(), set()
    for candidate in source['selected_100']:
        questions = []
        assert len(candidate['question_quality']) == 3
        for index, (label, quality) in enumerate(zip(candidate['question_texts_nl'], candidate['question_quality'])):
            question = dict(bank[label])
            assert question['answer'] == candidate['answers'][index]
            assert question['source_url'].startswith(('http://', 'https://'))
            assert question['evidence_nl']
            question['quality'] = quality['quality']
            assert question['quality'] in ('strong', 'normal')
            question['quality_reason_nl'] = quality['reason_nl']
            question['semantic_keys'] = candidate['semantic_keys'][index]
            normalized = ' '.join(label.casefold().split())
            fact = (question['source_url'].rstrip('/'), question['answer'])
            assert normalized not in seen_labels, f'Repeated question: {label}'
            assert fact not in seen_facts, f'Repeated sourced value: {label}'
            assert not seen_keys.intersection(question['semantic_keys']), f'Repeated semantic fact: {label}'
            seen_labels.add(normalized)
            seen_facts.add(fact)
            seen_keys.update(question['semantic_keys'])
            questions.append(question)
        values = [q['answer'] for q in questions]
        assert matches(candidate['operator'], values), f'Invalid equation: {candidate["candidate_id"]}'
        assert not (candidate['operator'] in ('×', '÷') and 1 in values)
        strong = sum(q['quality'] == 'strong' for q in questions)
        tier = {3: 'legendary', 2: 'near-legendary', 1: 'normal'}.get(strong)
        assert tier is not None, 'No all-normal puzzles allowed'
        digest = hashlib.sha256(json.dumps(identity(questions)).encode()).hexdigest()[:12]
        selected.append({
            'id': 'legendary-' + digest, 'number': len(selected) + 1,
            'tier': tier, 'status': 'editorial_candidate',
            'questions': questions, 'operator': candidate['operator'],
            'calculation': f'{values[0]} {candidate["operator"]} {values[1]} = {values[2]}',
            'agents': {'a-tier': {'score': candidate['score'], 'reason_nl': candidate['reason_nl']}},
            'risks': candidate['risks'],
        })
    assert len(selected) == count, f'Expected {count} puzzles, got {len(selected)}'
    assert len(seen_labels) == count * 3
    return {
        'edition': 'legendary-editorial-v1', 'status': 'editorial_candidates_not_published',
        'requested_count': count, 'shortfall': 0,
        'selection_policy': 'Exactly 100; every question and annotated semantic fact once. Prioritize three strong questions, then two, then one. No all-normal triples. Existing Library overlap allowed by user.',
        'source_policy': 'Bank answers unchanged. Source links/evidence preserved, not all independently rechecked. Not automatically published.',
        'quality_policy': source['quality_policy'],
        'solver_stats': source['stats'],
        'selection_input_sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
        'tier_counts': dict(Counter(p['tier'] for p in selected)),
        'unique_proposed_triples': source['stats']['edges'],
        'rejected_proposals': [], 'puzzles': selected,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--count', type=int, default=100)
    parser.add_argument('--check', action='store_true')
    parser.add_argument('--raw', action='store_true', help='Explore the original proposal pool instead of the final tier selection.')
    args = parser.parse_args()
    if args.raw:
        data = build(args.count)
    elif (FOLDER / 'redactie.json').exists():
        if args.count != 100:
            parser.error('The reviewed baseline has target 100; use --raw to explore other counts.')
        data = apply_editorial(load_editorial_base())
    else:
        data = build_tiers(args.count)
    outputs = {FOLDER / 'selectie.json': json.dumps(data, ensure_ascii=False, indent=2) + '\n',
               ROOT / 'docs/audit/legendary_selectie.md': report(data)}
    for path, content in outputs.items():
        if args.check:
            if not path.exists() or path.read_text(encoding='utf8') != content:
                raise SystemExit(f'Stale output: {path}')
        else:
            path.write_text(content, encoding='utf8')
    print(f"{len(data['puzzles'])} selected; {data['unique_proposed_triples']} unique proposed; {len(data['rejected_proposals'])} rejected.")


if __name__ == '__main__':
    main()
