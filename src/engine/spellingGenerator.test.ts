import { describe, expect, it } from 'vitest';
import { createSeededRandom } from './random';
import { generateSound } from './soundGenerator';
import { generateRankedSpellingCandidates, generateSpellingCandidatePool, rankSpellingCandidatePool } from './spellingGenerator';
import { compileStyle } from './styleCompiler';

describe('spelling generation and ranking', () => {
  it('generates every viable spelling projection for one sound candidate as a candidate pool', () => {
    const profile = compileStyle();
    const sound = generateSound(profile, createSeededRandom('sound-seed:default'));
    const pool = generateSpellingCandidatePool(sound);

    expect(pool).toMatchObject({
      soundCandidateId: sound.id,
      profileId: sound.profileId,
      sequenceId: sound.sequence.id,
    });
    expect(pool.candidates.map((candidate) => candidate.text)).toEqual([
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
    expect(pool.candidates[0]).toEqual({
      contract: 'SpellingCandidate',
      version: 1,
      id: 'spelling-candidate:sound-candidate:sound-profile:balanced:medium:balanced:t-o-l-w-ay:tolway',
      soundCandidateId: 'sound-candidate:sound-profile:balanced:medium:balanced:t-o-l-w-ay',
      profileId: 'sound-profile:balanced:medium:balanced',
      sequenceId: 'segment-sequence:sound-profile:balanced:medium:balanced:t-o-l-w-ay',
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

  it('ranks a spelling candidate pool with profile-aware scoring', () => {
    const profile = compileStyle();
    const sound = generateSound(profile, createSeededRandom('sound-seed:default'));
    const pool = generateSpellingCandidatePool(sound);
    const ranked = rankSpellingCandidatePool(pool, profile, { maxCandidates: 5 });

    expect(ranked).toMatchObject({
      soundCandidateId: sound.id,
      profileId: sound.profileId,
      sequenceId: sound.sequence.id,
    });
    expect(ranked.candidates.map((candidate) => candidate.text)).toEqual([
      'Tolway',
      'Tolwai',
      'Tohlway',
      'Tolwy',
      'Tohlwai',
    ]);
    expect(ranked.candidates[0]).toMatchObject({
      text: 'Tolway',
      rank: 1,
      score: 6.482,
    });
  });

  it('keeps generation-order spelling candidates distinct from ranked spelling candidates', () => {
    const profile = compileStyle();
    const sound = generateSound(profile, createSeededRandom('sound-seed:default'));
    const pool = generateSpellingCandidatePool(sound);
    const ranked = rankSpellingCandidatePool(pool, profile);

    expect(pool.candidates.map((candidate) => candidate.text)).toEqual([
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
    expect(ranked.candidates.map((candidate) => candidate.text)).toEqual([
      'Tolway',
      'Tolwai',
      'Tohlway',
      'Tolwy',
      'Tohlwai',
      'Toelway',
      'Tohlwy',
      'Toelwai',
      'Toelwy',
    ]);

    const generatedCandidate = pool.candidates[0];
    expect(generatedCandidate).toBeDefined();
    if (!generatedCandidate) throw new Error('Expected generated spelling candidate.');

    const rankedCandidate = ranked.candidates[0];
    expect(rankedCandidate).toBeDefined();
    if (!rankedCandidate) throw new Error('Expected ranked spelling candidate.');

    expect(Object.prototype.hasOwnProperty.call(generatedCandidate, 'rank')).toBe(false);
    expect(rankedCandidate.rank).toBe(1);
  });

  it('replays the complete ordered spelling result for identical model inputs', () => {
    const profile = compileStyle();
    const sound = generateSound(profile, createSeededRandom('sound-seed:default'));

    expect(generateRankedSpellingCandidates(sound, profile)).toEqual(
      generateRankedSpellingCandidates(sound, profile),
    );
  });

  it('returns smaller requested counts as exact prefixes of larger requested counts', () => {
    const profile = compileStyle();
    const sound = generateSound(profile, createSeededRandom('sound-seed:default'));
    const basePool = generateSpellingCandidatePool(sound);
    const baseCandidate = basePool.candidates[0];

    expect(baseCandidate).toBeDefined();
    if (!baseCandidate) throw new Error('Expected a base spelling candidate.');

    const syntheticPool = {
      ...basePool,
      candidates: Array.from({ length: 25 }, (_, index) => ({
        ...baseCandidate,
        id: `${baseCandidate.id}:prefix-${String(index + 1).padStart(2, '0')}`,
        text: `Prefix${String(index + 1).padStart(2, '0')}`,
      })),
    };
    const topTwenty = rankSpellingCandidatePool(syntheticPool, profile, { maxCandidates: 20 });
    const topTen = rankSpellingCandidatePool(syntheticPool, profile, { maxCandidates: 10 });

    expect(topTwenty.candidates).toHaveLength(20);
    expect(topTen.candidates).toHaveLength(10);
    expect(topTen.candidates).toEqual(topTwenty.candidates.slice(0, 10));
  });

  it('honors an explicit ranking cap when callers need bounded output', () => {
    const profile = compileStyle();
    const sound = generateSound(profile, createSeededRandom('sound-seed:default'));

    expect(generateRankedSpellingCandidates(sound, profile, { maxCandidates: 2 }).candidates.map((candidate) => candidate.text)).toEqual([
      'Tolway',
      'Tolwai',
    ]);
  });
});
