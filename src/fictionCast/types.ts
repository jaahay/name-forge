import type { GeneratedEnsemble, GeneratedName } from '../engine/types';

export interface FictionCastContextualScores {
  readonly ensembleFit: number;
  readonly roleFit: number;
  readonly overallFit: number;
}

export interface FictionCastGeneratedName extends GeneratedName {
  readonly contextualScores: FictionCastContextualScores;
}

export interface FictionCastGeneratedEnsemble extends Omit<GeneratedEnsemble, 'names'> {
  readonly names: FictionCastGeneratedName[];
}

export function requireFictionCastGeneratedName(name: GeneratedName): FictionCastGeneratedName {
  if (!('contextualScores' in name)) {
    throw new Error('Expected Fiction Cast contextual scores on generated cast name.');
  }
  return name as FictionCastGeneratedName;
}
