import { describe, expect, it } from 'vitest';
import { createDefaultRegistry } from '../engine/registry';
import { generateEnsemble } from './ensemble';
import { getRolePreferenceProfile } from './roles';
import {
  fictionCastBaselineGenerationSettings,
  fictionCastSemanticBaselineFromSettings,
  resolveFictionCastSemanticIntent,
  withFictionCastSemanticControl,
} from './semanticIntent';
import type { CastRoleAssignment, FictionCastSettings } from './types';
import { resolveFictionCastVariationDelta } from './variation';

const settings: FictionCastSettings = {
  castSize: 5,
  semanticBaseline: {
    familiarity: 'balanced',
    readability: 'clear',
    compactness: 'compact',
    styleAnchoring: 'balanced',
    spellingDistinctiveness: 'conventional',
  },
  stylePackId: 'british-literary-fantasy',
  seed: 'semantic-intent',
  nameFormat: 'given-only',
  castVariation: 'balanced',
};

const mentorRole: CastRoleAssignment = {
  role: 'mentor',
  label: 'Mentor',
  source: 'preset',
  slot: 1,
};

describe('Fiction Cast semantic intent', () => {
  it('stores the Configure baseline as discrete surface intent rather than engine fields', () => {
    expect(fictionCastSemanticBaselineFromSettings(settings)).toEqual({
      familiarity: 'balanced',
      readability: 'clear',
      compactness: 'compact',
      styleAnchoring: 'balanced',
      spellingDistinctiveness: 'conventional',
    });
    for (const engineKey of ['novelty', 'pronounceability', 'memorability', 'culturalAnchoring', 'orthographicWeirdness']) {
      expect(engineKey in settings).toBe(false);
    }
  });

  it('owns the compatibility translation from semantic selections to baseline generation mechanics', () => {
    expect(fictionCastBaselineGenerationSettings(settings)).toEqual({
      novelty: 0.48,
      pronounceability: 0.72,
      memorability: 0.65,
      culturalAnchoring: 0.62,
      orthographicWeirdness: 0.28,
      stylePackId: 'british-literary-fantasy',
      seed: 'semantic-intent',
    });

    const updated = withFictionCastSemanticControl(settings, 'familiarity', 'familiar');
    expect(updated.semanticBaseline.familiarity).toBe('familiar');
    expect(settings.semanticBaseline.familiarity).toBe('balanced');
    expect(fictionCastBaselineGenerationSettings(updated).novelty).toBe(0.25);

    if (false) {
      // @ts-expect-error Readability values cannot be assigned to Familiar.
      withFictionCastSemanticControl(settings, 'familiarity', 'clear');
    }
  });

  it('applies Cast variation around the Familiar baseline without changing surface state', () => {
    const slotIndex = 3;
    const variationDelta = resolveFictionCastVariationDelta(settings, slotIndex);
    const resolved = resolveFictionCastSemanticIntent(settings, { slotIndex });

    expect(resolved.baseline).toEqual(settings.semanticBaseline);
    expect(resolved.variationDelta).toBe(variationDelta);
    expect(resolved.generationSettings.novelty).toBeCloseTo(0.48 + variationDelta);
    expect(resolved.planningPreferences).toEqual({});
    expect(settings.semanticBaseline.familiarity).toBe('balanced');
  });

  it('applies role shaping after variation and keeps role planning hints at the same boundary', () => {
    const roleSettings: FictionCastSettings = {
      ...settings,
      castSize: 5,
      castVariation: 'wide',
      roleInfluence: 'strong',
    };
    const slotIndex = 1;
    const variationDelta = resolveFictionCastVariationDelta(roleSettings, slotIndex);
    const resolved = resolveFictionCastSemanticIntent(roleSettings, { role: mentorRole, slotIndex });
    const profile = getRolePreferenceProfile('mentor');

    expect(resolved.generationSettings.novelty).toBeCloseTo(0.48 + variationDelta - 0.04);
    expect(resolved.generationSettings.pronounceability).toBeCloseTo(0.75);
    expect(resolved.generationSettings.memorability).toBeCloseTo(0.65);
    expect(resolved.generationSettings.culturalAnchoring).toBeCloseTo(0.71);
    expect(resolved.generationSettings.orthographicWeirdness).toBeCloseTo(0.25);
    expect(resolved.planningPreferences).toEqual({
      preferenceStrength: 1,
      syllableCounts: profile.syllableCounts,
      textures: profile.textures,
    });
  });

  it('keeps deterministic Fiction Cast generation stable for equivalent inputs', () => {
    const registry = createDefaultRegistry();
    const generationSettings: FictionCastSettings = {
      ...settings,
      castSize: 3,
      nameFormat: 'given-family',
      rolePreset: 'classic-ensemble',
      roleInfluence: 'light',
      castVariation: 'wide',
    };

    const first = generateEnsemble(generationSettings, registry);
    const second = generateEnsemble(generationSettings, registry);

    expect(second.names.map((name) => name.displayName)).toEqual(first.names.map((name) => name.displayName));
    expect(second.names.map((name) => name.primaryName.generationPlan)).toEqual(first.names.map((name) => name.primaryName.generationPlan));
  });
});
