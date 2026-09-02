import type { IdentityAuditionPhrase } from '../engine/identityAudition';
import type {
  GeneratedName,
  NameFormatKind,
  NameIdentity,
  ReadabilityDiagnostic,
  StylePackSummary,
} from '../engine/types';
import type {
  FictionCastRarityBand,
  FictionCastRarityDistributionPresetKind,
} from './rarity';

export type CastRole = 'protagonist' | 'rival' | 'mentor' | 'sidekick' | 'guardian' | 'outsider' | 'villain' | 'wildcard';
export type CastRolePresetKind = 'none' | 'classic-ensemble' | 'quest-party' | 'court-intrigue';
export type RoleInfluenceLevel = 'off' | 'light' | 'strong';
export type SlotRoleOverrides = Partial<Record<number, CastRole>>;

export type FictionCastFamiliarity = 'unusual' | 'balanced' | 'familiar';
export type FictionCastReadability = 'tricky' | 'balanced' | 'clear';
export type FictionCastCompactness = 'extended' | 'balanced' | 'compact';
export type FictionCastStyleAnchoring = 'loose' | 'balanced' | 'faithful';
export type FictionCastSpellingDistinctiveness = 'conventional' | 'balanced' | 'distinctive';

export interface FictionCastSemanticBaseline {
  readonly familiarity: FictionCastFamiliarity;
  readonly readability: FictionCastReadability;
  readonly compactness: FictionCastCompactness;
  readonly styleAnchoring: FictionCastStyleAnchoring;
  readonly spellingDistinctiveness: FictionCastSpellingDistinctiveness;
}

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

export interface FictionCastSettings {
  readonly castSize: number;
  readonly semanticBaseline: FictionCastSemanticBaseline;
  readonly stylePackId: string;
  readonly seed: string;
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

/**
 * One Fiction Cast product identity composed around an unchanged primitive
 * sound-backed generated name. The compound display identity owns no aggregate
 * sound/spelling evidence; callers reach that evidence through `primaryName` or
 * through the generated parts retained by `identity`.
 */
export interface FictionCastGeneratedName {
  readonly id: string;
  readonly displayName: string;
  readonly primaryName: GeneratedName;
  readonly identity: NameIdentity;
  readonly identityAudition: IdentityAuditionPhrase;
  readonly readabilityDiagnostics: ReadabilityDiagnostic[];
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
