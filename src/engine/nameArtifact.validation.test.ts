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

const validArtifact = {
  id: 'artifact-1',
  displayText: 'Aster Vale',
  sound: {
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
  },
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
});
