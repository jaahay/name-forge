import { describe, expect, it } from 'vitest';
import { deriveNameChildSeed } from './nameRequest';
import { generateNameResponse } from './nameResponse';

const emptyCriteria = { clauses: [] } as const;

function exactIndependentSet(quantity: number, seed: string, mode?: string) {
  return generateNameResponse({
    version: 1,
    criteria: emptyCriteria,
    ...(mode === undefined ? {} : { mode }),
    quantity: { kind: 'exact', value: quantity },
    grouping: { kind: 'independent-set' },
    random: { seed },
  });
}

describe('shared exact quantity and grouping', () => {
  it('resolves omitted quantity and grouping to singular independent-set behavior', () => {
    const response = generateNameResponse({
      version: 1,
      criteria: emptyCriteria,
      random: { seed: 'default-singular-group-seed' },
    });

    expect(response.names).toHaveLength(1);
    expect(response.request.quantity).toEqual({ kind: 'exact', value: 1 });
    expect(response.request.grouping).toEqual({ kind: 'independent-set' });
    expect(response.grouping).toEqual({
      kind: 'independent-set',
      quantity: 1,
      parentSeed: 'default-singular-group-seed',
      childSeeds: ['default-singular-group-seed'],
    });
  });

  it('returns the exact requested number of flat ordered artifacts', () => {
    const response = exactIndependentSet(4, 'exact-four-seed');

    expect(response.names).toHaveLength(4);
    expect(response.grouping.quantity).toBe(4);
    expect(response.grouping.childSeeds).toHaveLength(4);
    expect(response.names.every((artifact) => artifact.displayText.length > 0)).toBe(true);
  });

  it('derives deterministic index-stable child seeds from the parent seed', () => {
    const response = exactIndependentSet(4, 'child-seed-parent');

    expect(response.grouping.childSeeds).toEqual([
      'child-seed-parent',
      'child-seed-parent:name-request-v1:child:1',
      'child-seed-parent:name-request-v1:child:2',
      'child-seed-parent:name-request-v1:child:3',
    ]);
    expect(response.grouping.childSeeds).toEqual(
      Array.from({ length: 4 }, (_, index) => deriveNameChildSeed('child-seed-parent', index)),
    );
  });

  it('replays the same ordered artifacts and grouping metadata', () => {
    const first = exactIndependentSet(5, 'group-replay-seed');
    const replay = exactIndependentSet(5, first.random.seed);

    expect(replay.grouping).toEqual(first.grouping);
    expect(replay.names).toEqual(first.names);
  });

  it('keeps shorter results as an ordered prefix of larger exact sets', () => {
    const three = exactIndependentSet(3, 'prefix-stability-seed');
    const five = exactIndependentSet(5, 'prefix-stability-seed');

    expect(five.grouping.childSeeds.slice(0, 3)).toEqual(three.grouping.childSeeds);
    expect(five.names.slice(0, 3)).toEqual(three.names);
  });

  it('does not let mode metadata alter plural generation output', () => {
    const fiction = exactIndependentSet(3, 'plural-mode-neutral-seed', 'fiction-cast');
    const npc = exactIndependentSet(3, 'plural-mode-neutral-seed', 'game-npc');

    expect(fiction.request.mode).toBe('fiction-cast');
    expect(npc.request.mode).toBe('game-npc');
    expect(fiction.grouping).toEqual(npc.grouping);
    expect(fiction.names).toEqual(npc.names);
  });

  it('rejects non-positive and non-integral exact quantities', () => {
    for (const value of [0, -1, 1.5]) {
      expect(() => exactIndependentSet(value, `invalid-quantity-${value}`)).toThrow(
        'Exact name quantity must be a positive safe integer.',
      );
    }
  });
});
