import type { SoundProfile, SoundProfileCadence, SoundProfileLength, SoundProfileTexture } from '../engine/soundProfile';

export interface StyleCompiler<Style> {
  compile(style: Style): SoundProfile;
}

type StyleFeel = 'balanced' | 'gentle' | 'strong' | 'lyrical';
type StyleDistinctiveness = 'familiar' | 'balanced' | 'distinctive';
type NormalizedStyleInput = Required<StyleInput>;

export interface StyleInput {
  readonly feel?: StyleFeel;
  readonly length?: SoundProfileLength;
  readonly distinctiveness?: StyleDistinctiveness;
}

const COMPILER_ID = 'name-forge:style-compiler@0.1.0';

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

function opaqueProfileId(targets: SoundProfile['targets'], phonotactics: SoundProfile['phonotactics']): string {
  const serialized = JSON.stringify({ targets, phonotactics });
  let hash = 2166136261;

  for (let index = 0; index < serialized.length; index += 1) {
    hash ^= serialized.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function compileStyle(input: StyleInput = {}): SoundProfile {
  const style = normalizeStyleInput(input);
  const targets: SoundProfile['targets'] = {
    length: style.length,
    syllableCount: syllableCounts[style.length],
    texture: textureByFeel[style.feel],
    distinctiveness: distinctivenessTargets[style.distinctiveness],
    cadences: cadencesByLength[style.length],
  };
  const phonotactics = compilePhonotactics(style);

  return {
    contract: 'SoundProfile',
    version: 1,
    id: opaqueProfileId(targets, phonotactics),
    source: {
      kind: 'style-input',
      compiler: COMPILER_ID,
    },
    targets,
    phonotactics,
  };
}

export const basicStyleCompiler: StyleCompiler<StyleInput> = {
  compile: compileStyle,
};
