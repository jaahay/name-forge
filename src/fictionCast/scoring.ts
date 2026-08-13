import { clamp, lerp } from '../engine/random';
import type { GenerationSettings, NameGenerationPlan, NameScores, RoleInfluenceMetadata, ScoreKey } from '../engine/types';
import { getRolePreferenceProfile } from './roles';
import type { FictionCastContextualScores } from './types';

type FictionCastScoreKey = ScoreKey | 'ensembleFit' | 'roleFit';

function targetLengthScore(name: string, plan: NameGenerationPlan): number {
  const range = plan.targetLength === 'short' ? [4, 7] : plan.targetLength === 'medium' ? [6, 10] : [8, 14];
  const [min, max] = range;
  if (name.length >= min && name.length <= max) return 1;
  return clamp(1 - Math.min(Math.abs(name.length - min), Math.abs(name.length - max)) * 0.12);
}

function weightedMatch<T>(value: T, preferences: Array<{ value: T; weight: number }>): number {
  const maxWeight = Math.max(...preferences.map((preference) => preference.weight), 1);
  const match = preferences.find((preference) => preference.value === value)?.weight ?? 1;
  return clamp(match / maxWeight);
}

export function scoreFictionCastRoleFit(name: string, plan: NameGenerationPlan, influence?: RoleInfluenceMetadata): number {
  if (!influence) return 0.72;
  const profile = getRolePreferenceProfile(influence.role);
  const lengthFit = weightedMatch(plan.targetLength, profile.targetLengths) * targetLengthScore(name, plan);
  const textureFit = weightedMatch(plan.texture, profile.textures);
  const rhythmFit = weightedMatch(plan.rhythm, profile.rhythms);
  const syllableFit = weightedMatch(plan.syllableCount, profile.syllableCounts);
  return clamp(lengthFit * 0.3 + textureFit * 0.28 + rhythmFit * 0.22 + syllableFit * 0.2);
}

function fictionCastScoreWeights(settings: GenerationSettings): Record<FictionCastScoreKey, number> {
  const roleFitWeight = settings.roleInfluence === 'strong' ? 0.12 : settings.roleInfluence === 'light' ? 0.06 : 0;
  return {
    pronounceability: lerp(0.08, 0.24, settings.pronounceability),
    memorability: lerp(0.06, 0.24, settings.memorability),
    novelty: lerp(0.05, 0.19, settings.novelty),
    culturalAnchoring: lerp(0.05, 0.19, settings.culturalAnchoring),
    orthographicNaturalness: lerp(0.2, 0.06, settings.orthographicWeirdness),
    styleFit: 0.1,
    silhouetteFit: 0.08,
    ensembleFit: lerp(0.04, 0.11, settings.memorability),
    roleFit: roleFitWeight,
  };
}

export function combineFictionCastOverallFit(
  scores: Pick<NameScores, ScoreKey>,
  contextualScores: Pick<FictionCastContextualScores, 'ensembleFit' | 'roleFit'>,
  settings: GenerationSettings,
): number {
  const weights = fictionCastScoreWeights(settings);
  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
  return clamp((weights.pronounceability * scores.pronounceability + weights.memorability * scores.memorability + weights.novelty * scores.novelty + weights.culturalAnchoring * scores.culturalAnchoring + weights.orthographicNaturalness * scores.orthographicNaturalness + weights.styleFit * scores.styleFit + weights.silhouetteFit * scores.silhouetteFit + weights.ensembleFit * contextualScores.ensembleFit + weights.roleFit * contextualScores.roleFit) / totalWeight);
}
