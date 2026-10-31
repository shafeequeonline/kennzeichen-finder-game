import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ALL_STATES, buildPools, makeQuestion, optionCount, shuffle, starsFor, type PlateCode } from './questions.ts';

const plates: PlateCode[] = JSON.parse(readFileSync(new URL('../data/plates.json', import.meta.url), 'utf8'));
const pools = buildPools(plates);

/** Small deterministic generator so failures can be reproduced. */
function seeded(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 2 ** 32;
    return seed / 2 ** 32;
  };
}

test('pools grow with difficulty and never contain official codes', () => {
  assert.equal(pools.leicht.length, 40);
  assert.ok(pools.mittel.length > pools.leicht.length);
  assert.ok(pools.schwer.length > pools.mittel.length);
  const codes = new Set(pools.schwer.map((p) => p.code));
  assert.ok(!codes.has('BD') && !codes.has('THW'));
});

test('easy names are the short names children know', () => {
  const byCode = new Map(pools.leicht.map((p) => [p.code, p]));
  assert.deepEqual(byCode.get('WOB'), { code: 'WOB', name: 'Wolfsburg', state: 'Niedersachsen' });
  assert.equal(byCode.get('F')?.name, 'Frankfurt');
  assert.equal(byCode.get('M')?.state, 'Bayern');
});

test('hard names drop administrative prefixes and prefer the historic town', () => {
  const byCode = new Map(pools.schwer.map((p) => [p.code, p]));
  assert.equal(byCode.get('AIB')?.name, 'Bad Aibling');
  assert.equal(byCode.get('AB')?.name, 'Aschaffenburg');
});

test('every state appears in the plate data', () => {
  assert.deepEqual([...new Set(pools.schwer.map((p) => p.state))].sort(), [...ALL_STATES].sort());
});

for (const difficulty of ['leicht', 'mittel', 'schwer'] as const) {
  for (const kind of ['city', 'state'] as const) {
    test(`${kind} questions on ${difficulty} have distinct options including the answer`, () => {
      const rng = seeded(42);
      for (let i = 0; i < 200; i++) {
        const q = makeQuestion(kind, pools[difficulty], difficulty, rng);
        assert.equal(q.options.length, optionCount(difficulty));
        assert.equal(new Set(q.options).size, q.options.length);
        assert.ok(q.options.includes(q.answer));
        assert.equal(q.answer, kind === 'city' ? q.place.name : q.place.state);
      }
    });
  }
}

test('questions avoid codes already asked while fresh ones remain', () => {
  const rng = seeded(7);
  const asked = new Set<string>();
  for (let i = 0; i < pools.leicht.length; i++) {
    const q = makeQuestion('city', pools.leicht, 'leicht', rng, asked);
    assert.ok(!asked.has(q.place.code));
    asked.add(q.place.code);
  }
  // Once everything was asked, it still produces a question.
  assert.ok(makeQuestion('city', pools.leicht, 'leicht', rng, asked));
});

test('shuffle keeps all items', () => {
  assert.deepEqual(shuffle([1, 2, 3, 4, 5], seeded(1)).sort(), [1, 2, 3, 4, 5]);
});

test('stars: always at least one', () => {
  assert.equal(starsFor(0), 1);
  assert.equal(starsFor(6), 2);
  assert.equal(starsFor(9), 3);
  assert.equal(starsFor(10), 3);
  assert.equal(starsFor(0, 0), 1);
});
