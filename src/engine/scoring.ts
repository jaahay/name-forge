import type { NameGenerationPlan, NameGenerationSettings, NameScores, ScoreKey, StylePack } from './types';
import { clamp, lerp } from './random';

const scoreWeights: Record<ScoreKey, number> = { pronounceability: 0.22, memorability: 0.16, novelty: 0.12, culturalAnchoring: 0.12, orthographicNaturalness: 0.14, styleFit: 0.1 };

const vowels = new Set(['a', 'e', 'i', 'o', 'u', 'y']);

function countVowels(name: string): number { return [...name.toLowerCase()].filter((letter) => vowels.has(letter)).length; }
function longestConsonantRun(name: string): number {
  let current = 0;
  let longest = 0;
  for (const letter of name.toLowerCase()) {
    if (/[a-z]/.test(letter) && !vowels.has(letter)) {
      current += 1;
      longest = Math.max(longest, current);
    } else current = 0;
  }
  return longest;
}
function containsForbiddenFragment(name: string, pack: StylePack): boolean { return pack.phonotactics.forbiddenFragments.some((fragment) => name.toLowerCase().includes(fragment)); }
function culturalAnchorScore(name: string, pack: StylePack): number {
  const lower = name.toLowerCase();
  const endingScore = pack.phonotactics.preferredEndings.some(({ value }) => lower.endsWith(value)) ? 0.78 : 0.48;
  const rareScore = pack.phonotactics.rareGraphemes.some((fragment) => lower.includes(fragment)) ? 0.7 : 0.54;
  return (endingScore + rareScore) / 2;
}
function styleFitScore(name: string, pack: StylePack): number {
  const lower = name.toLowerCase();
  const endingFit = pack.phonotactics.preferredEndings.some(({ value }) => lower.endsWith(value)) ? 0.26 : 0.08;
  const rareFit = pack.phonotactics.rareGraphemes.some((fragment) => lower.includes(fragment)) ? 0.14 : 0.06;
  return clamp(0.54 + endingFit + rareFit - (containsForbiddenFragment(name, pack) ? 0.3 : 0));
}
function settingWeightedScoreWeights(settings?: NameGenerationSettings): Record<ScoreKey, number> {
  if (!settings) return scoreWeights;
  return {
    pronounceability: lerp(0.08, 0.24, settings.pronounceability),
    memorability: lerp(0.06, 0.24, settings.memorability),
    novelty: lerp(0.05, 0.19, settings.novelty),
    culturalAnchoring: lerp(0.05, 0.19, settings.culturalAnchoring),
    orthographicNaturalness: lerp(0.2, 0.06, settings.orthographicWeirdness),
    styleFit: 0.1,
  };
}
export function combineOverallFit(scores: Pick<NameScores, ScoreKey>, settings?: NameGenerationSettings): number {
  const weights = settingWeightedScoreWeights(settings);
  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
  return clamp((weights.pronounceability * scores.pronounceability + weights.memorability * scores.memorability + weights.novelty * scores.novelty + weights.culturalAnchoring * scores.culturalAnchoring + weights.orthographicNaturalness * scores.orthographicNaturalness + weights.styleFit * scores.styleFit) / totalWeight);
}
export function scoreName(name: string, plan: NameGenerationPlan, pack: StylePack, settings: NameGenerationSettings): NameScores {
  const lower = name.toLowerCase();
  const length = lower.length;
  const vowelRatio = countVowels(lower) / Math.max(length, 1);
  const consonantRun = longestConsonantRun(lower);
  const repeatedLetters = [...lower].filter((letter, index, letters) => letter === letters[index - 1]).length;
  const rareFragments = pack.phonotactics.rareGraphemes.filter((fragment) => lower.includes(fragment)).length;
  const pronounceability = clamp(0.94 - consonantRun * 0.13 - Math.abs(vowelRatio - 0.42) * 0.9 - repeatedLetters * 0.035);
  const memorability = clamp(0.5 + (length >= 5 && length <= 9 ? 0.24 : 0.08) + (plan.rhythm === 'balanced' ? 0.1 : 0.06) + (new Set(lower).size / Math.max(length, 1)) * 0.24);
  const novelty = clamp(0.22 + plan.targetNovelty * 0.45 + rareFragments * 0.18);
  const culturalAnchoring = culturalAnchorScore(name, pack);
  const orthographicNaturalness = clamp(0.92 - (containsForbiddenFragment(name, pack) ? 0.42 : 0) - Math.max(0, consonantRun - 2) * 0.1 - rareFragments * 0.04);
  const styleFit = styleFitScore(name, pack);
  const baseScores = { pronounceability, memorability, novelty, culturalAnchoring, orthographicNaturalness, styleFit };
  return { ...baseScores, overallFit: combineOverallFit(baseScores, settings) };
}
