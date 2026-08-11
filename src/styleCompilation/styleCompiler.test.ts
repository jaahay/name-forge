import { describe, expect, it } from 'vitest';
import type { SoundProfile } from '../engine/soundProfile';
import { basicStyleCompiler, compileStyle, type StyleCompiler, type StyleInput } from './styleCompiler';

describe('compileStyle', () => {
  it('compiles the default style input into a deterministic pure SoundProfile value', () => {
    const input: StyleInput = {};
    const profile: SoundProfile = compileStyle(input);

    expect(profile).toEqual({
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
    expect(compileStyle(input)).toEqual(profile);
    expect(Object.prototype.hasOwnProperty.call(profile, 'contract')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(profile, 'version')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(profile, 'id')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(profile, 'source')).toBe(false);
  });

  it('keeps user-facing style input ergonomic while compiling internal sound targets', () => {
    const input: StyleInput = {
      feel: 'lyrical',
      length: 'long',
      distinctiveness: 'distinctive',
    };
    const profile = compileStyle(input);

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
      preferredSyllableShapes: ['CV', 'CVL', 'V'],
      onsetWeight: 0.72,
      codaWeight: 0.46,
      liquidWeight: 0.52,
      glideWeight: 0.3,
      clusterTolerance: 0.18,
    });
    expect(Object.prototype.hasOwnProperty.call(profile, 'lexicon')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(profile, 'contract')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(profile, 'version')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(profile, 'id')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(profile, 'source')).toBe(false);
  });

  it('exposes style compilation as a generic style-to-profile contract', () => {
    const compiler: StyleCompiler<{ mood: 'lyrical' }> = {
      compile: ({ mood }) => compileStyle({ feel: mood }),
    };

    expect(compiler.compile({ mood: 'lyrical' }).targets.texture).toBe('fluid');
    expect(basicStyleCompiler.compile({ feel: 'gentle' })).toEqual(compileStyle({ feel: 'gentle' }));
  });
});
