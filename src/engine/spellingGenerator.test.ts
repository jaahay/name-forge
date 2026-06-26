import { describe, expect, it } from 'vitest';
import { createSeededRandom } from './random';
import { generateSound } from './soundGenerator';
import { generateRankedSpellings, generateSpellings, rankSpellings } from './spellingGenerator';
import { compileStyle } from './styleCompiler';

describe('spelling generation and ranking', () => {
  it('generates every viable spelling projection for one sound candidate', () => {
    const profile = compileStyle();
    const sound = generateSound(profile, createSeededRandom('sound-seed:default'));
    const spellings = generateSpellings(sound);

    expect(spellings.map((candidate) => candidate.text)).toEqual([
      'Tolway',
      'Tolwai',
      'Tolwy',
      'Tohlway',
      'Tohlwai',
      'Tohlwy',
      'Toelway',
      'Toelwai',
      'Toelwy',
    ]);
    expect(spellings[0]).toEqual({
      contract: 'SpellingCandidate',
      version: 1,
      id: 'spelling-candidate:sound-candidate:sound-profile:fiction-cast:balanced:medium:balanced:t-o-l-w-ay:tolway',
      soundCandidateId: 'sound-candidate:sound-profile:fiction-cast:balanced:medium:balanced:t-o-l-w-ay',
      profileId: 'sound-profile:fiction-cast:balanced:medium:balanced',
      sequenceId: 'segment-sequence:sound-profile:fiction-cast:balanced:medium:balanced:t-o-l-w-ay',
      text: 'Tolway',
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

  it('ranks generated spelling candidates with profile-aware scoring', () => {
    const profile = compileStyle();
    const sound = generateSound(profile, createSeededRandom('sound-seed:default'));
    const ranked = rankSpellings(generateSpellings(sound), profile, { maxCandidates: 5 });

    expect(ranked.map((candidate) => candidate.text)).toEqual([
      'Tolway',
      'Tolwai',
      'Tohlway',
      'Tolwy',
      'Tohlwai',
    ]);
    expect(ranked[0]).toMatchObject({
      text: 'Tolway',
      rank: 1,
      score: 6.482,
    });
  });

  it('keeps the highest-ranked spelling stable across repeated generation and ranking', () => {
    const profile = compileStyle();
    const sound = generateSound(profile, createSeededRandom('sound-seed:default'));

    expect(generateRankedSpellings(sound, profile)[0]).toEqual(generateRankedSpellings(sound, profile)[0]);
  });

  it('honors an explicit ranking cap when callers need bounded output', () => {
    const profile = compileStyle();
    const sound = generateSound(profile, createSeededRandom('sound-seed:default'));

    expect(generateRankedSpellings(sound, profile, { maxCandidates: 2 }).map((candidate) => candidate.text)).toEqual([
      'Tolway',
      'Tolwai',
    ]);
  });
});
