import type { SoundSegmentId } from './starterSoundInventory';

export type SoundProfileLength = 'short' | 'medium' | 'long';
export type SoundProfileTexture = 'balanced' | 'soft' | 'crisp' | 'fluid';
export type SoundProfileCadence = 'compact' | 'balanced' | 'open' | 'rolling';

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

export interface SoundProfileSegmentPreference {
  readonly segmentId: SoundSegmentId;
  readonly weight: number;
}

export interface SoundProfileSegmentPreferences {
  readonly onset: readonly SoundProfileSegmentPreference[];
  readonly nucleus: readonly SoundProfileSegmentPreference[];
  readonly coda: readonly SoundProfileSegmentPreference[];
}

interface SoundProfilePhonotactics {
  readonly preferredSyllableShapes: readonly string[];
  readonly onsetWeight: number;
  readonly codaWeight: number;
  readonly liquidWeight: number;
  readonly glideWeight: number;
  readonly clusterTolerance: number;
  readonly segmentPreferences?: SoundProfileSegmentPreferences;
}

export interface SoundProfile {
  readonly targets: SoundProfileTargets;
  readonly phonotactics: SoundProfilePhonotactics;
}
