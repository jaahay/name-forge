import type { NameCriteria, NameCriteriaClause } from './nameCriteria';
import type { GenerationSettings, NameTexture } from './types';

export interface NameCriteriaCompilerBaseSettings {
  readonly seed: string;
  readonly stylePackId: string;
}

const SUPPORTED_SOUND_TEXTURES = new Map<string, NameTexture>([
  ['soft', 'soft'],
  ['crisp', 'hard'],
  ['flowing', 'liquid'],
]);

function normalizedTarget(target: string): string {
  return target.trim().toLowerCase();
}

function criterionStrength(clause: NameCriteriaClause): number {
  if (!Number.isFinite(clause.strength)) {
    return 1;
  }

  return Math.min(1, Math.max(0, clause.strength));
}

function applySoundCriteria(settings: GenerationSettings, clause: NameCriteriaClause): GenerationSettings {
  const preferredTexture = SUPPORTED_SOUND_TEXTURES.get(normalizedTarget(clause.target));

  if (preferredTexture === undefined) {
    return settings;
  }

  return {
    ...settings,
    preferredTexture,
  };
}

function applySpellingCriteria(settings: GenerationSettings, clause: NameCriteriaClause): GenerationSettings {
  const target = normalizedTarget(clause.target);
  const strength = criterionStrength(clause);

  if (target === 'plain') {
    return {
      ...settings,
      orthographicWeirdness: Math.min(settings.orthographicWeirdness, 0.18 + (1 - strength) * 0.12),
      spellingSelectionPreference: 'plain',
    };
  }

  if (target === 'distinctive') {
    return {
      ...settings,
      orthographicWeirdness: Math.max(settings.orthographicWeirdness, 0.72 + strength * 0.1),
      spellingSelectionPreference: 'distinctive',
    };
  }

  return settings;
}

function applyPracticalCriteria(settings: GenerationSettings, clause: NameCriteriaClause): GenerationSettings {
  const target = normalizedTarget(clause.target);
  const strength = criterionStrength(clause);

  if (target === 'easy-to-spell') {
    return {
      ...settings,
      orthographicWeirdness: Math.min(settings.orthographicWeirdness, 0.2 + (1 - strength) * 0.12),
      spellingSelectionPreference: 'plain',
    };
  }

  return settings;
}

function applyCriteriaClause(settings: GenerationSettings, clause: NameCriteriaClause): GenerationSettings {
  if (clause.polarity === 'avoid') {
    return settings;
  }

  if (clause.family === 'sound') {
    return applySoundCriteria(settings, clause);
  }

  if (clause.family === 'spelling') {
    return applySpellingCriteria(settings, clause);
  }

  if (clause.family === 'practical') {
    return applyPracticalCriteria(settings, clause);
  }

  return settings;
}

export function compileNameCriteriaToGenerationSettings(
  criteria: NameCriteria,
  base: NameCriteriaCompilerBaseSettings,
): GenerationSettings {
  const initialSettings: GenerationSettings = {
    castSize: 1,
    novelty: 0.48,
    pronounceability: 0.72,
    memorability: 0.65,
    culturalAnchoring: 0.62,
    orthographicWeirdness: 0.28,
    stylePackId: base.stylePackId,
    seed: base.seed,
    nameFormat: 'given-only',
    rarityDistribution: 'style-pack',
    rolePreset: 'none',
    roleInfluence: 'off',
    slotRoleOverrides: {},
  };

  return criteria.clauses.reduce(applyCriteriaClause, initialSettings);
}
