import { describe, expect, it } from 'vitest';
import { createDefaultRegistry } from '../engine/registry';
import { generateEnsemble } from './ensemble';
import type { FictionCastSettings } from './types';

const settings: FictionCastSettings = {
  castSize: 1,
  semanticBaseline: {
    familiarity: 'balanced',
    readability: 'clear',
    compactness: 'balanced',
    styleAnchoring: 'balanced',
    spellingDistinctiveness: 'conventional',
  },
  stylePackId: 'british-literary-fantasy',
  seed: 'role-generation-boundary',
  nameFormat: 'given-only',
  castVariation: 'balanced',
};

function generate(overrides: Partial<FictionCastSettings>) {
  return generateEnsemble({ ...settings, ...overrides }, createDefaultRegistry()).names[0];
}

describe('Fiction Cast role generation boundary', () => {
  it('keeps Off generation role-neutral even if stale influence and overrides remain', () => {
    const neutral = generate({ rolePreset: 'none', roleInfluence: 'off' });
    const stale = generate({
      rolePreset: 'none',
      roleInfluence: 'strong',
      slotRoleOverrides: { 0: 'villain' },
    });

    expect(stale?.displayName).toBe(neutral?.displayName);
    expect(stale?.primaryName).toEqual(neutral?.primaryName);
    expect(stale?.contextualScores).toEqual(neutral?.contextualScores);
    expect(stale?.role).toBeUndefined();
    expect(stale?.roleInfluence).toBeUndefined();
  });

  it('keeps an empty Custom assignment role-neutral until the slot receives a role', () => {
    const neutral = generate({ rolePreset: 'none', roleInfluence: 'off' });
    const emptyCustom = generate({ rolePreset: 'custom', roleInfluence: 'strong', slotRoleOverrides: {} });
    const assignedCustom = generate({
      rolePreset: 'custom',
      roleInfluence: 'strong',
      slotRoleOverrides: { 0: 'villain' },
    });

    expect(emptyCustom?.displayName).toBe(neutral?.displayName);
    expect(emptyCustom?.primaryName).toEqual(neutral?.primaryName);
    expect(emptyCustom?.contextualScores).toEqual(neutral?.contextualScores);
    expect(emptyCustom?.role).toBeUndefined();
    expect(emptyCustom?.roleInfluence).toBeUndefined();

    expect(assignedCustom?.role).toMatchObject({ role: 'villain', source: 'slot', slot: 1 });
    expect(assignedCustom?.roleInfluence?.level).toBe('strong');
    expect(assignedCustom?.displayName).not.toBe(neutral?.displayName);
  });
});
