import { describe, expect, it } from 'vitest';
import type { NameArtifact } from './nameArtifact';
import { analyzeNameArtifact, analyzeNameArtifactSet } from './nameArtifactAnalysis';
import type { SoundProfileCadence } from './soundProfile';

function artifact(id: string, displayText: string, cadence: SoundProfileCadence = 'balanced'): NameArtifact {
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
        segments: ['m', 'a', 'r'],
        syllables: [
          {
            start: 0,
            end: 3,
            onset: [0],
            nucleus: [1],
            coda: [2],
            shape: 'CVC',
            weight: 'heavy',
            sonorityProfile: 'rise-fall',
            stress: 'primary',
            stressSource: 'sequence',
          },
        ],
      },
      transcription: 'mar',
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
      syllableCount: 1,
      stressPattern: 'primary-final',
      rhythm: 'balanced',
      shape: ['CVC'],
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
  });
});
