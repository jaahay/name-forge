type StyleJob = 'fiction-cast';
type StyleFeel = 'balanced' | 'gentle' | 'strong' | 'lyrical';
type StyleLength = 'short' | 'medium' | 'long';
type StyleDistinctiveness = 'familiar' | 'balanced' | 'distinctive';

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

export interface StyleInput {
  readonly job?: StyleJob;
  readonly feel?: StyleFeel;
  readonly length?: StyleLength;
  readonly distinctiveness?: StyleDistinctiveness;
}

export interface SoundProfile {
  readonly contract: 'SoundProfile';
  readonly version: 1;
  readonly id: string;
  readonly source: CompiledStyleSource;
  readonly targets: SoundProfileTargets;
  readonly phonotactics: SoundProfilePhonotactics;
}

const COMPILER_ID = 'name-forge:style-compiler@0.1.0' as const;

const DEFAULT_STYLE = {
  job: 'fiction-cast',
  feel: 'balanced',
  length: 'medium',
  distinctiveness: 'balanced',
} as const satisfies Required<StyleInput>;

const syllableCounts: Record<StyleLength, SoundProfileTargets['syllableCount']> = {
  short: { min: 1, max: 2, preferred: 1 },
  medium: { min: 2, max: 3, preferred: 2 },
  long: { min: 3, max: 4, preferred: 3 },
};

const textureByFeel: Record<StyleFeel, SonicTexture> = {
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

const cadencesByLength: Record<StyleLength, readonly SoundCadence[]> = {
  short: ['compact', 'balanced'],
  medium: ['balanced', 'open'],
  long: ['rolling', 'open'],
};

function normalizeStyleInput(input: StyleInput): Required<StyleInput> {
  return {
    job: input.job ?? DEFAULT_STYLE.job,
    feel: input.feel ?? DEFAULT_STYLE.feel,
    length: input.length ?? DEFAULT_STYLE.length,
    distinctiveness: input.distinctiveness ?? DEFAULT_STYLE.distinctiveness,
  };
}

function compilePhonotactics(style: Required<StyleInput>): SoundProfilePhonotactics {
  const base: SoundProfilePhonotactics = {
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
      preferredSyllableShapes: ['CV', 'CVL', 'VCV'],
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
    id: `sound-profile:${style.job}:${style.feel}:${style.length}:${style.distinctiveness}`,
    source: {
      kind: 'style-input',
      job: style.job,
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
