import { describe, expect, it } from 'vitest';
import { isNameArtifact, migrateLegacyNameArtifact } from './nameArtifact';

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
    cue: { contract: 'NameAuditionCue', speechText: 'as ter', displayText: 'AS · ter' },
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
    cue: { contract: 'NameAuditionCue', speechText: 'vayl', displayText: 'VAYL' },
  }],
};

const validSoundProfile = {
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

const validLinkedSpelling = {
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

const validIdentity = {
  displayName: 'Aster Vale',
  format: { id: 'format:given-family', kind: 'given-family', label: 'Given + family name' },
  parts: [{
    id: 'source-aster:given',
    role: 'given',
    value: 'Aster',
    sourceNameId: 'source-aster',
    sourceName: 'Aster',
    generation: { soundProfile: validSoundProfile, sound: validSound, spelling: validLinkedSpelling },
  }, {
    id: 'source-vale:family',
    role: 'family',
    value: 'Vale',
    sourceNameId: 'source-vale',
    sourceName: 'Vale',
  }],
  phraseParts: [
    { kind: 'part', partId: 'source-aster:given', role: 'given' },
    { kind: 'part', partId: 'source-vale:family', role: 'family' },
  ],
};

const readabilityDiagnostics = [{
  id: 'read-1',
  scope: 'name',
  severity: 'notice',
  label: 'Long name',
  detail: 'The display form is relatively long.',
}];

const validGeneratedArtifact = {
  kind: 'generated-name',
  id: 'artifact-generated',
  displayText: 'Aster',
  soundProfile: validSoundProfile,
  sound: validSound,
  spelling: validLinkedSpelling,
  spellingCandidates: [validLinkedSpelling],
  silhouette: { id: 'plan-1' },
  variants: [],
  readabilityDiagnostics,
};

const validComposedArtifact = {
  kind: 'composed-identity',
  id: 'artifact-composed',
  displayText: 'Aster Vale',
  identity: validIdentity,
  identityAudition: validIdentityAudition,
  readabilityDiagnostics,
};

describe('isNameArtifact', () => {
  it('requires an explicit artifact kind instead of accepting an ambiguous minimal record', () => {
    expect(isNameArtifact({ id: 'artifact-1', displayText: 'Aster Vale' })).toBe(false);
  });

  it('accepts a coherent singular generated-name artifact', () => {
    expect(isNameArtifact(validGeneratedArtifact)).toBe(true);
  });

  it('accepts a composed identity with component-owned generation provenance', () => {
    expect(isNameArtifact(validComposedArtifact)).toBe(true);
  });

  it('rejects aggregate primitive generation evidence on composed identities', () => {
    expect(isNameArtifact({ ...validComposedArtifact, sound: validSound })).toBe(false);
    expect(isNameArtifact({ ...validComposedArtifact, spelling: validLinkedSpelling })).toBe(false);
  });

  it('rejects composition fields or mismatched selected spelling on generated-name artifacts', () => {
    expect(isNameArtifact({ ...validGeneratedArtifact, identity: validIdentity })).toBe(false);
    expect(isNameArtifact({ ...validGeneratedArtifact, displayText: 'Aster Vale' })).toBe(false);
  });

  it('rejects malformed persisted identity audition data', () => {
    expect(isNameArtifact({ ...validComposedArtifact, identityAudition: {} })).toBe(false);
    expect(isNameArtifact({
      ...validComposedArtifact,
      identityAudition: {
        ...validIdentityAudition,
        parts: [{ ...validIdentityAudition.parts[0], transcription: null }],
      },
    })).toBe(false);
  });

  it('rejects malformed or structurally inconsistent component generation provenance', () => {
    expect(isNameArtifact({
      ...validComposedArtifact,
      identity: {
        ...validIdentity,
        parts: [{
          ...validIdentity.parts[0],
          generation: { ...validIdentity.parts[0].generation, soundProfile: { targets: validSoundProfile.targets } },
        }],
      },
    })).toBe(false);

    expect(isNameArtifact({
      ...validComposedArtifact,
      identity: {
        ...validIdentity,
        parts: [{
          ...validIdentity.parts[0],
          generation: {
            ...validIdentity.parts[0].generation,
            spelling: {
              ...validLinkedSpelling,
              mappings: [{ ...validLinkedSpelling.mappings[0], segmentId: 'm' }],
            },
          },
        }],
      },
    })).toBe(false);
  });
});

describe('migrateLegacyNameArtifact', () => {
  it('normalizes a legacy composed artifact while discarding ambiguous aggregate primitive evidence', () => {
    const migrated = migrateLegacyNameArtifact({
      id: 'legacy-composed',
      displayText: 'Aster Vale',
      soundProfile: validSoundProfile,
      sound: validSound,
      spelling: { ...validLinkedSpelling, text: 'Aster Vale', mappings: [] },
      spellingCandidates: [],
      silhouette: { id: 'legacy-plan' },
      variants: [],
      identity: validIdentity,
      identityAudition: validIdentityAudition,
      readabilityDiagnostics,
    });

    expect(migrated?.kind).toBe('composed-identity');
    expect(migrated?.displayText).toBe('Aster Vale');
    expect('sound' in (migrated ?? {})).toBe(false);
    if (migrated?.kind === 'composed-identity') {
      expect(migrated.identity).toEqual(validIdentity);
      expect(migrated.identityAudition).toEqual(validIdentityAudition);
    }
  });

  it('normalizes a legacy singular generated artifact to the explicit generated-name kind', () => {
    const { kind: _kind, ...legacyGenerated } = validGeneratedArtifact;
    const migrated = migrateLegacyNameArtifact(legacyGenerated);

    expect(migrated?.kind).toBe('generated-name');
    if (migrated?.kind === 'generated-name') {
      expect(migrated.displayText).toBe(migrated.spelling.text);
      expect(migrated.sound).toEqual(validSound);
    }
  });
});
