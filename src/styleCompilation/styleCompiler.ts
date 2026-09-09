import type {
  SoundProfile,
  SoundProfileCadence,
  SoundProfileLength,
  SoundProfileSegmentPreferences,
  SoundProfileTexture,
} from '../engine/soundProfile';
import { getSoundSegment, starterSoundInventory, type SoundSegmentId } from '../engine/starterSoundInventory';
import type { StylePack, WeightedValue } from '../engine/types';

export interface StyleCompiler<Style> {
  compile(style: Style): SoundProfile;
}

type StyleFeel = 'balanced' | 'gentle' | 'strong' | 'lyrical';
type StyleDistinctiveness = 'familiar' | 'balanced' | 'distinctive';
type NormalizedStyleInput = Required<StyleInput>;
type SegmentRole = keyof SoundProfileSegmentPreferences;

export interface StyleInput {
  readonly feel?: StyleFeel;
  readonly length?: SoundProfileLength;
  readonly distinctiveness?: StyleDistinctiveness;
}

const DEFAULT_STYLE = {
  feel: 'balanced',
  length: 'medium',
  distinctiveness: 'balanced',
} as const satisfies NormalizedStyleInput;

const syllableCounts: Record<SoundProfileLength, SoundProfile['targets']['syllableCount']> = {
  short: { min: 1, max: 2, preferred: 1 },
  medium: { min: 2, max: 3, preferred: 2 },
  long: { min: 3, max: 4, preferred: 3 },
};

const textureByFeel: Record<StyleFeel, SoundProfileTexture> = {
  balanced: 'balanced',
  gentle: 'soft',
  strong: 'crisp',
  lyrical: 'fluid',
};

const distinctivenessTargets: Record<StyleDistinctiveness, number> = {
  familiar: 0.28,
  balanced: 0.5,
  distinctive: 0.72,
};

const cadencesByLength: Record<SoundProfileLength, readonly SoundProfileCadence[]> = {
  short: ['compact', 'balanced'],
  medium: ['balanced', 'open'],
  long: ['rolling', 'open'],
};

function normalizeStyleInput(input: StyleInput): NormalizedStyleInput {
  return {
    feel: input.feel ?? DEFAULT_STYLE.feel,
    length: input.length ?? DEFAULT_STYLE.length,
    distinctiveness: input.distinctiveness ?? DEFAULT_STYLE.distinctiveness,
  };
}

function isSoundSegmentId(value: string): value is SoundSegmentId {
  return Object.prototype.hasOwnProperty.call(starterSoundInventory, value);
}

function compileSegmentPreferences(
  values: readonly WeightedValue[],
  role: SegmentRole,
): SoundProfileSegmentPreferences[SegmentRole] {
  return values.flatMap(({ value, weight }) => {
    if (!isSoundSegmentId(value)) return [];
    if (!getSoundSegment(value).syllableRoles.includes(role)) return [];
    return [{ segmentId: value, weight }];
  });
}

function compilePackSegmentPreferences(pack: StylePack | undefined): SoundProfileSegmentPreferences | undefined {
  if (!pack) return undefined;

  const preferences: SoundProfileSegmentPreferences = {
    onset: compileSegmentPreferences(pack.phonotactics.onsets, 'onset'),
    nucleus: compileSegmentPreferences(pack.phonotactics.nuclei, 'nucleus'),
    coda: compileSegmentPreferences(pack.phonotactics.codas, 'coda'),
  };

  if (preferences.onset.length === 0 && preferences.nucleus.length === 0 && preferences.coda.length === 0) {
    return undefined;
  }

  return preferences;
}

function compilePhonotactics(style: NormalizedStyleInput, pack?: StylePack): SoundProfile['phonotactics'] {
  const base: SoundProfile['phonotactics'] = {
    preferredSyllableShapes: ['CV', 'CVC', 'CVL'],
    onsetWeight: 0.72,
    codaWeight: 0.46,
    liquidWeight: 0.34,
    glideWeight: 0.18,
    clusterTolerance: 0.22,
  };

  let resolved = base;

  if (style.feel === 'gentle') {
    resolved = {
      ...base,
      codaWeight: 0.32,
      liquidWeight: 0.46,
      clusterTolerance: 0.14,
    };
  } else if (style.feel === 'strong') {
    resolved = {
      ...base,
      codaWeight: 0.58,
      clusterTolerance: 0.36,
    };
  } else if (style.feel === 'lyrical') {
    resolved = {
      ...base,
      preferredSyllableShapes: ['CV', 'CVL', 'V'],
      liquidWeight: 0.52,
      glideWeight: 0.3,
      clusterTolerance: 0.18,
    };
  }

  const segmentPreferences = compilePackSegmentPreferences(pack);
  return segmentPreferences ? { ...resolved, segmentPreferences } : resolved;
}

export function compileStyle(input: StyleInput = {}, pack?: StylePack): SoundProfile {
  const style = normalizeStyleInput(input);

  return {
    targets: {
      length: style.length,
      syllableCount: syllableCounts[style.length],
      texture: textureByFeel[style.feel],
      distinctiveness: distinctivenessTargets[style.distinctiveness],
      cadences: cadencesByLength[style.length],
    },
    phonotactics: compilePhonotactics(style, pack),
  };
}

export const basicStyleCompiler: StyleCompiler<StyleInput> = {
  compile: compileStyle,
};
