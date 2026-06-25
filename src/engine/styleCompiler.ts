import type { SoundProfile, SoundProfileCadence, SoundProfileJob, SoundProfileLength, SoundProfileTexture } from './soundProfile';

type StyleFeel = 'balanced' | 'gentle' | 'strong' | 'lyrical';
type StyleDistinctiveness = 'familiar' | 'balanced' | 'distinctive';
type NormalizedStyleInput = Required<StyleInput>;

export interface StyleInput {
  readonly feel?: StyleFeel;
  readonly length?: SoundProfileLength;
  readonly distinctiveness?: StyleDistinctiveness;
}

const COMPILER_ID: SoundProfile['source']['compiler'] = 'name-forge:style-compiler@0.1.0';
const STYLE_JOB: SoundProfileJob = 'fiction-cast';

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

function compilePhonotactics(style: NormalizedStyleInput): SoundProfile['phonotactics'] {
  const base: SoundProfile['phonotactics'] = {
    preferredSyllableShapes: ['CV', 'CVC', 'CVL'],
    onsetWeight: 0.72,
    codaWeight: 0.46,
    liquidWeight: 0.34,
    glideWeight: 0.18,
    clusterTolerance: 0.22,
  };

  if (style.feel === 'gentle') {
    return {
      ...base,
      codaWeight: 0.32,
      liquidWeight: 0.46,
      clusterTolerance: 0.14,
    };
  }

  if (style.feel === 'strong') {
    return {
      ...base,
      codaWeight: 0.58,
      clusterTolerance: 0.36,
    };
  }

  if (style.feel === 'lyrical') {
    return {
      ...base,
      preferredSyllableShapes: ['CV', 'CVL', 'V'],
      liquidWeight: 0.52,
      glideWeight: 0.3,
      clusterTolerance: 0.18,
    };
  }

  return base;
}

export function compileStyle(input: StyleInput = {}): SoundProfile {
  const style = normalizeStyleInput(input);

  return {
    contract: 'SoundProfile',
    version: 1,
    id: `sound-profile:${STYLE_JOB}:${style.feel}:${style.length}:${style.distinctiveness}`,
    source: {
      kind: 'style-input',
      job: STYLE_JOB,
      compiler: COMPILER_ID,
    },
    targets: {
      length: style.length,
      syllableCount: syllableCounts[style.length],
      texture: textureByFeel[style.feel],
      distinctiveness: distinctivenessTargets[style.distinctiveness],
      cadences: cadencesByLength[style.length],
    },
    phonotactics: compilePhonotactics(style),
  };
}
