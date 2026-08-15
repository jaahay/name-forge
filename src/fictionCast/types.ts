import type {
  GeneratedName,
  GenerationSettings,
  NameFormatKind,
  ReadabilityDiagnostic,
  StylePackSummary,
} from '../engine/types';
import {
  isFictionCastRarityBand,
  type FictionCastRarityBand,
  type FictionCastRarityDistributionPresetKind,
} from './rarity';

export type CastRole = 'protagonist' | 'rival' | 'mentor' | 'sidekick' | 'guardian' | 'outsider' | 'villain' | 'wildcard';
export type CastRolePresetKind = 'none' | 'classic-ensemble' | 'quest-party' | 'court-intrigue';
export type RoleInfluenceLevel = 'off' | 'light' | 'strong';
export type SlotRoleOverrides = Partial<Record<number, CastRole>>;

export interface CastRoleAssignment {
  readonly role: CastRole;
  readonly label: string;
  readonly source: 'preset' | 'slot';
  readonly slot: number;
}

export interface RoleInfluenceMetadata {
  readonly level: Exclude<RoleInfluenceLevel, 'off'>;
  readonly role: CastRole;
  readonly profileId: string;
  readonly label: string;
  readonly strength: number;
  readonly effects: string[];
}

export interface FictionCastSettings extends GenerationSettings {
  readonly castSize: number;
  readonly nameFormat?: NameFormatKind;
  readonly rolePreset?: CastRolePresetKind;
  readonly roleInfluence?: RoleInfluenceLevel;
  readonly slotRoleOverrides?: SlotRoleOverrides;
  readonly rarityDistribution?: FictionCastRarityDistributionPresetKind;
}

export interface FictionCastContextualScores {
  readonly ensembleFit: number;
  readonly roleFit: number;
  readonly overallFit: number;
}

export interface FictionCastGeneratedName extends GeneratedName {
  readonly role?: CastRoleAssignment;
  readonly roleInfluence?: RoleInfluenceMetadata;
  readonly contextualScores: FictionCastContextualScores;
  readonly rarityBand: FictionCastRarityBand;
}

export interface FictionCastEnsembleDiagnostics {
  readonly repeatedInitials: number;
  readonly repeatedEndings: number;
  readonly repeatedCadences: number;
  readonly repeatedRarityBands: number;
  readonly noveltySpread: number;
  readonly readabilityIssues: number;
  readonly readabilityWarnings: number;
  readonly readabilitySummary: string;
  readonly readabilityDiagnostics: ReadabilityDiagnostic[];
  readonly summary: string;
}

export interface FictionCastGeneratedEnsemble {
  readonly settings: FictionCastSettings;
  readonly sourcePack: StylePackSummary;
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
