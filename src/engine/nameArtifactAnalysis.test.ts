import { describe, expect, it } from 'vitest';
import type { NameArtifact } from './nameArtifact';
import {
  analyzeNameArtifact,
  analyzeNameArtifactSet,
  analyzeNameArtifactSoundRelationships,
} from './nameArtifactAnalysis';
import type { SoundProfileCadence } from './soundProfile';
import type { SoundSegmentId } from './starterSoundInventory';

type TestSyllable = NonNullable<NameArtifact['sound']>['sequence']['syllables'][number];

interface ArtifactOptions {
  readonly cadence?: SoundProfileCadence;
  readonly segments?: readonly SoundSegmentId[];
  readonly syllables?: readonly TestSyllable[];
}

function syllable(
  start: number,
  end: number,
  onset: readonly number[],
  nucleus: readonly number[],
  coda: readonly number[],
  stress: TestSyllable['stress'] = 'primary',
): TestSyllable {
  return {
    start,
    end,
    onset,
    nucleus,
    coda,
    shape: coda.length > 0 ? 'CVC' : 'CV',
    weight: coda.length > 0 ? 'heavy' : 'light',
    sonorityProfile: 'rise-fall',
    stress,
    stressSource: 'sequence',
  };
}

function artifact(id: string, displayText: string, options: ArtifactOptions = {}): NameArtifact {
  const cadence = options.cadence ?? 'balanced';
  const segments = options.segments ?? ['m', 'a', 'r'];
  const syllables = options.syllables ?? [syllable(0, segments.length, [0], [1], [segments.length - 1])];

  return {
    id,
    displayText,
    sound: {
      contract: 'SoundCandidate',
      version: 1,
      id: `sound-${id}`,
      profileId: 'profile-test',
      cadence,
      sequence: {
        contract: 'SegmentSequence',
        version: 1,
        id: `sequence-${id}`,
        profileId: 'profile-test',
        segments: [...segments],
        syllables: [...syllables],
      },
      transcription: segments.join(''),
    },
    spelling: {
      contract: 'SpellingCandidate',
      version: 1,
      id: `spelling-${id}-selected`,
      soundCandidateId: `sound-${id}`,
      profileId: 'profile-test',
      sequenceId: `sequence-${id}`,
      text: displayText,
      mappings: [],
      rank: 1,
      score: 2.4,
    },
    spellingCandidates: [
      {
        contract: 'SpellingCandidate',
        version: 1,
        id: `spelling-${id}-selected`,
        soundCandidateId: `sound-${id}`,
        profileId: 'profile-test',
        sequenceId: `sequence-${id}`,
        text: displayText,
        mappings: [],
        rank: 1,
        score: 2.4,
      },
      {
        contract: 'SpellingCandidate',
        version: 1,
        id: `spelling-${id}-runner-up`,
        soundCandidateId: `sound-${id}`,
        profileId: 'profile-test',
        sequenceId: `sequence-${id}`,
        text: `${displayText}e`,
        mappings: [],
        rank: 2,
        score: 2.1,
      },
    ],
    silhouette: {
      id: `silhouette-${id}`,
      syllableCount: syllables.length,
      stressPattern: syllables.map((entry) => entry.stress).join('-'),
      rhythm: cadence,
      shape: syllables.map((entry) => entry.shape),
      rarityBand: 'common',
      texture: 'balanced',
      targetNovelty: 0.5,
      targetLength: 'short',
    },
    readabilityDiagnostics: [
      {
        id: `diagnostic-${id}`,
        scope: 'name',
        severity: 'notice',
        label: 'Possible visual misread',
        detail: 'Fixture diagnostic.',
      },
    ],
  };
}

describe('analyzeNameArtifact', () => {
  it('returns exact structural, spelling, and readability evidence', () => {
    expect(analyzeNameArtifact(artifact('maren', 'Maren'))).toEqual({
      structure: {
        segmentCount: 3,
        syllableCount: 1,
        syllableShapes: ['CVC'],
        stressPattern: ['primary'],
        cadence: 'balanced',
      },
      spelling: {
        candidateCount: 2,
        selectedRank: 1,
        selectedText: 'Maren',
        runnerUpText: 'Marene',
        selectionSummary: 'Maren ranked first of 2 retained spellings under the current deterministic spelling rules.',
      },
      readability: {
        noticeCount: 1,
        warningCount: 0,
        diagnosticCount: 1,
      },
    });
  });
});

describe('analyzeNameArtifactSoundRelationships', () => {
  it('reports identical modeled sound without a human-confusion claim', () => {
    expect(analyzeNameArtifactSoundRelationships([
      artifact('mara', 'Mara'),
      artifact('marah', 'Marah'),
    ])).toEqual([
      {
        kind: 'identical-sound',
        artifactIds: ['mara', 'marah'],
        displayTexts: ['Mara', 'Marah'],
        evidence: 'Modeled segment sequences are identical: [m a r].',
      },
    ]);
  });

  it('reports a one-segment edit, shared onset, and shared cadence as separate evidence', () => {
    expect(analyzeNameArtifactSoundRelationships([
      artifact('mar', 'Mar', { segments: ['m', 'a', 'r'] }),
      artifact('mal', 'Mal', { segments: ['m', 'a', 'l'] }),
    ])).toEqual([
      {
        kind: 'one-segment-edit',
        artifactIds: ['mar', 'mal'],
        displayTexts: ['Mar', 'Mal'],
        evidence: 'Modeled segment sequences differ by one insertion, deletion, or substitution: [m a r] vs [m a l].',
      },
      {
        kind: 'shared-onset',
        artifactIds: ['mar', 'mal'],
        displayTexts: ['Mar', 'Mal'],
        evidence: 'First-syllable onsets are identical: [m].',
      },
      {
        kind: 'shared-cadence',
        artifactIds: ['mar', 'mal'],
        displayTexts: ['Mar', 'Mal'],
        evidence: 'Modeled cadence and syllable stress pattern are identical: balanced:primary.',
      },
    ]);
  });

  it('reports an exact shared final syllable', () => {
    expect(analyzeNameArtifactSoundRelationships([
      artifact('kali', 'Kali', {
        cadence: 'compact',
        segments: ['k', 'a', 'l', 'i'],
        syllables: [syllable(0, 2, [0], [1], []), syllable(2, 4, [2], [3], [])],
      }),
      artifact('moli', 'Moli', {
        cadence: 'open',
        segments: ['m', 'o', 'l', 'i'],
        syllables: [syllable(0, 2, [0], [1], []), syllable(2, 4, [2], [3], [])],
      }),
    ])).toEqual([
      {
        kind: 'shared-final-syllable',
        artifactIds: ['kali', 'moli'],
        displayTexts: ['Kali', 'Moli'],
        evidence: 'Final modeled syllables are identical: [l i].',
      },
    ]);
  });

  it('reports an exact shared coda when the final syllables differ', () => {
    expect(analyzeNameArtifactSoundRelationships([
      artifact('taren', 'Taren', {
        cadence: 'compact',
        segments: ['t', 'a', 'r', 'e', 'n'],
        syllables: [syllable(0, 2, [0], [1], []), syllable(2, 5, [2], [3], [4])],
      }),
      artifact('molun', 'Molun', {
        cadence: 'rolling',
        segments: ['m', 'o', 'l', 'u', 'n'],
        syllables: [syllable(0, 2, [0], [1], []), syllable(2, 5, [2], [3], [4])],
      }),
    ])).toEqual([
      {
        kind: 'shared-coda',
        artifactIds: ['taren', 'molun'],
        displayTexts: ['Taren', 'Molun'],
        evidence: 'Final-syllable codas are identical: [n].',
      },
    ]);
  });

  it('reports shared cadence independently from segment similarity', () => {
    expect(analyzeNameArtifactSoundRelationships([
      artifact('maro', 'Maro', {
        segments: ['m', 'a', 'r', 'o'],
        syllables: [syllable(0, 2, [0], [1], []), syllable(2, 4, [2], [3], [], 'secondary')],
      }),
      artifact('tovin', 'Tovin', {
        segments: ['t', 'o', 'v', 'i', 'n'],
        syllables: [syllable(0, 2, [0], [1], []), syllable(2, 5, [2], [3], [4], 'secondary')],
      }),
    ])).toEqual([
      {
        kind: 'shared-cadence',
        artifactIds: ['maro', 'tovin'],
        displayTexts: ['Maro', 'Tovin'],
        evidence: 'Modeled cadence and syllable stress pattern are identical: balanced:primary,secondary.',
      },
    ]);
  });
});

describe('analyzeNameArtifactSet', () => {
  it('reports exact pairwise collisions without a subjective fit score', () => {
    const analysis = analyzeNameArtifactSet([
      artifact('mara', 'Mara'),
      artifact('maren', 'Maren'),
      artifact('tara', 'Tara'),
    ]);

    expect(analysis.artifactCount).toBe(3);
    expect(analysis.repeatedInitials).toBe(1);
    expect(analysis.repeatedEndings).toBe(1);
    expect(analysis.repeatedCadences).toBe(2);
    expect(analysis.exactDuplicateCount).toBe(0);
    expect(analysis.nearSpellingPairCount).toBe(1);
    expect(analysis.collisions.map((collision) => collision.kind)).toEqual([
      'shared-initial',
      'shared-cadence',
      'near-spelling',
      'shared-ending',
      'shared-cadence',
      'shared-cadence',
    ]);
    expect(analysis.soundRelationships).toHaveLength(3);
    expect(analysis.soundRelationships.every((relationship) => relationship.kind === 'identical-sound')).toBe(true);
  });
});
