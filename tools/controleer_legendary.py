"""Validate the offline selection, translations and web-review provenance."""
from collections import Counter
from datetime import date
import json
from pathlib import Path
import re

from maak_legendary_selectie import load_bank, matches, load_editorial_base

ROOT = Path(__file__).resolve().parents[1]
CONFIRMED = {'verified', 'verified_rounded'}
STATUSES = CONFIRMED | {'requires_external_review', 'checked_unresolved',
                        'rejected_ambiguous', 'rejected_incorrect'}
BAD_ENGLISH = re.compile(
    r'redendor|kongor|zambezir|michelangelo picnic|columns does islam|'
    r'blue finfish|toughest pumpkin|finished in thousands|'
    r'rounded to|according to|approximately\s*\(|'
    r'how many kilometres is (?:lake baikal|lake victoria|the grand canyon)', re.I)


def validate(data):
    bank = load_bank()
    editorial = json.loads((ROOT / 'puzzels/legendary/redactie.json').read_text(encoding='utf8'))
    original = load_editorial_base()
    originals = [q for p in original['puzzles'] for q in p['questions']]
    originals_by_id = {q['id']: q for q in originals}
    replacements = editorial.get('question_replacements', {})
    replacement_edits = {}
    edit_keys = ('question_nl', 'question_en', 'quality', 'quality_reason_nl')
    for old_id, replacement in replacements.items():
        assert old_id in originals_by_id, 'Unknown replaced question'
        replacement_id = replacement['replacement_id']
        assert replacement_id not in replacement_edits, 'Replacement used twice'
        replacement_edits[replacement_id] = replacement
        assert replacement['reason_nl'], 'Replacement reason missing'
        assert editorial['fact_reviews'][replacement_id]['source_status'] in CONFIRMED
    assert set(editorial['question_edits']) == {q['id'] for q in originals}
    for edit in [*editorial['question_edits'].values(), *replacement_edits.values()]:
        en = edit.get('question_en')
        assert isinstance(en, str) and en.strip(), 'Empty question_en'
        assert not BAD_ENGLISH.search(en), f'Known translation error: {en}'
        assert isinstance(edit.get('question_nl'), str) and edit['question_nl'].strip()
    puzzles = data['puzzles']
    assert 0 < len(puzzles) <= data['requested_count'] == 100
    assert data['shortfall'] == 100 - len(puzzles)
    ids, qids, labels, english, facts, semantics = set(), set(), set(), set(), set(), set()
    tiers = Counter()
    for puzzle in puzzles:
        assert puzzle['id'] not in ids, 'Duplicate puzzle ID'
        ids.add(puzzle['id'])
        assert str(puzzle['number']) not in editorial['excluded_puzzles']
        questions = puzzle['questions']
        assert len(questions) == 3
        for question in questions:
            assert type(question['answer']) is int and question['answer'] > 0, 'Positive integer required'
            label = question['question_nl']
            normalized = ' '.join(label.casefold().split())
            en = question.get('question_en')
            assert isinstance(en, str) and en.strip(), f'Empty question_en: {label}'
            assert not BAD_ENGLISH.search(en), f'Known translation error: {en}'
            assert question['id'] not in qids, f'Duplicate ID: {label}'
            assert normalized not in labels, f'Duplicate question: {label}'
            assert en.casefold() not in english, f'Duplicate English question: {en}'
            fact = (question['source_url'].rstrip('/'), question['answer'])
            assert fact not in facts, f'Duplicate sourced value: {label}'
            assert not semantics.intersection(question.get('semantic_keys', [])), f'Duplicate semantic fact: {label}'
            semantics.update(question.get('semantic_keys', []))
            labels.add(normalized)
            english.add(en.casefold())
            qids.add(question['id'])
            facts.add(fact)
            origin = bank[question['bank_question_nl']]
            for key in ('answer', 'source_url', 'id'):
                assert origin[key] == question[key], f'{key} drift: {label}'
            old_id = question.get('replaces_question_id')
            if old_id:
                replacement = replacements[old_id]
                assert question['id'] == replacement['replacement_id'], 'Wrong replacement ID'
                assert question['answer'] == originals_by_id[old_id]['answer'], 'Replacement answer changed'
                edit = {key: replacement[key] for key in edit_keys}
            else:
                edit = editorial['question_edits'][question['id']]
            for key, value in edit.items():
                assert question[key] == value, f'Editorial drift: {label}'
            assert question['quality'] in ('strong', 'normal')
            status = question['source_status']
            assert status in CONFIRMED | {'requires_external_review'}, f'Unresolved selected fact: {label}'
            review = editorial['fact_reviews'].get(question['id'])
            if review:
                assert question['source_review'] == review and status == review['source_status']
            if puzzle['original_tier'] != 'normal' or puzzle['tier'] != 'normal':
                assert status in CONFIRMED, f'High-tier fact not confirmed: {label}'
        values = [q['answer'] for q in questions]
        assert matches(puzzle['operator'], values), f'Invalid equation {puzzle["id"]}'
        assert puzzle['calculation'] == f'{values[0]} {puzzle["operator"]} {values[1]} = {values[2]}'
        assert not (puzzle['operator'] in ('×', '÷') and 1 in values)
        strong = sum(q['quality'] == 'strong' for q in questions)
        expected = {3: 'legendary', 2: 'near-legendary', 1: 'normal'}.get(strong)
        assert expected, 'Three normal questions are forbidden'
        assert puzzle['tier'] == expected, f'Incorrect tier: {puzzle["id"]}'
        tiers[puzzle['tier']] += 1
    assert len(labels) == len(puzzles) * 3
    assert dict(tiers) == data['tier_counts']
    audit = data['editorial_audit']
    reviews = editorial['fact_reviews']
    assert audit['fact_reviews'] == reviews
    required = {q['id'] for p in original['puzzles'] if p['tier'] != 'normal' for q in p['questions']}
    assert required <= set(reviews), 'Original high-tier review missing'
    for review in reviews.values():
        assert review['source_status'] in STATUSES
        assert review['source_url'].startswith(('https://', 'http://'))
        assert date.fromisoformat(review['checked_on']) <= date.today()
        if review['source_status'] in CONFIRMED or review['source_status'].startswith('rejected_'):
            assert review['evidence_nl'], 'Missing evidence sentence'
        else:
            assert review.get('review_note_nl'), 'Missing review limitation'
    statuses = Counter(r['source_status'] for r in reviews.values())
    assert audit['review_attempts'] == len(reviews)
    assert audit['confirmed_facts'] == sum(statuses[s] for s in CONFIRMED)
    assert audit['unresolved_facts'] == statuses['checked_unresolved']
    assert audit['rejected_facts'] == sum(n for s, n in statuses.items() if s.startswith('rejected_'))
    assert audit['excluded_puzzles'] == editorial['excluded_puzzles']
    assert audit.get('question_replacements', {}) == replacements
    assert audit['before_tiers'] == original['tier_counts']
    if 'player_review' in editorial:
        review = editorial['player_review']
        assert data['player_review'] == review
        fixed = set(review['consensus_kept'])
        withdrawn = {c['withdrawn_puzzle_number'] for c in editorial.get('fact_corrections', {}).values()}
        assert len(fixed) == 20 - len(withdrawn) and len(review['reconsidered']) == 22
        assert not fixed.intersection(withdrawn)
        for correction in editorial.get('fact_corrections', {}).values():
            assert type(correction['answer']) is int and correction['answer'] > 0
            assert str(correction['withdrawn_puzzle_number']) in editorial['excluded_puzzles']
        accepted = {int(number) for number, decision in review['reconsidered'].items()
                    if decision['decision'] in ('behouden', 'verbeterd')}
        assert {p['number'] for p in puzzles} == fixed | accepted
        original_puzzles = {p['number']: p for p in original['puzzles']}
        for puzzle in puzzles:
            baseline = original_puzzles[puzzle['number']]
            assert puzzle['operator'] == baseline['operator']
            assert [q['answer'] for q in puzzle['questions']] == [q['answer'] for q in baseline['questions']]
            original_ids = [q['id'] for q in baseline['questions']]
            assert [q.get('replaces_question_id', q['id']) for q in puzzle['questions']] == original_ids
            if puzzle['number'] in fixed:
                assert [q['id'] for q in puzzle['questions']] == original_ids, 'Protected puzzle changed'
        assert {q['replaces_question_id'] for p in puzzles for q in p['questions']
                if 'replaces_question_id' in q} == set(replacements), 'Unused replacement'
    return tiers


def validate_round_two(first, second, editorial):
    """Validate standalone reviewed facts without requiring entries in the old bank."""
    def normalized(text):
        return re.sub(r'[^\w]+', ' ', text.casefold()).strip()

    puzzles = second['puzzles']
    assert len(puzzles) == second['requested_count'] == 30
    assert second['shortfall'] == 0
    assert second['status'] == 'editorial_candidates_not_published'
    ids = {p['id'] for p in first['puzzles']}
    qids = {q['id'] for p in first['puzzles'] for q in p['questions']}
    labels = {lang: {normalized(q[lang]) for p in first['puzzles'] for q in p['questions']}
              for lang in ('question_en', 'question_nl')}
    semantic = {key for p in first['puzzles'] for q in p['questions']
                for key in q.get('semantic_keys', [])}
    facts = {(q.get('source_review', {}).get('source_url', q['source_url']).rstrip('/'), q['answer'])
             for p in first['puzzles'] for q in p['questions']}
    tiers, dates, selected_ids = Counter(), [], set()
    assert second['edition'] == editorial['edition']
    for number, puzzle in enumerate(puzzles, 1):
        assert puzzle['number'] == number and puzzle['id'] not in ids
        ids.add(puzzle['id'])
        assert puzzle['status'] == 'editorial_candidate'
        questions = puzzle['questions']
        assert len(questions) == 3
        assert len({q['topic'] for q in questions}) == 3, 'Dependent subjects'
        assert all(type(q['known_anchor']) is bool for q in questions)
        assert sum(q['known_anchor'] for q in questions) <= 1, 'Two known answers'
        for q in questions:
            assert q['id'] not in qids, f'Duplicate ID: {q["id"]}'
            qids.add(q['id'])
            selected_ids.add(q['id'])
            assert type(q['answer']) is int and q['answer'] > 0, 'Positive integer required'
            for lang in labels:
                assert isinstance(q[lang], str) and q[lang].strip()
                label = normalized(q[lang])
                assert label not in labels[lang], f'Duplicate question: {q[lang]}'
                labels[lang].add(label)
            assert not BAD_ENGLISH.search(q['question_en'])
            assert q['category'] and q['quality_reason_nl']
            assert q['quality'] in ('strong', 'normal')
            assert q['source_status'] in CONFIRMED
            review = editorial['fact_reviews'][q['id']]
            assert review == q['source_review']
            assert review['source_status'] == q['source_status']
            assert review['source_url'] == q['source_url']
            assert review['evidence_nl'] == q['evidence_nl'] and q['evidence_nl'].strip()
            assert q['source_url'].startswith('https://')
            assert date.fromisoformat(review['checked_on']) <= date.today()
            if q['source_status'] == 'verified_rounded':
                assert review['rounding_nl'] and q['question_en'].startswith('About ')
            for key, value in editorial['question_edits'][q['id']].items():
                assert q[key] == value, f'Editorial drift: {q["id"]}'
            assert q['semantic_keys'] and not semantic.intersection(q['semantic_keys'])
            semantic.update(q['semantic_keys'])
            fact = (q['source_url'].rstrip('/'), q['answer'])
            assert fact not in facts, f'Repeated sourced fact: {q["id"]}'
            facts.add(fact)
        values = [q['answer'] for q in questions]
        assert matches(puzzle['operator'], values), f'Invalid equation: {puzzle["id"]}'
        assert puzzle['calculation'] == f'{values[0]} {puzzle["operator"]} {values[1]} = {values[2]}'
        assert not (puzzle['operator'] in ('×', '÷') and 1 in values)
        tier = {3: 'legendary', 2: 'near-legendary', 1: 'normal'}.get(
            sum(q['quality'] == 'strong' for q in questions))
        assert tier and puzzle['tier'] == tier, 'Tier rule violated'
        tiers[tier] += 1
        assert puzzle['play_review'] == editorial['player_review'][str(number)]
        dates.append(date.fromisoformat(puzzle['suggested_daily_date']))
    assert set(editorial['fact_reviews']) == set(editorial['question_edits']) == selected_ids
    assert second['editorial_audit']['fact_reviews'] == editorial['fact_reviews']
    assert second['editorial_audit']['confirmed_facts'] == len(selected_ids) == 90
    assert second['player_review'] == editorial['player_review']
    assert dict(tiers) == second['tier_counts'] == {'legendary': 8, 'near-legendary': 12, 'normal': 10}
    from datetime import timedelta
    assert dates == [date(2026, 12, 16) + timedelta(days=i) for i in range(30)]
    assert second['suggested_daily_window'] == {'start': '2026-12-16', 'end': '2027-01-14', 'scheduled': False}
    return tiers


if __name__ == '__main__':
    data = json.loads((ROOT / 'puzzels/legendary/selectie.json').read_text(encoding='utf8'))
    tiers = validate(data)
    count = len(data['puzzles'])
    print(f'{count} puzzles, {count * 3} unique questions, exact equations and source provenance: OK. Tiers: {dict(tiers)}')
    audit = data['editorial_audit']
    print(f"300 English texts: OK. External reviews: {audit['review_attempts']}; confirmed: {audit['confirmed_facts']}; rejected: {audit['rejected_facts']}; unresolved: {audit['unresolved_facts']}.")
    second = json.loads((ROOT / 'puzzels/legendary/selectie_ronde2.json').read_text(encoding='utf8'))
    editorial = json.loads((ROOT / 'puzzels/legendary/redactie_ronde2.json').read_text(encoding='utf8'))
    print(f'Round 2: 30 puzzles, 90 confirmed unique questions, including cross-round checks: OK. Tiers: {dict(validate_round_two(data, second, editorial))}')
