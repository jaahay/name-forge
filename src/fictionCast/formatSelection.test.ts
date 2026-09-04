import { describe, expect, it } from 'vitest';
import {
  resolveMaterializedFormatPlan,
  type MaterializedNameFormatKind,
} from './formatSelection';

const givenFamily: MaterializedNameFormatKind = 'given-family';

function lockedFormats(entries: Array<[number, MaterializedNameFormatKind]>): ReadonlyMap<number, MaterializedNameFormatKind> {
  return new Map(entries);
}

describe('resolveMaterializedFormatPlan', () => {
  it('preplans the whole Mixed cast deterministically without unlocked runs of three', () => {
    const first = resolveMaterializedFormatPlan('mixed', 'format-plan-seed', 24);
    const replay = resolveMaterializedFormatPlan('mixed', 'format-plan-seed', 24);

    expect(replay).toEqual(first);
    expect(first).toHaveLength(24);
    for (let index = 2; index < first.length; index += 1) {
      expect(first[index] === first[index - 1] && first[index] === first[index - 2]).toBe(false);
    }
  });

  it('uses locked formats on both sides when anti-clumping an unlocked slot', () => {
    const rightLocked = resolveMaterializedFormatPlan(
      'mixed',
      'right-locked-format-plan',
      3,
      lockedFormats([[1, givenFamily], [2, givenFamily]]),
    );
    const surrounded = resolveMaterializedFormatPlan(
      'mixed',
      'surrounded-format-plan',
      3,
      lockedFormats([[0, givenFamily], [2, givenFamily]]),
    );
    const leftLocked = resolveMaterializedFormatPlan(
      'mixed',
      'left-locked-format-plan',
      3,
      lockedFormats([[0, givenFamily], [1, givenFamily]]),
    );

    expect(rightLocked[0]).not.toBe(givenFamily);
    expect(surrounded[1]).not.toBe(givenFamily);
    expect(leftLocked[2]).not.toBe(givenFamily);
  });

  it('preserves an existing all-locked triple rather than rewriting remembered identities', () => {
    const plan = resolveMaterializedFormatPlan(
      'mixed',
      'all-locked-format-plan',
      3,
      lockedFormats([[0, givenFamily], [1, givenFamily], [2, givenFamily]]),
    );

    expect(plan).toEqual([givenFamily, givenFamily, givenFamily]);
  });

  it('keeps explicit format choice for unlocked slots while preserving locked identities', () => {
    const plan = resolveMaterializedFormatPlan(
      'given-family',
      'explicit-format-plan',
      3,
      lockedFormats([[1, 'title-name']]),
    );

    expect(plan).toEqual(['given-family', 'title-name', 'given-family']);
  });
});
