import { describe, expect, it } from 'vitest';
import { isNameArtifact } from './nameArtifact';

const soundProfile = {
  targets: {
    length: 'medium',
    syllableCount: { min: 2, max: 3, preferred: 2 },
    texture: 'balanced',
    distinctiveness: 0.5,
    cadences: ['balanced', 'open'],
  },
  phonotactics: {
    preferredSyllableShapes: ['CV', 'CVC'],
    onsetWeight: 0.72,
    codaWeight: 0.46,
    liquidWeight: 0.34,
    glideWeight: 0.18,
    clusterTolerance: 0.22,
  },
};

const sound = {
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
};

const spelling = {
  contract: 'SpellingCandidate',
  version: 1,
  text: 'Aster',
  mappings: [{
    segmentIndex: 0,
    segmentId: 'l',
    syllableIndex: 0,
    syllableRole: 'onset',
    text: 'A',
    start: 0,
    end: 1,
  }, {
    segmentIndex: 1,
    segmentId: 'a',
    syllableIndex: 0,
    syllableRole: 'nucleus',
    text: 'st',
    start: 1,
    end: 3,
  }, {
    segmentIndex: 2,
    segmentId: 'r',
    syllableIndex: 0,
    syllableRole: 'coda',
    text: 'er',
    start: 3,
    end: 5,
  }],
  rank: 1,
  score: 1,
};

const artifact = {
  id: 'artifact-generated',
  displayText: 'Aster',
  soundProfile,
  sound,
  spelling,
  spellingCandidates: [spelling],
  silhouette: { id: 'plan-1' },
  variants: [],
  readabilityDiagnostics: [{
    id: 'read-1',
    scope: 'name',
    severity: 'notice',
    label: 'Long name',
    detail: 'The display form is relatively long.',
  }],
};

describe('isNameArtifact', () => {
  it('accepts a coherent singular generated-name artifact', () => {
    expect(isNameArtifact(artifact)).toBe(true);
  });

  it('rejects ambiguous or incomplete records', () => {
    expect(isNameArtifact({ id: 'artifact-1', displayText: 'Aster' })).toBe(false);
    expect(isNameArtifact({ ...artifact, sound: undefined })).toBe(false);
  });

  it('rejects composition and discriminator fields', () => {
    expect(isNameArtifact({ ...artifact, kind: 'generated-name' })).toBe(false);
    expect(isNameArtifact({ ...artifact, identity: {} })).toBe(false);
    expect(isNameArtifact({ ...artifact, identityAudition: {} })).toBe(false);
  });

  it('rejects display text that does not match the selected spelling', () => {
    expect(isNameArtifact({ ...artifact, displayText: 'Aster Vale' })).toBe(false);
  });

  it('rejects spelling evidence that does not match the generated sound', () => {
    const invalidSpelling = {
      ...spelling,
      mappings: [{ ...spelling.mappings[0], segmentId: 'm' }],
    };

    expect(isNameArtifact({
      ...artifact,
      spelling: invalidSpelling,
      spellingCandidates: [invalidSpelling],
    })).toBe(false);
  });
});
