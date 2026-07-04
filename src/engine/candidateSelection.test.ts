import { describe, expect, it } from 'vitest';
import type { NameCriteria } from './nameCriteria';
import { compileNameCriteriaToGenerationSettings } from './nameCriteriaCompiler';
import type { RankedSpellingCandidate, SpellingSegmentMapping } from './spellingGenerator';
import type { SoundSegmentId } from './starterSoundInventory';
import { scoreRankedSpellingCandidate, selectRankedSpellingCandidate } from './candidateSelection';

const baseSettings = compileNameCriteriaToGenerationSettings(
  { clauses: [] },
  { seed: 'selection-test-seed', stylePackId: 'test-style-pack' },
);

const plainCriteria: NameCriteria = {
  clauses: [
    {
      id: 'prefer-plain-spelling',
      family: 'spelling',
      polarity: 'prefer',
      target: 'plain',
      strength: 1,
    },
  ],
};

const distinctiveCriteria: NameCriteria = {
  clauses: [
    {
      id: 'prefer-distinctive-spelling',
      family: 'spelling',
      polarity: 'prefer',
      target: 'distinctive',
      strength: 1,
    },
  ],
};

const unsupportedCriteria: NameCriteria = {
  clauses: [
    {
      id: 'prefer-moonlit-meaning',
      family: 'semantic',
      polarity: 'prefer',
      target: 'moonlit',
      strength: 1,
    },
  ],
};

function mapping(segmentIndex: number, segmentId: SoundSegmentId, text: string): SpellingSegmentMapping {
  return {
    segmentIndex,
    segmentId,
    syllableIndex: 0,
    syllableRole: segmentIndex === 0 ? 'onset' : 'nucleus',
    text,
    start: segmentIndex,
    end: segmentIndex + text.length,
  };
}

function spellingCandidate(
  text: string,
  rank: number,
  score: number,
  segments: Array<[SoundSegmentId, string]>,
): RankedSpellingCandidate {
  return {
    contract: 'SpellingCandidate',
    version: 1,
    id: `spelling-candidate:test:${text.toLowerCase()}`,
    soundCandidateId: 'sound-candidate:test',
    profileId: 'sound-profile:test',
    sequenceId: 'segment-sequence:test',
    text,
    mappings: segments.map(([segmentId, segmentText], index) => mapping(index, segmentId, segmentText)),
    rank,
    score,
  };
}

const candidatePool: readonly RankedSpellingCandidate[] = [
  spellingCandidate('Kara', 1, 6.4, [
    ['k', 'K'],
    ['a', 'a'],
    ['r', 'r'],
    ['a', 'a'],
  ]),
  spellingCandidate('Kahra', 2, 6.2, [
    ['k', 'K'],
    ['a', 'a'],
    ['h', 'h'],
    ['r', 'r'],
    ['a', 'a'],
  ]),
  spellingCandidate('Kaera', 3, 5.8, [
    ['k', 'K'],
    ['ae', 'ae'],
    ['r', 'r'],
    ['a', 'a'],
  ]),
];

describe('candidate selection scoring', () => {
  it('uses ranked spelling order when no compiled selection preference exists', () => {
    const selection = selectRankedSpellingCandidate(candidatePool, baseSettings);

    expect(selection?.candidate.text).toBe('Kara');
    expect(selection?.score).toEqual({
      total: 6.4,
      components: [
        {
          id: 'ranked_spelling_score',
          value: 6.4,
          weight: 1,
          contribution: 6.4,
        },
      ],
    });
  });

  it('selects the exact plain spelling from a fixed pool when plain criteria are compiled', () => {
    const settings = compileNameCriteriaToGenerationSettings(
      plainCriteria,
      { seed: 'selection-test-seed', stylePackId: 'test-style-pack' },
    );
    const selection = selectRankedSpellingCandidate(candidatePool, settings);

    expect(selection?.candidate.text).toBe('Kara');
    expect(selection?.score).toEqual({
      total: 1.64,
      components: [
        {
          id: 'ranked_spelling_score',
          value: 6.4,
          weight: 0.1,
          contribution: 0.64,
        },
        {
          id: 'plain_spelling_match',
          value: 1,
          weight: 1,
          contribution: 1,
        },
      ],
    });
  });

  it('selects the exact distinctive spelling from a fixed pool when distinctive criteria are compiled', () => {
    const settings = compileNameCriteriaToGenerationSettings(
      distinctiveCriteria,
      { seed: 'selection-test-seed', stylePackId: 'test-style-pack' },
    );
    const selection = selectRankedSpellingCandidate(candidatePool, settings);

    expect(selection?.candidate.text).toBe('Kaera');
    expect(selection?.score).toEqual({
      total: 1.12,
      components: [
        {
          id: 'ranked_spelling_score',
          value: 5.8,
          weight: 0.1,
          contribution: 0.58,
        },
        {
          id: 'distinctive_spelling_match',
          value: 0.54,
          weight: 1,
          contribution: 0.54,
        },
      ],
    });
  });

  it('keeps score components deterministic', () => {
    const settings = compileNameCriteriaToGenerationSettings(
      distinctiveCriteria,
      { seed: 'selection-test-seed', stylePackId: 'test-style-pack' },
    );
    const firstScore = scoreRankedSpellingCandidate(candidatePool[2], settings);
    const secondScore = scoreRankedSpellingCandidate(candidatePool[2], settings);

    expect(firstScore).toEqual(secondScore);
  });

  it('does not let unsupported criteria affect selection scoring', () => {
    const unsupportedSettings = compileNameCriteriaToGenerationSettings(
      unsupportedCriteria,
      { seed: 'selection-test-seed', stylePackId: 'test-style-pack' },
    );

    expect(scoreRankedSpellingCandidate(candidatePool[0], unsupportedSettings)).toEqual(
      scoreRankedSpellingCandidate(candidatePool[0], baseSettings),
    );
    expect(selectRankedSpellingCandidate(candidatePool, unsupportedSettings)?.candidate.text).toBe('Kara');
  });
});
