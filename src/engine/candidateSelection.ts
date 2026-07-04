import type { RankedSpellingCandidate } from './spellingGenerator';
import type { GenerationSettings } from './types';
import { clamp } from './random';

export type CandidateSelectionComponentId =
  | 'ranked_spelling_score'
  | 'plain_spelling_match'
  | 'distinctive_spelling_match';

export interface CandidateSelectionScoreComponent {
  readonly id: CandidateSelectionComponentId;
  readonly value: number;
  readonly weight: number;
  readonly contribution: number;
}

export interface CandidateSelectionScore {
  readonly total: number;
  readonly components: readonly CandidateSelectionScoreComponent[];
}

export interface CandidateSelectionResult<TCandidate> {
  readonly candidate: TCandidate;
  readonly score: CandidateSelectionScore;
}

function roundScore(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function component(id: CandidateSelectionComponentId, value: number, weight: number): CandidateSelectionScoreComponent {
  return {
    id,
    value: roundScore(value),
    weight,
    contribution: roundScore(value * weight),
  };
}

function unusualFragmentCount(candidate: RankedSpellingCandidate): number {
  return candidate.mappings.filter((mapping) => {
    const text = mapping.text.toLowerCase();
    return text.length > 1 || /[hxzq]/.test(text);
  }).length;
}

function extraLetterCount(candidate: RankedSpellingCandidate): number {
  return candidate.mappings.reduce((count, mapping) => count + Math.max(0, mapping.text.length - 1), 0);
}

function plainSpellingMatch(candidate: RankedSpellingCandidate): number {
  return clamp(1 - extraLetterCount(candidate) * 0.22 - unusualFragmentCount(candidate) * 0.08);
}

function distinctiveSpellingMatch(candidate: RankedSpellingCandidate): number {
  return clamp(0.2 + extraLetterCount(candidate) * 0.22 + unusualFragmentCount(candidate) * 0.12);
}

export function scoreRankedSpellingCandidate(
  candidate: RankedSpellingCandidate,
  settings: GenerationSettings,
): CandidateSelectionScore {
  const hasSpellingPreference = settings.spellingSelectionPreference !== undefined;
  const components: CandidateSelectionScoreComponent[] = [
    component('ranked_spelling_score', candidate.score, hasSpellingPreference ? 0.1 : 1),
  ];

  if (settings.spellingSelectionPreference === 'plain') {
    components.push(component('plain_spelling_match', plainSpellingMatch(candidate), 1));
  }

  if (settings.spellingSelectionPreference === 'distinctive') {
    components.push(component('distinctive_spelling_match', distinctiveSpellingMatch(candidate), 1));
  }

  return {
    total: roundScore(components.reduce((total, scoreComponent) => total + scoreComponent.contribution, 0)),
    components,
  };
}

export function selectRankedSpellingCandidate(
  candidates: readonly RankedSpellingCandidate[],
  settings: GenerationSettings,
): CandidateSelectionResult<RankedSpellingCandidate> | undefined {
  return candidates
    .map((candidate) => ({
      candidate,
      score: scoreRankedSpellingCandidate(candidate, settings),
    }))
    .sort((left, right) =>
      right.score.total - left.score.total
      || left.candidate.rank - right.candidate.rank
      || left.candidate.text.localeCompare(right.candidate.text),
    )[0];
}
