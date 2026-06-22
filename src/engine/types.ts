export type ScoreKey =
  | 'pronounceability'
  | 'memorability'
  | 'novelty'
  | 'culturalAnchoring'
  | 'orthographicNaturalness'
  | 'styleFit'
  | 'silhouetteFit'
  | 'ensembleFit'
  | 'roleFit';
export type RarityBand = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type RarityDistributionPresetKind = 'style-pack' | 'grounded' | 'balanced' | 'rare-forward' | 'mythic-arc';
export type NameTexture = 'soft' | 'balanced' | 'hard' | 'liquid';
export type VariantKind = 'listed' | 'generated';
export type NameVariantRelationship =
  | 'same_pronunciation'
  | 'near_pronunciation'
  | 'orthographic_variant'
  | 'regional_variant'
  | 'historical_variant'
  | 'transliteration'
  | 'cognate'
  | 'diminutive'
  | 'nickname'
  | 'creative_respelling'
  | 'alias';
export type NameVariantConfidence = 'low' | 'medium' | 'high';
export type SourceKind = 'style-pack' | 'algorithm' | 'listed-source' | 'remote-pack';
export type SourceDescriptorKind = 'built-in-bundle' | 'local-file' | 'http' | 'api' | 'package' | 'user-pack';
export type SourceOriginKind = 'bundled' | 'file' | 'url' | 'api' | 'package';
export type SourceTrustBoundary = 'bundled-offline' | 'local-user-file' | 'remote-service' | 'third-party-package' | 'user-authored';
export type SourceCapability = 'style-packs' | 'phonotactics' | 'listed-variants' | 'variant-rules' | 'role-profiles';
export type SourceValidationSeverity = 'error' | 'warning';
export type NameFormatKind = 'given-only' | 'given-family' | 'initials-family' | 'title-name' | 'epithet-place' | 'mixed';
export type NamePartRole = 'given' | 'family' | 'initial' | 'title' | 'epithet' | 'place';
export type CastRole = 'protagonist' | 'rival' | 'mentor' | 'sidekick' | 'guardian' | 'outsider' | 'villain' | 'wildcard';
export type CastRolePresetKind = 'none' | 'classic-ensemble' | 'quest-party' | 'court-intrigue';
export type RoleInfluenceLevel = 'off' | 'light' | 'strong';
export type SlotRoleOverrides = Partial<Record<number, CastRole>>;
export type ReadabilityDiagnosticSeverity = 'notice' | 'warning';
export type ReadabilityDiagnosticScope = 'name' | 'cast';

export interface NamingBrief {
  useContext?: string;
  toneWords?: string[];
  desiredAssociations?: string[];
  avoidList?: string[];
  hardConstraints?: string[];
  anchorExamples?: string[];
  notes?: string;
}

export interface BriefInfluenceMetadata {
  summary: string;
  effects: string[];
  matches: string[];
  penalties: string[];
}

export interface ReadabilityDiagnostic {
  id: string;
  scope: ReadabilityDiagnosticScope;
  severity: ReadabilityDiagnosticSeverity;
  label: string;
  detail: string;
}

export interface DataSourceOrigin { kind: SourceOriginKind; value: string; }
export interface DataSourceDescriptor { id: string; label: string; kind: SourceDescriptorKind; version: string; origin: DataSourceOrigin; trustBoundary: SourceTrustBoundary; capabilities: SourceCapability[]; sourceNotes: string; trustNotes: string; }
export interface StylePackSourceDescriptor { descriptor: DataSourceDescriptor; packId: string; packVersion: string; sourcePath: string; licenseNotes: string; styleNotes: string; limitations: string[]; }
export interface SourceValidationIssue { severity: SourceValidationSeverity; path: string; message: string; }
export interface StylePackValidationResult { packId: string; valid: boolean; issues: SourceValidationIssue[]; }

export interface GenerationSettings {
  castSize: number;
  novelty: number;
  pronounceability: number;
  memorability: number;
  culturalAnchoring: number;
  orthographicWeirdness: number;
  stylePackId: string;
  seed: string;
  nameFormat?: NameFormatKind;
  rarityDistribution?: RarityDistributionPresetKind;
  rolePreset?: CastRolePresetKind;
  roleInfluence?: RoleInfluenceLevel;
  slotRoleOverrides?: SlotRoleOverrides;
  brief?: NamingBrief;
}

export interface WeightedValue<T = string> { value: T; weight: number; }
export interface ProvenanceNote { sourceId: string; sourceKind: SourceKind; label: string; detail: string; }
export interface CastRoleAssignment { role: CastRole; label: string; source: 'preset' | 'slot'; slot: number; }
export interface RoleInfluenceMetadata { level: Exclude<RoleInfluenceLevel, 'off'>; role: CastRole; profileId: string; label: string; strength: number; effects: string[]; }
export interface NameSilhouette { id: string; syllableCount: number; stressPattern: string; rhythm: string; shape: string[]; rarityBand: RarityBand; texture: NameTexture; targetNovelty: number; targetLength: 'short' | 'medium' | 'long'; roleInfluence?: RoleInfluenceMetadata; provenance: ProvenanceNote[]; }
export interface NameScores { pronounceability: number; memorability: number; novelty: number; culturalAnchoring: number; orthographicNaturalness: number; styleFit: number; silhouetteFit: number; ensembleFit: number; roleFit: number; overallFit: number; }
export interface NameVariantSource { id: string; kind: SourceKind; label: string; detail: string; }
export interface NameVariant { value: string; kind: VariantKind; relationship: NameVariantRelationship; confidence: NameVariantConfidence; source: NameVariantSource; locale?: string; generated: boolean; ruleId: string; provenance: ProvenanceNote; }
export interface GeneratedNamePart { id: string; role: NamePartRole; value: string; sourceNameId: string; sourceName: string; provenance: ProvenanceNote[]; }
export interface NameFormatRule { id: string; kind: Exclude<NameFormatKind, 'mixed'>; label: string; pattern: string; provenance: ProvenanceNote; }
export interface NameIdentity { displayName: string; format: NameFormatRule; parts: GeneratedNamePart[]; provenance: ProvenanceNote[]; }
export interface GeneratedName { id: string; name: string; silhouette: NameSilhouette; scores: NameScores; variants: NameVariant[]; provenance: ProvenanceNote[]; role?: CastRoleAssignment; roleInfluence?: RoleInfluenceMetadata; briefInfluence?: BriefInfluenceMetadata; readabilityDiagnostics: ReadabilityDiagnostic[]; identity?: NameIdentity; }
export interface EnsembleDiagnostics { repeatedInitials: number; repeatedEndings: number; repeatedCadences: number; repeatedRarityBands: number; noveltySpread: number; readabilityIssues: number; readabilityWarnings: number; readabilitySummary: string; readabilityDiagnostics: ReadabilityDiagnostic[]; summary: string; }
export interface GeneratedEnsemble { settings: GenerationSettings; sourcePack: StylePackSummary; names: GeneratedName[]; diagnostics: EnsembleDiagnostics; }
export interface SpellingVariantRule { id: string; label: string; from: string; to: string; maxApplications?: number; sourceKind: SourceKind; relationship?: NameVariantRelationship; confidence?: NameVariantConfidence; }
export interface StylePackSummary { id: string; label: string; description: string; source: StylePackSourceDescriptor; }
export interface StylePack extends StylePackSummary { version: string; localeHint: string; culturalAnchors: string[]; phonotactics: { onsets: Array<WeightedValue>; nuclei: Array<WeightedValue>; codas: Array<WeightedValue>; preferredEndings: Array<WeightedValue>; rareGraphemes: string[]; forbiddenFragments: string[]; }; silhouetteBias: { syllableCounts: Array<WeightedValue<number>>; textures: Array<WeightedValue<NameTexture>>; rarityBands: Array<WeightedValue<RarityBand>>; }; listedVariants: Record<string, string[]>; variantRules: SpellingVariantRule[]; provenance: ProvenanceNote; }
export interface NameSourceProvider { id: string; label: string; kind: SourceKind; source: DataSourceDescriptor; listStylePacks(): StylePackSummary[]; getStylePack(id: string): StylePack | undefined; validateStylePack(id: string): StylePackValidationResult | undefined; }
