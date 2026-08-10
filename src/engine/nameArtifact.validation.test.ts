import { describe, expect, it } from 'vitest';
import { isNameArtifact } from './nameArtifact';

const validIdentityAudition = {
  contract: 'IdentityAuditionPhrase',
  version: 1,
  source: 'name-identity',
  formatId: 'format:given-family',
  formatKind: 'given-family',
  identityText: 'Aster Vale',
  speechText: 'as ter vayl',
  displayText: 'AS · ter VAYL',
  parts: [{
    index: 0,
    kind: 'sound',
    role: 'given',
    value: 'Aster',
    speechText: 'as ter',
    displayText: 'AS · ter',
    speechSource: 'generated-sound',
    displaySource: 'generated-sound',
    sourceNameId: 'source-aster',
    sourceName: 'Aster',
    transcription: 'as.ter',
    cue: {
      contract: 'NameAuditionCue',
      speechText: 'as ter',
      displayText: 'AS · ter',
    },
  }, {
    index: 1,
    kind: 'sound',
    role: 'family',
    value: 'Vale',
    speechText: 'vayl',
    displayText: 'VAYL',
    speechSource: 'generated-sound',
    displaySource: 'generated-sound',
    sourceNameId: 'source-vale',
    sourceName: 'Vale',
    transcription: 'veɪl',
    cue: {
      contract: 'NameAuditionCue',
      speechText: 'vayl',
      displayText: 'VAYL',
    },
  }],
};

const validSoundProfile = {
  contract: 'SoundProfile',
  version: 1,
  id: 'profile-1',
  source: {
    kind: 'style-input',
    compiler: 'name-forge:style-compiler@0.1.0',
  },
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

const validSound = {
  contract: 'SoundCandidate',
  version: 1,
  id: 'sound-1',
  profileId: 'profile-1',
  cadence: 'balanced',
  sequence: {
    contract: 'SegmentSequence',
    version: 1,
    id: 'sequence-1',
    profileId: 'profile-1',
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

const validLinkedSpelling = {
  contract: 'SpellingCandidate',
  version: 1,
  id: 'spelling-1',
  soundCandidateId: 'sound-1',
  profileId: 'profile-1',
  sequenceId: 'sequence-1',
  text: 'Aster',
  mappings: [],
  rank: 1,
  score: 1,
};

const validIdentity = {
  displayName: 'Aster Vale',
  format: {
    id: 'format:given-family',
    kind: 'given-family',
    label: 'Given + family name',
  },
  parts: [{
    id: 'source-aster:given',
    role: 'given',
    value: 'Aster',
    sourceNameId: 'source-aster',
    sourceName: 'Aster',
    generation: {
      soundProfile: validSoundProfile,
      sound: validSound,
      spelling: validLinkedSpelling,
    },
  }, {
    id: 'source-vale:family',
    role: 'family',
    value: 'Vale',
    sourceNameId: 'source-vale',
    sourceName: 'Vale',
  }],
  phraseParts: [{ kind: 'part', partId: 'source-aster:given', role: 'given' }, { kind: 'part', partId: 'source-vale:family', role: 'family' }],
};

const validArtifact = {
  id: 'artifact-1',
  displayText: 'Aster Vale',
  sound: validSound,
  spelling: {
    id: 'spelling-1',
    text: 'Aster Vale',
    mappings: [],
    rank: 1,
    score: 1,
  },
  readabilityDiagnostics: [{
    id: 'read-1',
    scope: 'name',
    severity: 'notice',
    label: 'Long name',
    detail: 'The display form is relatively long.',
  }],
  identityAudition: validIdentityAudition,
};

describe('isNameArtifact', () => {
  it('accepts the minimal durable artifact contract', () => {
    expect(isNameArtifact({ id: 'artifact-1', displayText: 'Aster Vale' })).toBe(true);
  });

  it('accepts valid inspector-facing nested data', () => {
    expect(isNameArtifact(validArtifact)).toBe(true);
  });

  it('accepts persisted identity parts with linked generation provenance', () => {
    expect(isNameArtifact({
      ...validArtifact,
      identity: validIdentity,
    })).toBe(true);
  });

  it('accepts SoundProfile provenance from a different style compiler', () => {
    expect(isNameArtifact({
      ...validArtifact,
      identity: {
        ...validIdentity,
        parts: [{
          ...validIdentity.parts[0],
          generation: {
            ...validIdentity.parts[0].generation,
            soundProfile: {
              ...validSoundProfile,
              source: {
                ...validSoundProfile.source,
                compiler: 'example:place-name-style-compiler@1.0.0',
              },
            },
          },
        }, validIdentity.parts[1]],
      },
    })).toBe(true);
  });

  it('rejects malformed inspector-facing nested data', () => {
    expect(isNameArtifact({
      ...validArtifact,
      variants: [{ relationship: 3, source: null }],
    })).toBe(false);
  });

  it('rejects malformed persisted identity audition data', () => {
    expect(isNameArtifact({
      ...validArtifact,
      identityAudition: {},
    })).toBe(false);

    expect(isNameArtifact({
      ...validArtifact,
      identityAudition: {
        ...validIdentityAudition,
        parts: [{
          ...validIdentityAudition.parts[0],
          transcription: null,
        }],
      },
    })).toBe(false);
  });

  it('rejects malformed or cross-linked identity generation provenance', () => {
    expect(isNameArtifact({
      ...validArtifact,
      identity: {
        ...validIdentity,
        parts: [{
          ...validIdentity.parts[0],
          generation: {
            ...validIdentity.parts[0].generation,
            soundProfile: { id: 'profile-1' },
          },
        }],
      },
    })).toBe(false);

    expect(isNameArtifact({
      ...validArtifact,
      identity: {
        ...validIdentity,
        parts: [{
          ...validIdentity.parts[0],
          generation: {
            ...validIdentity.parts[0].generation,
            spelling: {
              ...validLinkedSpelling,
              profileId: 'profile-other',
            },
          },
        }],
      },
    })).toBe(false);
  });
});
