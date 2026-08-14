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
      cadence,
      sequence: {
        contract: 'SegmentSequence',
        version: 1,
        segments: [...segments],
        syllables: [...syllables],
      },
      transcription: segments.join(''),
    },
    spelling: {
      contract: 'SpellingCandidate',
      version: 1,
      text: displayText,
      mappings: [],
      rank: 1,
      score: 2.4,
    },
    spellingCandidates: [
      {
        contract: 'SpellingCandidate',
        version: 1,
        text: displayText,
        mappings: [],
        rank: 1,
        score: 2.4,
      },
      {
        contract: 'SpellingCandidate',
        version: 1,
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

function withoutSound(value: NameArtifact): NameArtifact {
  const { sound: _sound, ...rest } = value;
  return rest;
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
  it('reports identical modeled sound with typed segment details', () => {
    expect(analyzeNameArtifactSoundRelationships([
      artifact('mara', 'Mara'),
      artifact('marah', 'Marah'),
    ])).toEqual([
      {
        kind: 'identical-sound',
        artifactIds: ['mara', 'marah'],
        displayTexts: ['Mara', 'Marah'],
        details: { segments: ['m', 'a', 'r'] },
        evidence: 'Modeled segment sequences are identical: [m a r].',
      },
    ]);
  });

  it('reports substitution, shared onset, and cadence pattern as separate typed evidence', () => {
    expect(analyzeNameArtifactSoundRelationships([
      artifact('mar', 'Mar', { segments: ['m', 'a', 'r'] }),
      artifact('mal', 'Mal', { segments: ['m', 'a', 'l'] }),
    ])).toEqual([
      {
        kind: 'one-segment-edit',
        artifactIds: ['mar', 'mal'],
        displayTexts: ['Mar', 'Mal'],
        details: {
          leftSegments: ['m', 'a', 'r'],
          rightSegments: ['m', 'a', 'l'],
          edit: {
            kind: 'substitution',
            index: 2,
            leftSegment: 'r',
            rightSegment: 'l',
          },
        },
        evidence: 'Modeled segment sequences differ by one substitution at index 2 (r -> l): [m a r] vs [m a l].',
      },
      {
        kind: 'shared-onset',
        artifactIds: ['mar', 'mal'],
        displayTexts: ['Mar', 'Mal'],
        details: { segments: ['m'] },
        evidence: 'First-syllable onsets are identical: [m].',
      },
      {
        kind: 'matching-cadence-pattern',
        artifactIds: ['mar', 'mal'],
        displayTexts: ['Mar', 'Mal'],
        details: {
          cadence: 'balanced',
          stressPattern: ['primary'],
        },
        evidence: 'Modeled cadence and syllable stress pattern are identical: balanced:primary.',
      },
    ]);
  });

  it('identifies a one-segment insertion exactly', () => {
    const relationship = analyzeNameArtifactSoundRelationships([
      artifact('ma', 'Ma', {
        cadence: 'compact',
        segments: ['m', 'a'],
        syllables: [syllable(0, 2, [0], [1], [])],
      }),
      artifact('mar', 'Mar', {
        cadence: 'rolling',
        segments: ['m', 'a', 'r'],
      }),
    ]).find((entry) => entry.kind === 'one-segment-edit');

    expect(relationship).toEqual({
      kind: 'one-segment-edit',
      artifactIds: ['ma', 'mar'],
      displayTexts: ['Ma', 'Mar'],
      details: {
        leftSegments: ['m', 'a'],
        rightSegments: ['m', 'a', 'r'],
        edit: { kind: 'insertion', index: 2, segment: 'r' },
      },
      evidence: 'Modeled segment sequences differ by one insertion at index 2 (r): [m a] vs [m a r].',
    });
  });

  it('identifies a one-segment deletion exactly', () => {
    const relationship = analyzeNameArtifactSoundRelationships([
      artifact('mar', 'Mar', {
        cadence: 'compact',
        segments: ['m', 'a', 'r'],
      }),
      artifact('ma', 'Ma', {
        cadence: 'rolling',
        segments: ['m', 'a'],
        syllables: [syllable(0, 2, [0], [1], [])],
      }),
    ]).find((entry) => entry.kind === 'one-segment-edit');

    expect(relationship).toEqual({
      kind: 'one-segment-edit',
      artifactIds: ['mar', 'ma'],
      displayTexts: ['Mar', 'Ma'],
      details: {
        leftSegments: ['m', 'a', 'r'],
        rightSegments: ['m', 'a'],
        edit: { kind: 'deletion', index: 2, segment: 'r' },
      },
      evidence: 'Modeled segment sequences differ by one deletion at index 2 (r): [m a r] vs [m a].',
    });
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
        details: { segments: ['l', 'i'] },
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
        details: { segments: ['n'] },
        evidence: 'Final-syllable codas are identical: [n].',
      },
    ]);
  });

  it('reports a matching cadence pattern independently from segment similarity', () => {
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
        kind: 'matching-cadence-pattern',
        artifactIds: ['maro', 'tovin'],
        displayTexts: ['Maro', 'Tovin'],
        details: {
          cadence: 'balanced',
          stressPattern: ['primary', 'secondary'],
        },
        evidence: 'Modeled cadence and syllable stress pattern are identical: balanced:primary,secondary.',
      },
    ]);
  });

  it('returns no evidence when modeled structures do not match', () => {
    expect(analyzeNameArtifactSoundRelationships([
      artifact('mar', 'Mar', {
        cadence: 'compact',
        segments: ['m', 'a', 'r'],
      }),
      artifact('tovin', 'Tovin', {
        cadence: 'rolling',
        segments: ['t', 'o', 'v', 'i', 'n'],
        syllables: [syllable(0, 2, [0], [1], []), syllable(2, 5, [2], [3], [4], 'secondary')],
      }),
    ])).toEqual([]);
  });

  it('ignores pairs when either artifact lacks modeled sound', () => {
    expect(analyzeNameArtifactSoundRelationships([
      withoutSound(artifact('unsounded', 'Unsounded')),
      artifact('mar', 'Mar'),
    ])).toEqual([]);
  });

  it('keeps pair and relationship ordering stable across a larger set', () => {
    const relationships = analyzeNameArtifactSoundRelationships([
      artifact('mar', 'Mar', { segments: ['m', 'a', 'r'] }),
      artifact('mal', 'Mal', { segments: ['m', 'a', 'l'] }),
      artifact('tal', 'Tal', {
        cadence: 'compact',
        segments: ['t', 'a', 'l'],
      }),
    ]);

    expect(relationships.map((relationship) => ({
      kind: relationship.kind,
      artifactIds: relationship.artifactIds,
    }))).toEqual([
      { kind: 'one-segment-edit', artifactIds: ['mar', 'mal'] },
      { kind: 'shared-onset', artifactIds: ['mar', 'mal'] },
      { kind: 'matching-cadence-pattern', artifactIds: ['mar', 'mal'] },
      { kind: 'one-segment-edit', artifactIds: ['mal', 'tal'] },
      { kind: 'shared-coda', artifactIds: ['mal', 'tal'] },
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
