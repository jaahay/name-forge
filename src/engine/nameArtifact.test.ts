import { describe, expect, it } from 'vitest';
import { toNameArtifact } from './nameArtifact';
import type { GeneratedName } from './types';

const generatedName: GeneratedName = {
  id: 'generated-aurel',
  name: 'Aurel',
  soundProfile: {
    targets: {
      length: 'medium',
      syllableCount: { min: 2, max: 3, preferred: 2 },
      texture: 'soft',
      distinctiveness: 0.6,
      cadences: ['balanced'],
    },
    phonotactics: {
      preferredSyllableShapes: ['CV', 'CVC'],
      onsetWeight: 0.8,
      codaWeight: 0.4,
      liquidWeight: 0.6,
      glideWeight: 0.2,
      clusterTolerance: 0.1,
    },
  },
  sound: {
    contract: 'SoundCandidate',
    version: 1,
    cadence: 'balanced',
    sequence: {
      contract: 'SegmentSequence',
      version: 1,
      segments: ['l', 'a', 'r'],
      syllables: [{
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
      }],
    },
    transcription: 'lar',
  },
  spelling: {
    contract: 'SpellingCandidate',
    version: 1,
    text: 'Aurel',
    mappings: [{ segmentIndex: 0, segmentId: 'l', syllableIndex: 0, syllableRole: 'onset', text: 'A', start: 0, end: 1 }],
    rank: 1,
    score: 0.94,
  },
  spellingCandidates: [
    { contract: 'SpellingCandidate', version: 1, text: 'Aurel', mappings: [], rank: 1, score: 0.94 },
    { contract: 'SpellingCandidate', version: 1, text: 'Orel', mappings: [], rank: 2, score: 0.82 },
  ],
  silhouette: {
    id: 'silhouette-medium-soft',
    syllableCount: 2,
    stressPattern: 'primary-final',
    rhythm: 'balanced',
    shape: ['CV', 'CVC'],
    texture: 'soft',
    targetNovelty: 0.65,
    targetLength: 'medium',
  },
  scores: {
    pronounceability: 0.9,
    memorability: 0.82,
    novelty: 0.64,
    culturalAnchoring: 0.5,
    orthographicNaturalness: 0.88,
    styleFit: 0.79,
    silhouetteFit: 0.84,
    overallFit: 0.81,
  },
  variants: [{
    value: 'Aurell',
    kind: 'generated',
    relationship: 'creative_respelling',
    confidence: 'medium',
    source: {
      id: 'variant-rule-double-l',
      kind: 'algorithm',
      label: 'Double final liquid',
      detail: 'Generated spelling variant.',
    },
    generated: true,
    ruleId: 'double-final-liquid',
  }],
  readabilityDiagnostics: [{
    id: 'readability-soft-repeat',
    scope: 'name',
    severity: 'notice',
    label: 'Soft repeated liquid',
    detail: 'The name has a soft repeated liquid cadence.',
  }],
};

describe('toNameArtifact', () => {
  it('maps a singular generated name to a coherent singular artifact', () => {
    const artifact = toNameArtifact(generatedName);

    expect(artifact.id).toBe(generatedName.id);
    expect(artifact.displayText).toBe(generatedName.name);
    expect(artifact.displayText).toBe(generatedName.spelling.text);
    expect('kind' in artifact).toBe(false);
    expect('identity' in artifact).toBe(false);
    expect('identityAudition' in artifact).toBe(false);
  });

  it('preserves exact primitive sound, spelling, plan, variants, and readability evidence', () => {
    const artifact = toNameArtifact(generatedName);

    expect(artifact.soundProfile).toBe(generatedName.soundProfile);
    expect(artifact.sound).toBe(generatedName.sound);
    expect(artifact.spelling).toBe(generatedName.spelling);
    expect(artifact.spellingCandidates).toBe(generatedName.spellingCandidates);
    expect(artifact.silhouette).toBe(generatedName.silhouette);
    expect(artifact.variants).toBe(generatedName.variants);
    expect(artifact.readabilityDiagnostics).toBe(generatedName.readabilityDiagnostics);
  });

  it('does not expose Fiction Cast or composition metadata on generic artifacts', () => {
    const artifact = toNameArtifact(generatedName);

    expect('role' in artifact).toBe(false);
    expect('roleInfluence' in artifact).toBe(false);
    expect('contextualScores' in artifact).toBe(false);
    expect('identity' in artifact).toBe(false);
  });
});
