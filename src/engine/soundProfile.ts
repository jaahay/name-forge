type StyleJob = 'fiction-cast';
type StyleLength = 'short' | 'medium' | 'long';
type SonicTexture = 'balanced' | 'soft' | 'crisp' | 'fluid';
type SoundCadence = 'compact' | 'balanced' | 'open' | 'rolling';

interface CompiledStyleSource {
  readonly kind: 'style-input';
  readonly job: StyleJob;
  readonly compiler: 'name-forge:style-compiler@0.1.0';
}

interface SoundProfileTargets {
  readonly length: StyleLength;
  readonly syllableCount: {
    readonly min: number;
    readonly max: number;
    readonly preferred: number;
  };
  readonly texture: SonicTexture;
  readonly distinctiveness: number;
  readonly cadences: readonly SoundCadence[];
}

interface SoundProfilePhonotactics {
  readonly preferredSyllableShapes: readonly string[];
  readonly onsetWeight: number;
  readonly codaWeight: number;
  readonly liquidWeight: number;
  readonly glideWeight: number;
  readonly clusterTolerance: number;
}

export interface SoundProfile {
  readonly contract: 'SoundProfile';
  readonly version: 1;
  readonly id: string;
  readonly source: CompiledStyleSource;
  readonly targets: SoundProfileTargets;
  readonly phonotactics: SoundProfilePhonotactics;
}
