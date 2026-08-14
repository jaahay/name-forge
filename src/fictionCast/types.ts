import type {
  EnsembleDiagnostics,
  GeneratedEnsemble,
  GeneratedName,
  GenerationSettings,
} from '../engine/types';
import {
  isFictionCastRarityBand,
  type FictionCastRarityBand,
  type FictionCastRarityDistributionPresetKind,
} from './rarity';

export interface FictionCastSettings extends GenerationSettings {
  readonly rarityDistribution?: FictionCastRarityDistributionPresetKind;
}

export interface FictionCastContextualScores {
  readonly ensembleFit: number;
  readonly roleFit: number;
  readonly overallFit: number;
}

export interface FictionCastGeneratedName extends GeneratedName {
  readonly contextualScores: FictionCastContextualScores;
  readonly rarityBand: FictionCastRarityBand;
}

export interface FictionCastEnsembleDiagnostics extends EnsembleDiagnostics {
  readonly repeatedRarityBands: number;
}

export interface FictionCastGeneratedEnsemble extends Omit<GeneratedEnsemble, 'settings' | 'names' | 'diagnostics'> {
  readonly settings: FictionCastSettings;
  readonly names: FictionCastGeneratedName[];
  readonly diagnostics: FictionCastEnsembleDiagnostics;
}

export function requireFictionCastGeneratedName(name: GeneratedName): FictionCastGeneratedName {
  const contextualScores = (name as Partial<FictionCastGeneratedName>).contextualScores;
  const rarityBand = (name as Partial<FictionCastGeneratedName>).rarityBand;
  if (!contextualScores || !isFictionCastRarityBand(rarityBand)) {
    throw new Error(`Expected Fiction Cast context for ${name.id}.`);
  }
  return name as FictionCastGeneratedName;
}
