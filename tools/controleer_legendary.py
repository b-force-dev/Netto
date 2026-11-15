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
    assert set(editorial['question_edits']) == {q['id'] for q in originals}
    for edit in editorial['question_edits'].values():
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
            for key, value in editorial['question_edits'][question['id']].items():
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
    assert audit['before_tiers'] == original['tier_counts']
    return tiers


if __name__ == '__main__':
    data = json.loads((ROOT / 'puzzels/legendary/selectie.json').read_text(encoding='utf8'))
    tiers = validate(data)
    count = len(data['puzzles'])
    print(f'{count} puzzles, {count * 3} unique questions, exact equations and source provenance: OK. Tiers: {dict(tiers)}')
    audit = data['editorial_audit']
    print(f"300 English texts: OK. External reviews: {audit['review_attempts']}; confirmed: {audit['confirmed_facts']}; rejected: {audit['rejected_facts']}; unresolved: {audit['unresolved_facts']}.")
