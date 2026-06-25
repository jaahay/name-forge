import { describe, expect, it } from 'vitest';
import { createSeededRandom } from './random';
import { generateSound, renderSegmentSequenceTranscription } from './soundGenerator';
import { compileStyle } from './styleCompiler';

describe('generateSound', () => {
  it('generates a deterministic sound candidate from a fixed seed and default SoundProfile', () => {
    const profile = compileStyle();
    const sound = generateSound(profile, createSeededRandom('sound-seed:default'));

    expect(sound).toEqual({
      contract: 'SoundCandidate',
      version: 1,
      id: 'sound-candidate:sound-profile:fiction-cast:balanced:medium:balanced:t-o-l-w-ay',
      profileId: 'sound-profile:fiction-cast:balanced:medium:balanced',
      cadence: 'open',
      sequence: {
        contract: 'SegmentSequence',
        version: 1,
        id: 'segment-sequence:sound-profile:fiction-cast:balanced:medium:balanced:t-o-l-w-ay',
        profileId: 'sound-profile:fiction-cast:balanced:medium:balanced',
        segments: ['t', 'o', 'l', 'w', 'ay'],
        syllables: [
          {
            start: 0,
            end: 3,
            onset: [0],
            nucleus: [1],
            coda: [2],
            shape: 'CVL',
          },
          {
            start: 3,
            end: 5,
            onset: [3],
            nucleus: [4],
            coda: [],
            shape: 'CV',
          },
        ],
      },
      transcription: '/tol.waɪ/',
    });
    expect(renderSegmentSequenceTranscription(sound.sequence)).toBe('/tol.waɪ/');
  });

  it('keeps the same seed and profile stable across random instances', () => {
    const profile = compileStyle();
    const first = generateSound(profile, createSeededRandom('sound-seed:default'));
    const second = generateSound(profile, createSeededRandom('sound-seed:default'));

    expect(second).toEqual(first);
  });

  it('uses profile texture, length, and distinctiveness to produce structured longer candidates', () => {
    const profile = compileStyle({
      feel: 'lyrical',
      length: 'long',
      distinctiveness: 'distinctive',
    });
    const sound = generateSound(profile, createSeededRandom('sound-seed:lyrical'));

    expect(sound).toEqual({
      contract: 'SoundCandidate',
      version: 1,
      id: 'sound-candidate:sound-profile:fiction-cast:lyrical:long:distinctive:r-u-r-ey-l-y-a-r',
      profileId: 'sound-profile:fiction-cast:lyrical:long:distinctive',
      cadence: 'open',
      sequence: {
        contract: 'SegmentSequence',
        version: 1,
        id: 'segment-sequence:sound-profile:fiction-cast:lyrical:long:distinctive:r-u-r-ey-l-y-a-r',
        profileId: 'sound-profile:fiction-cast:lyrical:long:distinctive',
        segments: ['r', 'u', 'r', 'ey', 'l', 'y', 'a', 'r'],
        syllables: [
          {
            start: 0,
            end: 2,
            onset: [0],
            nucleus: [1],
            coda: [],
            shape: 'CV',
          },
          {
            start: 2,
            end: 5,
            onset: [2],
            nucleus: [3],
            coda: [4],
            shape: 'CVL',
          },
          {
            start: 5,
            end: 8,
            onset: [5],
            nucleus: [6],
            coda: [7],
            shape: 'CVL',
          },
        ],
      },
      transcription: '/ru.reɪl.jar/',
    });
  });
});
