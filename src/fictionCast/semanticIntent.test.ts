import { describe, expect, it } from 'vitest';
import { createDefaultRegistry } from '../engine/registry';
import { generateGivenName } from '../naming/givenName';
import { generateEnsemble } from './ensemble';
import { getRolePreferenceProfile } from './roles';
import {
  fictionCastBaselineGenerationSettings,
  fictionCastSemanticBaselineFromSettings,
  resolveFictionCastSemanticIntent,
  withFictionCastSemanticControl,
} from './semanticIntent';
import type { CastRoleAssignment, FictionCastSettings } from './types';

const settings: FictionCastSettings = {
  castSize: 4,
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

  it('owns the compatibility translation from semantic selections to current generation mechanics', () => {
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

  it('resolves the baseline and current slot planning inputs exactly before contextual shaping', () => {
    const resolved = resolveFictionCastSemanticIntent(settings, { resultIndex: 2 });

    expect(resolved.baseline).toEqual(settings.semanticBaseline);
    expect(resolved.generationSettings).toEqual(fictionCastBaselineGenerationSettings(settings));
    expect(resolved.planningPreferences).toEqual({ noveltyOffset: 0 });
  });

  it('preserves the existing role-influence mechanics behind the semantic boundary', () => {
    const resolved = resolveFictionCastSemanticIntent(
      { ...settings, roleInfluence: 'strong' },
      { role: mentorRole, resultIndex: 2 },
    );

    expect(resolved.baseline).toEqual(settings.semanticBaseline);
    expect(resolved.generationSettings.novelty).toBeCloseTo(0.44);
    expect(resolved.generationSettings.pronounceability).toBeCloseTo(0.75);
    expect(resolved.generationSettings.memorability).toBeCloseTo(0.65);
    expect(resolved.generationSettings.culturalAnchoring).toBeCloseTo(0.71);
    expect(resolved.generationSettings.orthographicWeirdness).toBeCloseTo(0.25);
    expect(resolved.planningPreferences.preferenceStrength).toBe(1);
  });

  it('matches the pre-boundary role-shaped generation inputs and output for a representative slot', () => {
    const registry = createDefaultRegistry();
    const roleSettings: FictionCastSettings = { ...settings, roleInfluence: 'light' };
    const profile = getRolePreferenceProfile('mentor');
    const legacyGenerationSettings = {
      novelty: 0.48 + (-0.04 * 0.42),
      pronounceability: 0.72 + (0.03 * 0.42),
      memorability: 0.65,
      culturalAnchoring: 0.62 + (0.09 * 0.42),
      orthographicWeirdness: 0.28 + (-0.03 * 0.42),
      stylePackId: settings.stylePackId,
      seed: settings.seed,
    };
    const legacyPlanningPreferences = {
      noveltyOffset: 0.06,
      preferenceStrength: 0.42,
      syllableCounts: profile.syllableCounts,
      textures: profile.textures,
    };
    const resolved = resolveFictionCastSemanticIntent(roleSettings, { role: mentorRole, resultIndex: 3 });

    expect(resolved.generationSettings).toEqual(legacyGenerationSettings);
    expect(resolved.planningPreferences).toEqual(legacyPlanningPreferences);

    const determinism = { seed: 'legacy-role-shaped-equivalence', resultIndex: 3 } as const;
    const legacyName = generateGivenName({
      settings: legacyGenerationSettings,
      registry,
      determinism,
      preferences: legacyPlanningPreferences,
    });
    const resolvedName = generateGivenName({
      settings: resolved.generationSettings,
      registry,
      determinism,
      preferences: resolved.planningPreferences,
    });

    expect(resolvedName).toEqual(legacyName);
  });

  it('keeps deterministic Fiction Cast generation stable for equivalent inputs', () => {
    const registry = createDefaultRegistry();
    const generationSettings: FictionCastSettings = {
      ...settings,
      castSize: 3,
      nameFormat: 'given-family',
      rolePreset: 'classic-ensemble',
      roleInfluence: 'light',
    };

    const first = generateEnsemble(generationSettings, registry);
    const second = generateEnsemble(generationSettings, registry);

    expect(second.names.map((name) => name.displayName)).toEqual(first.names.map((name) => name.displayName));
    expect(second.names.map((name) => name.primaryName.generationPlan)).toEqual(first.names.map((name) => name.primaryName.generationPlan));
  });
});
