export type ScoreKey = 'pronounceability' | 'memorability' | 'novelty' | 'culturalAnchoring' | 'orthographicNaturalness' | 'styleFit' | 'silhouetteFit' | 'ensembleFit';
export type RarityBand = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type NameTexture = 'soft' | 'balanced' | 'hard' | 'liquid';
export type VariantKind = 'listed' | 'generated';
export type SourceKind = 'style-pack' | 'algorithm' | 'listed-source' | 'remote-pack';
export type NameFormatKind = 'given-only' | 'given-family' | 'initials-family' | 'title-name' | 'epithet-place' | 'mixed';
export type NamePartRole = 'given' | 'family' | 'initial' | 'title' | 'epithet' | 'place';

export interface GenerationSettings { castSize: number; novelty: number; pronounceability: number; memorability: number; culturalAnchoring: number; orthographicWeirdness: number; stylePackId: string; seed: string; nameFormat?: NameFormatKind; }
export interface WeightedValue<T = string> { value: T; weight: number; }
export interface ProvenanceNote { sourceId: string; sourceKind: SourceKind; label: string; detail: string; }
export interface NameSilhouette { id: string; syllableCount: number; stressPattern: string; rhythm: string; shape: string[]; rarityBand: RarityBand; texture: NameTexture; targetNovelty: number; targetLength: 'short' | 'medium' | 'long'; provenance: ProvenanceNote[]; }
export interface NameScores { pronounceability: number; memorability: number; novelty: number; culturalAnchoring: number; orthographicNaturalness: number; styleFit: number; silhouetteFit: number; ensembleFit: number; overallFit: number; }
export interface NameVariant { value: string; kind: VariantKind; ruleId: string; provenance: ProvenanceNote; }
export interface GeneratedNamePart { id: string; role: NamePartRole; value: string; sourceNameId: string; sourceName: string; provenance: ProvenanceNote[]; }
export interface NameFormatRule { id: string; kind: Exclude<NameFormatKind, 'mixed'>; label: string; pattern: string; provenance: ProvenanceNote; }
export interface NameIdentity { displayName: string; format: NameFormatRule; parts: GeneratedNamePart[]; provenance: ProvenanceNote[]; }
export interface GeneratedName { id: string; name: string; silhouette: NameSilhouette; scores: NameScores; variants: NameVariant[]; provenance: ProvenanceNote[]; identity?: NameIdentity; }
export interface EnsembleDiagnostics { repeatedInitials: number; repeatedEndings: number; repeatedCadences: number; repeatedRarityBands: number; noveltySpread: number; summary: string; }
export interface GeneratedEnsemble { settings: GenerationSettings; sourcePack: StylePackSummary; names: GeneratedName[]; diagnostics: EnsembleDiagnostics; }
export interface SpellingVariantRule { id: string; label: string; from: string; to: string; maxApplications?: number; sourceKind: SourceKind; }
export interface StylePackSummary { id: string; label: string; description: string; }
export interface StylePack extends StylePackSummary { version: string; localeHint: string; culturalAnchors: string[]; phonotactics: { onsets: Array<WeightedValue>; nuclei: Array<WeightedValue>; codas: Array<WeightedValue>; preferredEndings: Array<WeightedValue>; rareGraphemes: string[]; forbiddenFragments: string[]; }; silhouetteBias: { syllableCounts: Array<WeightedValue<number>>; textures: Array<WeightedValue<NameTexture>>; rarityBands: Array<WeightedValue<RarityBand>>; }; listedVariants: Record<string, string[]>; variantRules: SpellingVariantRule[]; provenance: ProvenanceNote; }
export interface NameSourceProvider { id: string; label: string; kind: SourceKind; listStylePacks(): StylePackSummary[]; getStylePack(id: string): StylePack | undefined; }
