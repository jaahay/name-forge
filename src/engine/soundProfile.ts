export type SoundProfileJob = 'fiction-cast';
export type SoundProfileLength = 'short' | 'medium' | 'long';
export type SoundProfileTexture = 'balanced' | 'soft' | 'crisp' | 'fluid';
export type SoundProfileCadence = 'compact' | 'balanced' | 'open' | 'rolling';
export type SoundProfileLexemeKind = 'title' | 'epithet';

export interface SoundProfileLexeme {
  readonly id: string;
  readonly kind: SoundProfileLexemeKind;
  readonly text: string;
}

interface CompiledStyleSource {
  readonly kind: 'style-input';
  readonly job: SoundProfileJob;
  readonly compiler: 'name-forge:style-compiler@0.1.0';
}

interface SoundProfileTargets {
  readonly length: SoundProfileLength;
  readonly syllableCount: {
    readonly min: number;
    readonly max: number;
    readonly preferred: number;
  };
  readonly texture: SoundProfileTexture;
  readonly distinctiveness: number;
  readonly cadences: readonly SoundProfileCadence[];
}

interface SoundProfilePhonotactics {
  readonly preferredSyllableShapes: readonly string[];
  readonly onsetWeight: number;
  readonly codaWeight: number;
  readonly liquidWeight: number;
  readonly glideWeight: number;
  readonly clusterTolerance: number;
}

interface SoundProfileLexicon {
  readonly titles: readonly SoundProfileLexeme[];
  readonly epithets: readonly SoundProfileLexeme[];
}

export interface SoundProfile {
  readonly contract: 'SoundProfile';
  readonly version: 1;
  readonly id: string;
  readonly source: CompiledStyleSource;
  readonly targets: SoundProfileTargets;
  readonly phonotactics: SoundProfilePhonotactics;
  readonly lexicon: SoundProfileLexicon;
}
