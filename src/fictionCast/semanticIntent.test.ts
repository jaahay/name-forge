import { describe, expect, it } from 'vitest';
import { createDefaultRegistry } from '../engine/registry';
import { generateEnsemble } from './ensemble';
import {
  fictionCastGenerationSettingUpdateForSemanticControl,
  fictionCastSemanticBaselineFromSettings,
  resolveFictionCastSemanticIntent,
  withFictionCastSemanticControl,
} from './semanticIntent';
import type { CastRoleAssignment, FictionCastSettings } from './types';

const settings: FictionCastSettings = {
  castSize: 4,
  novelty: 0.5,
  pronounceability: 0.7,
  memorability: 0.6,
  culturalAnchoring: 0.65,
  orthographicWeirdness: 0.25,
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
  it('represents the current scalar Configure baseline in surface language', () => {
    expect(fictionCastSemanticBaselineFromSettings(settings)).toEqual({
      familiarity: 0.5,
      readability: 0.7,
      compactness: 0.6,
      styleAnchoring: 0.65,
      spellingDistinctiveness: 0.25,
    });
  });

  it('owns the compatibility mapping from semantic controls to generic generation settings', () => {
    expect(fictionCastGenerationSettingUpdateForSemanticControl('familiarity', 0.48)).toEqual({ key: 'novelty', value: 0.48 });
    expect(fictionCastGenerationSettingUpdateForSemanticControl('readability', 0.72)).toEqual({ key: 'pronounceability', value: 0.72 });
    expect(fictionCastGenerationSettingUpdateForSemanticControl('compactness', 0.65)).toEqual({ key: 'memorability', value: 0.65 });
    expect(fictionCastGenerationSettingUpdateForSemanticControl('styleAnchoring', 0.62)).toEqual({ key: 'culturalAnchoring', value: 0.62 });
    expect(fictionCastGenerationSettingUpdateForSemanticControl('spellingDistinctiveness', 0.28)).toEqual({ key: 'orthographicWeirdness', value: 0.28 });

    expect(withFictionCastSemanticControl(settings, 'familiarity', 0.48)).toEqual({
      ...settings,
      novelty: 0.48,
    });
  });

  it('round-trips the current baseline before contextual shaping', () => {
    const resolved = resolveFictionCastSemanticIntent(settings);

    expect(resolved.baseline).toEqual(fictionCastSemanticBaselineFromSettings(settings));
    expect(resolved.generationSettings).toEqual(settings);
  });

  it('preserves the existing role-influence mechanics behind the semantic boundary', () => {
    const resolved = resolveFictionCastSemanticIntent(
      { ...settings, roleInfluence: 'strong' },
      { role: mentorRole },
    );

    expect(resolved.baseline).toEqual({
      familiarity: 0.5,
      readability: 0.7,
      compactness: 0.6,
      styleAnchoring: 0.65,
      spellingDistinctiveness: 0.25,
    });
    expect(resolved.generationSettings.novelty).toBeCloseTo(0.46);
    expect(resolved.generationSettings.pronounceability).toBeCloseTo(0.73);
    expect(resolved.generationSettings.memorability).toBeCloseTo(0.6);
    expect(resolved.generationSettings.culturalAnchoring).toBeCloseTo(0.74);
    expect(resolved.generationSettings.orthographicWeirdness).toBeCloseTo(0.22);
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
