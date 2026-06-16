import type { GenerationSettings, NameScores, NameSilhouette, StylePack } from './types';
import { clamp } from './random';

const vowels = new Set(['a', 'e', 'i', 'o', 'u', 'y']);
function countVowels(name: string): number { return [...name.toLowerCase()].filter((letter) => vowels.has(letter)).length; }
function longestConsonantRun(name: string): number { let current = 0; let longest = 0; for (const letter of name.toLowerCase()) { if (/[a-z]/.test(letter) && !vowels.has(letter)) { current += 1; longest = Math.max(longest, current); } else current = 0; } return longest; }
function containsForbiddenFragment(name: string, pack: StylePack): boolean { const lower = name.toLowerCase(); return pack.phonotactics.forbiddenFragments.some((fragment) => lower.includes(fragment)); }
function culturalAnchorScore(name: string, pack: StylePack): number { const lower = name.toLowerCase(); const curatedScore = pack.curatedNames.some((curated) => curated.toLowerCase() === lower) ? 0.96 : 0; const endingScore = pack.phonotactics.preferredEndings.some(({ value }) => lower.endsWith(value)) ? 0.78 : 0.48; const rareScore = pack.phonotactics.rareGraphemes.some((fragment) => lower.includes(fragment)) ? 0.7 : 0.54; return Math.max(curatedScore, (endingScore + rareScore) / 2); }

export function scoreName(name: string, silhouette: NameSilhouette, pack: StylePack, settings: GenerationSettings): NameScores {
  const lower = name.toLowerCase();
  const length = lower.length;
  const vowelRatio = countVowels(lower) / Math.max(length, 1);
  const consonantRun = longestConsonantRun(lower);
  const repeatedLetters = [...lower].filter((letter, index, letters) => letter === letters[index - 1]).length;
  const rareFragments = pack.phonotactics.rareGraphemes.filter((fragment) => lower.includes(fragment)).length;
  const pronounceability = clamp(0.94 - consonantRun * 0.13 - Math.abs(vowelRatio - 0.42) * 0.9 - repeatedLetters * 0.035);
  const memorability = clamp(0.5 + (length >= 5 && length <= 9 ? 0.24 : 0.08) + (silhouette.rhythm === 'balanced' ? 0.1 : 0.06) + (new Set(lower).size / Math.max(length, 1)) * 0.24);
  const novelty = clamp(0.22 + silhouette.targetNovelty * 0.45 + rareFragments * 0.12 + settings.orthographicWeirdness * 0.2);
  const culturalAnchoring = culturalAnchorScore(name, pack);
  const orthographicNaturalness = clamp(0.92 - settings.orthographicWeirdness * 0.18 - (containsForbiddenFragment(name, pack) ? 0.42 : 0) - Math.max(0, consonantRun - 2) * 0.1);
  const plausibility = clamp(pronounceability * 0.32 + memorability * 0.2 + novelty * 0.16 + culturalAnchoring * 0.16 + orthographicNaturalness * 0.16);
  return { pronounceability, memorability, novelty, culturalAnchoring, orthographicNaturalness, plausibility };
}
