export type ScoreKey = 'pronounceability' | 'memorability' | 'novelty' | 'culturalAnchoring' | 'orthographicNaturalness';
export type RarityBand = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type NameTexture = 'soft' | 'balanced' | 'hard' | 'liquid';
export type VariantKind = 'curated' | 'generated';
export type SourceKind = 'style-pack' | 'algorithm' | 'curated-list' | 'remote-pack';

export interface GenerationSettings { castSize: number; novelty: number; pronounceability: number; memorability: number; culturalAnchoring: number; orthographicWeirdness: number; stylePackId: string; seed: string; }
export interface WeightedValue<T = string> { value: T; weight: number; }
export interface ProvenanceNote { sourceId: string; sourceKind: SourceKind; label: string; detail: string; }
export interface NameSilhouette { id: string; syllableCount: number; stressPattern: string; rhythm: string; shape: string[]; rarityBand: RarityBand; texture: NameTexture; targetNovelty: number; targetLength: 'short' | 'medium' | 'long'; provenance: ProvenanceNote[]; }
export interface NameScores { pronounceability: number; memorability: number; novelty: number; culturalAnchoring: number; orthographicNaturalness: number; plausibility: number; }
export interface NameVariant { value: string; kind: VariantKind; ruleId: string; provenance: ProvenanceNote; }
export interface GeneratedName { id: string; name: string; silhouette: NameSilhouette; scores: NameScores; variants: NameVariant[]; provenance: ProvenanceNote[]; }
export interface EnsembleDiagnostics { repeatedInitials: number; repeatedEndings: number; noveltySpread: number; summary: string; }
export interface GeneratedEnsemble { settings: GenerationSettings; sourcePack: StylePackSummary; names: GeneratedName[]; diagnostics: EnsembleDiagnostics; }
export interface SpellingVariantRule { id: string; label: string; from: string; to: string; maxApplications?: number; sourceKind: SourceKind; }
export interface StylePackSummary { id: string; label: string; description: string; }
export interface StylePack extends StylePackSummary { version: string; localeHint: string; culturalAnchors: string[]; phonotactics: { onsets: Array<WeightedValue>; nuclei: Array<WeightedValue>; codas: Array<WeightedValue>; preferredEndings: Array<WeightedValue>; rareGraphemes: string[]; forbiddenFragments: string[]; }; silhouetteBias: { syllableCounts: Array<WeightedValue<number>>; textures: Array<WeightedValue<NameTexture>>; rarityBands: Array<WeightedValue<RarityBand>>; }; curatedNames: string[]; curatedVariants: Record<string, string[]>; variantRules: SpellingVariantRule[]; provenance: ProvenanceNote; }
export interface NameSourceProvider { id: string; label: string; kind: SourceKind; listStylePacks(): StylePackSummary[]; getStylePack(id: string): StylePack | undefined; }
