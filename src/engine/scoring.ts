import type { GenerationSettings, NameScores, NameSilhouette, ScoreKey, StylePack } from './types';
import { clamp, lerp } from './random';

const vowels = new Set(['a', 'e', 'i', 'o', 'u', 'y']);
const scoreWeights: Record<ScoreKey, number> = { pronounceability: 0.22, memorability: 0.16, novelty: 0.12, culturalAnchoring: 0.12, orthographicNaturalness: 0.14, styleFit: 0.1, silhouetteFit: 0.08, ensembleFit: 0.06 };

function countVowels(name: string): number { return [...name.toLowerCase()].filter((letter) => vowels.has(letter)).length; }
function countVowelGroups(name: string): number { return Math.max(1, name.toLowerCase().match(/[aeiouy]+/g)?.length ?? 1); }
function longestConsonantRun(name: string): number { let current = 0; let longest = 0; for (const letter of name.toLowerCase()) { if (/[a-z]/.test(letter) && !vowels.has(letter)) { current += 1; longest = Math.max(longest, current); } else current = 0; } return longest; }
function containsForbiddenFragment(name: string, pack: StylePack): boolean { const lower = name.toLowerCase(); return pack.phonotactics.forbiddenFragments.some((fragment) => lower.includes(fragment)); }
function culturalAnchorScore(name: string, pack: StylePack): number { const lower = name.toLowerCase(); const curatedScore = pack.curatedNames.some((curated) => curated.toLowerCase() === lower) ? 0.96 : 0; const endingScore = pack.phonotactics.preferredEndings.some(({ value }) => lower.endsWith(value)) ? 0.78 : 0.48; const rareScore = pack.phonotactics.rareGraphemes.some((fragment) => lower.includes(fragment)) ? 0.7 : 0.54; return Math.max(curatedScore, (endingScore + rareScore) / 2); }
function targetLengthScore(name: string, silhouette: NameSilhouette): number { const range = silhouette.targetLength === 'short' ? [4, 7] : silhouette.targetLength === 'medium' ? [6, 10] : [8, 14]; const [min, max] = range; if (name.length >= min && name.length <= max) return 1; return clamp(1 - Math.min(Math.abs(name.length - min), Math.abs(name.length - max)) * 0.12); }
function styleFitScore(name: string, pack: StylePack): number { const lower = name.toLowerCase(); const endingFit = pack.phonotactics.preferredEndings.some(({ value }) => lower.endsWith(value)) ? 0.26 : 0.08; const rareFit = pack.phonotactics.rareGraphemes.some((fragment) => lower.includes(fragment)) ? 0.14 : 0.06; return clamp(0.54 + endingFit + rareFit - (containsForbiddenFragment(name, pack) ? 0.3 : 0)); }
function silhouetteFitScore(name: string, silhouette: NameSilhouette): number { const syllableFit = clamp(1 - Math.abs(countVowelGroups(name) - silhouette.syllableCount) * 0.18); const textureFit = silhouette.texture === 'hard' && /[kgtdbp]/i.test(name) ? 0.9 : silhouette.texture === 'liquid' && /[lrw]/i.test(name) ? 0.9 : 0.76; return clamp(targetLengthScore(name, silhouette) * 0.44 + syllableFit * 0.4 + textureFit * 0.16); }

function settingWeightedScoreWeights(settings?: GenerationSettings): Record<ScoreKey, number> {
  if (!settings) return scoreWeights;
  return {
    pronounceability: lerp(0.08, 0.24, settings.pronounceability),
    memorability: lerp(0.06, 0.24, settings.memorability),
    novelty: lerp(0.05, 0.19, settings.novelty),
    culturalAnchoring: lerp(0.05, 0.19, settings.culturalAnchoring),
    orthographicNaturalness: lerp(0.2, 0.06, settings.orthographicWeirdness),
    styleFit: 0.1,
    silhouetteFit: 0.08,
    ensembleFit: lerp(0.04, 0.11, settings.memorability),
  };
}

export function combineOverallFit(scores: Pick<NameScores, ScoreKey>, settings?: GenerationSettings): number {
  const weights = settingWeightedScoreWeights(settings);
  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
  return clamp((weights.pronounceability * scores.pronounceability + weights.memorability * scores.memorability + weights.novelty * scores.novelty + weights.culturalAnchoring * scores.culturalAnchoring + weights.orthographicNaturalness * scores.orthographicNaturalness + weights.styleFit * scores.styleFit + weights.silhouetteFit * scores.silhouetteFit + weights.ensembleFit * scores.ensembleFit) / totalWeight);
}

export function scoreName(name: string, silhouette: NameSilhouette, pack: StylePack, settings: GenerationSettings): NameScores {
  const lower = name.toLowerCase();
  const length = lower.length;
  const vowelRatio = countVowels(lower) / Math.max(length, 1);
  const consonantRun = longestConsonantRun(lower);
  const repeatedLetters = [...lower].filter((letter, index, letters) => letter === letters[index - 1]).length;
  const rareFragments = pack.phonotactics.rareGraphemes.filter((fragment) => lower.includes(fragment)).length;
  const pronounceability = clamp(0.94 - consonantRun * 0.13 - Math.abs(vowelRatio - 0.42) * 0.9 - repeatedLetters * 0.035);
  const memorability = clamp(0.5 + (length >= 5 && length <= 9 ? 0.24 : 0.08) + (silhouette.rhythm === 'balanced' ? 0.1 : 0.06) + (new Set(lower).size / Math.max(length, 1)) * 0.24);
  const novelty = clamp(0.22 + silhouette.targetNovelty * 0.45 + rareFragments * 0.18);
  const culturalAnchoring = culturalAnchorScore(name, pack);
  const orthographicNaturalness = clamp(0.92 - (containsForbiddenFragment(name, pack) ? 0.42 : 0) - Math.max(0, consonantRun - 2) * 0.1 - rareFragments * 0.04);
  const styleFit = styleFitScore(name, pack);
  const silhouetteFit = silhouetteFitScore(name, silhouette);
  const ensembleFit = 0.72;
  const baseScores = { pronounceability, memorability, novelty, culturalAnchoring, orthographicNaturalness, styleFit, silhouetteFit, ensembleFit };
  return { ...baseScores, overallFit: combineOverallFit(baseScores, settings) };
}
