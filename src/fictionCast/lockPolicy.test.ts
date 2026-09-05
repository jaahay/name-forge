import { describe, expect, it } from 'vitest';
import { createDefaultRegistry } from '../engine/registry';
import { generateEnsemble } from './ensemble';
import {
  fictionCastSettingsChangeAffectsSlot,
  retainedLockedNameIdsAfterSettingsChange,
} from './lockPolicy';
import type { FictionCastSettings } from './types';

const baseSettings: FictionCastSettings = {
  castSize: 4,
  semanticBaseline: {
    familiarity: 'balanced',
    readability: 'clear',
    compactness: 'balanced',
    styleAnchoring: 'balanced',
    spellingDistinctiveness: 'conventional',
  },
  stylePackId: 'british-literary-fantasy',
  seed: 'lock-policy-seed',
  nameFormat: 'given-only',
  castVariation: 'balanced',
  rolePreset: 'none',
  roleInfluence: 'off',
};

function lockedFixture(settings: FictionCastSettings = baseSettings) {
  const ensemble = generateEnsemble(settings, createDefaultRegistry());
  return {
    ensemble,
    lockedIds: new Set(ensemble.names.map((name) => name.id)),
  };
}

describe('Fiction Cast lock invalidation policy', () => {
  it('preserves locks across seed changes', () => {
    const { ensemble, lockedIds } = lockedFixture();
    const nextSettings = { ...baseSettings, seed: 'a-completely-different-seed' };

    expect(fictionCastSettingsChangeAffectsSlot(baseSettings, nextSettings, 0)).toBe(false);
    expect(retainedLockedNameIdsAfterSettingsChange(
      ensemble,
      lockedIds,
      baseSettings,
      nextSettings,
    )).toEqual(lockedIds);
  });

  it('invalidates locked members when a global generation criterion changes', () => {
    const { ensemble, lockedIds } = lockedFixture();
    const nextSettings: FictionCastSettings = {
      ...baseSettings,
      semanticBaseline: {
        ...baseSettings.semanticBaseline,
        familiarity: 'unusual',
      },
    };

    expect(retainedLockedNameIdsAfterSettingsChange(
      ensemble,
      lockedIds,
      baseSettings,
      nextSettings,
    ).size).toBe(0);
  });

  it('invalidates only slots whose effective preset role changes', () => {
    const previous: FictionCastSettings = {
      ...baseSettings,
      rolePreset: 'classic-ensemble',
      roleInfluence: 'light',
    };
    const next: FictionCastSettings = {
      ...previous,
      rolePreset: 'quest-party',
    };
    const { ensemble, lockedIds } = lockedFixture(previous);
    const retained = retainedLockedNameIdsAfterSettingsChange(ensemble, lockedIds, previous, next);

    expect([...retained]).toEqual([
      ensemble.names[0].id,
      ensemble.names[2].id,
    ]);
  });

  it('invalidates influence changes only for members that actually have roles', () => {
    const previous: FictionCastSettings = {
      ...baseSettings,
      rolePreset: 'custom',
      roleInfluence: 'off',
      slotRoleOverrides: { 1: 'mentor' },
    };
    const next: FictionCastSettings = {
      ...previous,
      roleInfluence: 'strong',
    };
    const { ensemble, lockedIds } = lockedFixture(previous);
    const retained = retainedLockedNameIdsAfterSettingsChange(ensemble, lockedIds, previous, next);

    expect([...retained]).toEqual([
      ensemble.names[0].id,
      ensemble.names[2].id,
      ensemble.names[3].id,
    ]);
  });

  it('keeps Cast variation inert for a one-member cast but invalidates it when spread is active', () => {
    const singlePrevious: FictionCastSettings = {
      ...baseSettings,
      castSize: 1,
      castVariation: 'tight',
    };
    const singleNext: FictionCastSettings = {
      ...singlePrevious,
      castVariation: 'wide',
    };
    const singleFixture = lockedFixture(singlePrevious);

    expect(retainedLockedNameIdsAfterSettingsChange(
      singleFixture.ensemble,
      singleFixture.lockedIds,
      singlePrevious,
      singleNext,
    )).toEqual(singleFixture.lockedIds);

    const wideSettings: FictionCastSettings = { ...baseSettings, castVariation: 'wide' };
    expect(fictionCastSettingsChangeAffectsSlot(baseSettings, wideSettings, 0)).toBe(true);
  });
});
