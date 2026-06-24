import { describe, expect, it } from 'vitest';
import type { SoundProfile } from './soundProfile';
import { compileStyle, type StyleInput } from './styleCompiler';

describe('compileStyle', () => {
  it('compiles the default style input into a deterministic SoundProfile', () => {
    const input: StyleInput = {};
    const profile: SoundProfile = compileStyle(input);

    expect(profile).toEqual({
      contract: 'SoundProfile',
      version: 1,
      id: 'sound-profile:fiction-cast:balanced:medium:balanced',
      source: {
        kind: 'style-input',
        job: 'fiction-cast',
        compiler: 'name-forge:style-compiler@0.1.0',
      },
      targets: {
        length: 'medium',
        syllableCount: {
          min: 2,
          max: 3,
          preferred: 2,
        },
        texture: 'balanced',
        distinctiveness: 0.5,
        cadences: ['balanced', 'open'],
      },
      phonotactics: {
        preferredSyllableShapes: ['CV', 'CVC', 'CVL'],
        onsetWeight: 0.72,
        codaWeight: 0.46,
        liquidWeight: 0.34,
        glideWeight: 0.18,
        clusterTolerance: 0.22,
      },
    });
  });

  it('keeps user-facing style input ergonomic while compiling internal sound targets', () => {
    const input: StyleInput = {
      feel: 'lyrical',
      length: 'long',
      distinctiveness: 'distinctive',
    };
    const profile = compileStyle(input);

    expect(profile.id).toBe('sound-profile:fiction-cast:lyrical:long:distinctive');
    expect(profile.targets).toEqual({
      length: 'long',
      syllableCount: {
        min: 3,
        max: 4,
        preferred: 3,
      },
      texture: 'fluid',
      distinctiveness: 0.72,
      cadences: ['rolling', 'open'],
    });
    expect(profile.phonotactics).toEqual({
      preferredSyllableShapes: ['CV', 'CVL', 'VCV'],
      onsetWeight: 0.72,
      codaWeight: 0.46,
      liquidWeight: 0.52,
      glideWeight: 0.3,
      clusterTolerance: 0.18,
    });
  });
});
