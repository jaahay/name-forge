import type { GeneratedName, ReadabilityDiagnostic, StylePackSummary } from '../engine/types';
import type { FictionCastNameFormatKind } from './identityFormat';
import type { IdentityAuditionPhrase } from './identityAudition';
import type { FictionCastMaterializedIdentity } from './identityTypes';
import type { FictionCastRarityBand } from './rarity';
import type { FictionCastVariation } from './variation';

export type CastRole = 'protagonist' | 'rival' | 'mentor' | 'sidekick' | 'guardian' | 'outsider' | 'villain' | 'wildcard';
export type CastRolePresetKind = 'none' | 'classic-ensemble' | 'quest-party' | 'court-intrigue' | 'custom';
export type RoleInfluenceLevel = 'off' | 'light' | 'strong';
export type SlotRoleOverrides = Partial<Record<number, CastRole>>;

export type FictionCastFamiliarity = 'unusual' | 'balanced' | 'familiar';
export type FictionCastReadability = 'tricky' | 'balanced' | 'clear';
export type FictionCastCompactness = 'extended' | 'balanced' | 'compact';
export type FictionCastSpellingDistinctiveness = 'conventional' | 'balanced' | 'distinctive';

export interface FictionCastSemanticBaseline {
  readonly familiarity: FictionCastFamiliarity;
  readonly readability: FictionCastReadability;
  readonly compactness: FictionCastCompactness;
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
  readonly nameFormat?: FictionCastNameFormatKind;
  readonly rolePreset?: CastRolePresetKind;
  readonly roleInfluence?: RoleInfluenceLevel;
  readonly slotRoleOverrides?: SlotRoleOverrides;
  readonly castVariation?: FictionCastVariation;
}

/**
 * Surface-owned generation-time intent evidence. Retaining this on the result
 * keeps later inspection from re-resolving an older identity against changed
 * variation or semantic translation mechanics. The optional result field below
 * preserves compatibility with remembered casts created before this evidence
 * was retained.
 */
export interface FictionCastResolvedIntentEvidence {
  readonly baseline: FictionCastSemanticBaseline;
  readonly castVariation: FictionCastVariation;
  readonly variationDelta: number;
}

/**
 * One Fiction Cast product identity composed around an unchanged primitive
 * sound-backed generated name. The compound display identity owns no aggregate
 * sound/spelling evidence; callers reach that evidence through `primaryName` or
 * through generated components retained by `identity`.
 */
export interface FictionCastGeneratedName {
  readonly id: string;
  readonly displayName: string;
  readonly primaryName: GeneratedName;
  readonly identity: FictionCastMaterializedIdentity;
  readonly identityAudition: IdentityAuditionPhrase;
  readonly readabilityDiagnostics: ReadabilityDiagnostic[];
  readonly role?: CastRoleAssignment;
  readonly roleInfluence?: RoleInfluenceMetadata;
  readonly resolvedIntentEvidence?: FictionCastResolvedIntentEvidence;
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
