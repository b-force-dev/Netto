"""Validate the saved editorial selection, without rerunning the search solver."""
from collections import Counter
import json
from pathlib import Path

from maak_legendary_selectie import load_bank, matches

ROOT = Path(__file__).resolve().parents[1]


def validate(data):
    bank = load_bank()
    puzzles = data['puzzles']
    assert len(puzzles) == 100, f'Expected 100, got {len(puzzles)}'
    ids, labels, facts, semantics = set(), set(), set(), set()
    tiers = Counter()
    for puzzle in puzzles:
        assert puzzle['id'] not in ids, 'Duplicate puzzle ID'
        ids.add(puzzle['id'])
        questions = puzzle['questions']
        assert len(questions) == 3
        for question in questions:
            label = question['question_nl']
            normalized = ' '.join(label.casefold().split())
            fact = (question['source_url'].rstrip('/'), question['answer'])
            assert normalized not in labels, f'Duplicate question: {label}'
            assert fact not in facts, f'Duplicate sourced value: {label}'
            assert not semantics.intersection(question.get('semantic_keys', [])), f'Duplicate semantic fact: {label}'
            semantics.update(question.get('semantic_keys', []))
            labels.add(normalized)
            facts.add(fact)
            assert bank[label]['answer'] == question['answer'], f'Answer drift: {label}'
            assert bank[label]['source_url'] == question['source_url'], f'Source drift: {label}'
            assert bank[label]['id'] == question['id'], f'ID drift: {label}'
            assert question['quality'] in ('strong', 'normal')
            assert question['source_status'] == 'requires_external_review'
        values = [q['answer'] for q in questions]
        assert matches(puzzle['operator'], values), f'Invalid equation {puzzle["id"]}'
        assert not (puzzle['operator'] in ('×', '÷') and 1 in values)
        strong = sum(q['quality'] == 'strong' for q in questions)
        expected = {3: 'legendary', 2: 'near-legendary', 1: 'normal'}.get(strong)
        assert expected is not None, 'Three normal questions are forbidden'
        assert puzzle['tier'] == expected, f'Incorrect tier: {puzzle["id"]}'
        tiers[puzzle['tier']] += 1
    assert len(labels) == 300
    return tiers


if __name__ == '__main__':
    data = json.loads((ROOT / 'puzzels/legendary/selectie.json').read_text(encoding='utf8'))
    tiers = validate(data)
    print(f'100 puzzles, 300 unique questions, exact equations and source provenance: OK. Tiers: {dict(tiers)}')
