import { describe, expect, it } from 'vitest';
import { createSeededRandom } from './random';
import { generateSound } from './soundGenerator';
import { enumerateSpellings } from './spellingGenerator';
import { compileStyle } from './styleCompiler';

describe('enumerateSpellings', () => {
  it('enumerates and ranks deterministic spelling candidates for one sound candidate', () => {
    const profile = compileStyle();
    const sound = generateSound(profile, createSeededRandom('sound-seed:default'));
    const spellings = enumerateSpellings(sound, profile, { limit: 5 });

    expect(spellings.map((candidate) => candidate.text)).toEqual([
      'Tolway',
      'Tolwai',
      'Tohlway',
      'Tolwy',
      'Tohlwai',
    ]);
    expect(spellings[0]).toEqual({
      contract: 'SpellingCandidate',
      version: 1,
      id: 'spelling-candidate:sound-candidate:sound-profile:fiction-cast:balanced:medium:balanced:t-o-l-w-ay:tolway',
      soundCandidateId: 'sound-candidate:sound-profile:fiction-cast:balanced:medium:balanced:t-o-l-w-ay',
      profileId: 'sound-profile:fiction-cast:balanced:medium:balanced',
      sequenceId: 'segment-sequence:sound-profile:fiction-cast:balanced:medium:balanced:t-o-l-w-ay',
      text: 'Tolway',
      score: 6.38,
      mappings: [
        {
          segmentIndex: 0,
          segmentId: 't',
          syllableIndex: 0,
          syllableRole: 'onset',
          text: 'T',
          start: 0,
          end: 1,
        },
        {
          segmentIndex: 1,
          segmentId: 'o',
          syllableIndex: 0,
          syllableRole: 'nucleus',
          text: 'o',
          start: 1,
          end: 2,
        },
        {
          segmentIndex: 2,
          segmentId: 'l',
          syllableIndex: 0,
          syllableRole: 'coda',
          text: 'l',
          start: 2,
          end: 3,
        },
        {
          segmentIndex: 3,
          segmentId: 'w',
          syllableIndex: 1,
          syllableRole: 'onset',
          text: 'w',
          start: 3,
          end: 4,
        },
        {
          segmentIndex: 4,
          segmentId: 'ay',
          syllableIndex: 1,
          syllableRole: 'nucleus',
          text: 'ay',
          start: 4,
          end: 6,
        },
      ],
    });
  });

  it('keeps the highest-ranked spelling stable across repeated enumeration', () => {
    const profile = compileStyle();
    const sound = generateSound(profile, createSeededRandom('sound-seed:default'));

    expect(enumerateSpellings(sound, profile)[0]).toEqual(enumerateSpellings(sound, profile)[0]);
  });

  it('honors an explicit result cap', () => {
    const profile = compileStyle();
    const sound = generateSound(profile, createSeededRandom('sound-seed:default'));

    expect(enumerateSpellings(sound, profile, { limit: 2 }).map((candidate) => candidate.text)).toEqual([
      'Tolway',
      'Tolwai',
    ]);
  });
});
