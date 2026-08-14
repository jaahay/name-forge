import { describe, expect, it } from 'vitest';
import { generateName } from '../naming/generator';
import { compileNameCriteriaToGenerationSettings } from './nameCriteriaCompiler';
import {
  deriveNameChildSeed,
  MAX_EXACT_NAME_QUANTITY,
  resolveNameRequest,
} from './nameRequest';
import { generateNameResponse } from './nameResponse';
import { createSeededRandom } from './random';
import { createDefaultRegistry } from './registry';

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

  it('returns the exact requested number of flat ordered artifacts with index-stable identity', () => {
    const response = exactIndependentSet(4, 'exact-four-seed');

    expect(response.names).toHaveLength(4);
    expect(response.grouping.quantity).toBe(4);
    expect(response.grouping.childSeeds).toHaveLength(4);
    expect(response.names.every((artifact) => artifact.displayText.length > 0)).toBe(true);
    expect(response.names.map((artifact) => artifact.id)).toEqual([
      expect.stringMatching(/^name-1-/),
      expect.stringMatching(/^name-2-/),
      expect.stringMatching(/^name-3-/),
      expect.stringMatching(/^name-4-/),
    ]);
    expect(response.names.map((artifact) => artifact.silhouette?.id)).toEqual([
      'silhouette-1',
      'silhouette-2',
      'silhouette-3',
      'silhouette-4',
    ]);
    expect(new Set(response.names.map((artifact) => artifact.id)).size).toBe(4);
  });

  it('keeps artifact ids distinct when generated display values collide', () => {
    const registry = createDefaultRegistry();
    const stylePackId = registry.listStylePacks()[0]?.id;
    if (!stylePackId) throw new Error('Expected a default style pack.');

    const pack = registry.getStylePack(stylePackId);
    const settings = compileNameCriteriaToGenerationSettings(emptyCriteria, {
      seed: 'duplicate-display-parent',
      stylePackId,
    });
    const first = generateName({
      settings,
      pack,
      planningRandom: createSeededRandom('duplicate-display-silhouette'),
      generationRandom: createSeededRandom('duplicate-display-name'),
      index: 0,
    });
    const second = generateName({
      settings,
      pack,
      planningRandom: createSeededRandom('duplicate-display-silhouette'),
      generationRandom: createSeededRandom('duplicate-display-name'),
      index: 1,
    });

    expect(second.name).toBe(first.name);
    expect(second.id).not.toBe(first.id);
    expect(first.id).toMatch(/^name-1-/);
    expect(second.id).toMatch(/^name-2-/);
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

  it('accepts the shared maximum exact quantity during request resolution', () => {
    const resolution = resolveNameRequest({
      version: 1,
      criteria: emptyCriteria,
      quantity: { kind: 'exact', value: MAX_EXACT_NAME_QUANTITY },
      grouping: { kind: 'independent-set' },
      random: { seed: 'maximum-quantity-seed' },
    });

    expect(resolution.request.quantity).toEqual({
      kind: 'exact',
      value: MAX_EXACT_NAME_QUANTITY,
    });
  });

  it('rejects quantities outside the supported exact range', () => {
    for (const value of [0, -1, 1.5, MAX_EXACT_NAME_QUANTITY + 1]) {
      expect(() => resolveNameRequest({
        version: 1,
        criteria: emptyCriteria,
        quantity: { kind: 'exact', value },
        grouping: { kind: 'independent-set' },
        random: { seed: `invalid-quantity-${value}` },
      })).toThrow(`Exact name quantity must be an integer from 1 to ${MAX_EXACT_NAME_QUANTITY}.`);
    }
  });
});
