import type { SoundCandidate } from './soundGenerator';
import type { SoundProfile } from './soundProfile';
import type { RankedSpellingCandidate } from './spellingGenerator';
import type { SourceDescriptor, SourceValidationIssue, StylePackValidationResult } from './sourceTypes';
import type { StyleDescriptor, StylePackSourceDescriptor } from './stylePackTypes';

export { toNameArtifact } from './nameArtifact';
export type { NameArtifact } from './nameArtifact';
export { analyzeNameArtifact, analyzeNameArtifactSet, analyzeNameArtifactSoundRelationships } from './nameArtifactAnalysis';
export type {
  NameArtifactAnalysis,
  NameArtifactCollision,
  NameArtifactCollisionKind,
  NameArtifactReadabilityAnalysis,
  NameArtifactSetAnalysis,
  NameArtifactSoundEdit,
  NameArtifactSoundRelationship,
  NameArtifactSoundRelationshipKind,
  NameArtifactSpellingAnalysis,
  NameArtifactStructureAnalysis,
} from './nameArtifactAnalysis';
export type { NameCriteria, NameCriteriaClause, NameCriteriaFamily, NameCriteriaPolarity } from './nameCriteria';
export { compileNameCriteriaToGenerationSettings } from './nameCriteriaCompiler';
export type { NameCriteriaCompilerBaseSettings } from './nameCriteriaCompiler';
export { NAME_REQUEST_RANDOMIZATION_ALGORITHM, resolveNameRequest } from './nameRequest';
export type { NameDiagnostic, NameDiagnosticCode, NameDiagnosticKind, NameDiagnosticSeverity, NameRequest, NameRequestInput, NameRequestResolution, NameRequestVersion, NameResponse, RandomizationAlgorithm, RandomizationRequest, RandomizationResult, ResolvedNameRequest } from './nameRequest';
export { generateNameResponse } from './nameResponse';
export type { NameResponseAdapterOptions } from './nameResponse';
export type { AssetKind, CachePolicy, SourceChannel, SourceDescriptor, SourceValidationIssue, SourceValidationSeverity, StylePackValidationResult } from './sourceTypes';
export type { StyleDescriptor, StylePackSourceDescriptor } from './stylePackTypes';
export type { SoundSegmentId } from './starterSoundInventory';

export type ScoreKey =
  | 'pronounceability'
  | 'memorability'
  | 'novelty'
  | 'culturalAnchoring'
  | 'orthographicNaturalness'
  | 'styleFit';
export type NameTexture = 'soft' | 'balanced' | 'hard' | 'liquid';
export type SpellingSelectionPreference = 'plain' | 'distinctive';
export type VariantKind = 'listed' | 'generated';
export type NameVariantRelationship = 'same_pronunciation' | 'near_pronunciation' | 'orthographic_variant' | 'regional_variant' | 'historical_variant' | 'transliteration' | 'cognate' | 'diminutive' | 'nickname' | 'creative_respelling' | 'alias';
export type NameVariantConfidence = 'low' | 'medium' | 'high';
export type SourceKind = 'style-pack' | 'algorithm' | 'listed-source' | 'remote-pack';
export type NameFormatKind = 'given-only' | 'given-family' | 'initials-family' | 'title-name' | 'epithet-place' | 'mixed';
export type NamePartRole = 'given' | 'family' | 'initial' | 'title' | 'epithet' | 'place';
export type ReadabilityDiagnosticSeverity = 'notice' | 'warning';
export type ReadabilityDiagnosticScope = 'name' | 'cast';

export interface ReadabilityDiagnostic { id: string; scope: ReadabilityDiagnosticScope; severity: ReadabilityDiagnosticSeverity; label: string; detail: string; }
export interface NameGenerationSettings { novelty: number; pronounceability: number; memorability: number; culturalAnchoring: number; orthographicWeirdness: number; preferredTexture?: NameTexture; spellingSelectionPreference?: SpellingSelectionPreference; }
export interface GenerationSettings extends NameGenerationSettings { stylePackId: string; seed: string; }
export interface WeightedValue<T = string> { value: T; weight: number; }
export interface NameGenerationPlanPreferences { strength: number; syllableCounts?: Array<WeightedValue<number>>; textures?: Array<WeightedValue<NameTexture>>; }
export interface NameGenerationPlan { id: string; syllableCount: number; stressPattern: string; rhythm: string; shape: string[]; texture: NameTexture; targetNovelty: number; targetLength: 'short' | 'medium' | 'long'; }
export interface NameScores { pronounceability: number; memorability: number; novelty: number; culturalAnchoring: number; orthographicNaturalness: number; styleFit: number; overallFit: number; }
export interface NameVariantSource { id: string; kind: SourceKind; label: string; detail: string; }
export interface NameVariant { value: string; kind: VariantKind; relationship: NameVariantRelationship; confidence: NameVariantConfidence; source: NameVariantSource; locale?: string; generated: boolean; ruleId: string; }
export interface GeneratedNamePartGeneration { soundProfile: SoundProfile; sound: SoundCandidate; spelling: RankedSpellingCandidate; }
export interface GeneratedNamePart { id: string; role: NamePartRole; value: string; sourceNameId: string; sourceName: string; generation?: GeneratedNamePartGeneration; }
export interface NameIdentityPartReference { kind: 'part'; partId: string; role: NamePartRole; }
export interface NameIdentityLiteralPart { kind: 'literal'; value: string; }
export type NameIdentityPhrasePart = NameIdentityPartReference | NameIdentityLiteralPart;
export interface NameFormatRule { id: string; kind: Exclude<NameFormatKind, 'mixed'>; label: string; }
export interface NameIdentity { displayName: string; format: NameFormatRule; parts: GeneratedNamePart[]; phraseParts: readonly NameIdentityPhrasePart[]; }
/** One singular sound-backed generated name. `name` is exactly the selected spelling described by this result's sound/spelling evidence. */
export interface GeneratedName { id: string; name: string; soundProfile: SoundProfile; sound: SoundCandidate; spelling: RankedSpellingCandidate; spellingCandidates: readonly RankedSpellingCandidate[]; generationPlan: NameGenerationPlan; scores: NameScores; variants: NameVariant[]; readabilityDiagnostics: ReadabilityDiagnostic[]; }
export interface SpellingVariantRule { id: string; label: string; from: string; to: string; maxApplications?: number; sourceKind: SourceKind; relationship?: NameVariantRelationship; confidence?: NameVariantConfidence; }
export interface StylePackSummary { id: string; label: string; description: string; source: StylePackSourceDescriptor; style: StyleDescriptor; }
export interface StylePack extends StylePackSummary { version: string; localeHint: string; culturalAnchors: string[]; phonotactics: { onsets: Array<WeightedValue>; nuclei: Array<WeightedValue>; codas: Array<WeightedValue>; preferredEndings: Array<WeightedValue>; rareGraphemes: string[]; forbiddenFragments: string[]; }; formBias: { syllableCounts: Array<WeightedValue<number>>; textures: Array<WeightedValue<NameTexture>>; }; listedVariants: Record<string, string[]>; variantRules: SpellingVariantRule[]; }
export interface NameSourceProvider { id: string; label: string; kind: SourceKind; source: SourceDescriptor; listStylePacks(): StylePackSummary[]; getStylePack(id: string): StylePack | undefined; validateStylePack(id: string): StylePackValidationResult | undefined; }
