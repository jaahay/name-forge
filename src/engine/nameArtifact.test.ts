import { describe, expect, it } from 'vitest';
import { toNameArtifact } from './nameArtifact';
import type { GeneratedName } from './types';

function requireValue<T>(value: T | undefined, label: string): T {
  if (value === undefined) {
    throw new Error(`Expected ${label}.`);
  }

  return value;
}

const generatedName: GeneratedName = {
  id: 'generated-aurel',
  name: 'Aurel',
  soundProfile: {
    contract: 'SoundProfile',
    version: 1,
    id: 'profile-soft',
    source: {
      kind: 'style-input',
      job: 'fiction-cast',
      compiler: 'name-forge:style-compiler@0.1.0',
    },
    targets: {
      length: 'medium',
      syllableCount: {
        min: 2,
        max: 3,
        preferred: 2,
      },
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
    lexicon: {
      titles: [],
      epithets: [],
    },
  },
  sound: {
    contract: 'SoundCandidate',
    version: 1,
    id: 'sound-aurel',
    profileId: 'profile-soft',
    cadence: 'balanced',
    sequence: {
      contract: 'SegmentSequence',
      version: 1,
      id: 'sequence-aurel',
      profileId: 'profile-soft',
      segments: ['l', 'a', 'r'],
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
    transcription: 'lar',
  },
  spelling: {
    contract: 'SpellingCandidate',
    version: 1,
    id: 'spelling-aurel-primary',
    soundCandidateId: 'sound-aurel',
    profileId: 'profile-soft',
    sequenceId: 'sequence-aurel',
    text: 'Aurel',
    mappings: [
      {
        segmentIndex: 0,
        segmentId: 'l',
        syllableIndex: 0,
        syllableRole: 'onset',
        text: 'L',
        start: 0,
        end: 1,
      },
      {
        segmentIndex: 1,
        segmentId: 'a',
        syllableIndex: 0,
        syllableRole: 'nucleus',
        text: 'au',
        start: 1,
        end: 3,
      },
      {
        segmentIndex: 2,
        segmentId: 'r',
        syllableIndex: 0,
        syllableRole: 'coda',
        text: 'rel',
        start: 3,
        end: 6,
      },
    ],
    rank: 1,
    score: 0.94,
  },
  spellingCandidates: [
    {
      contract: 'SpellingCandidate',
      version: 1,
      id: 'spelling-aurel-primary',
      soundCandidateId: 'sound-aurel',
      profileId: 'profile-soft',
      sequenceId: 'sequence-aurel',
      text: 'Aurel',
      mappings: [],
      rank: 1,
      score: 0.94,
    },
    {
      contract: 'SpellingCandidate',
      version: 1,
      id: 'spelling-orel-secondary',
      soundCandidateId: 'sound-aurel',
      profileId: 'profile-soft',
      sequenceId: 'sequence-aurel',
      text: 'Orel',
      mappings: [],
      rank: 2,
      score: 0.82,
    },
  ],
  silhouette: {
    id: 'silhouette-medium-soft',
    syllableCount: 2,
    stressPattern: 'primary-final',
    rhythm: 'balanced',
    shape: ['CV', 'CVC'],
    rarityBand: 'uncommon',
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
    ensembleFit: 0.76,
    roleFit: 0.73,
    overallFit: 0.81,
  },
  variants: [
    {
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
    },
  ],
  readabilityDiagnostics: [
    {
      id: 'readability-soft-repeat',
      scope: 'name',
      severity: 'notice',
      label: 'Soft repeated liquid',
      detail: 'The name has a soft repeated liquid cadence.',
    },
  ],
  identity: {
    displayName: 'Aurel the Bright',
    format: {
      id: 'epithet-place',
      kind: 'epithet-place',
      label: 'Epithet place',
    },
    parts: [
      {
        id: 'part-aurel',
        role: 'given',
        value: 'Aurel',
        sourceNameId: 'generated-aurel',
        sourceName: 'Aurel',
      },
    ],
    phraseParts: [
      {
        kind: 'part',
        partId: 'part-aurel',
        role: 'given',
      },
      {
        kind: 'literal',
        value: ' the Bright',
      },
    ],
  },
};

const generatedNameWithPartProvenance: GeneratedName = {
  ...generatedName,
  identity: {
    ...requireValue(generatedName.identity, 'generated identity'),
    parts: requireValue(generatedName.identity, 'generated identity').parts.map((part) => part.role === 'given' ? {
      ...part,
      generation: {
        soundProfile: generatedName.soundProfile,
        sound: generatedName.sound,
        spelling: generatedName.spelling,
      },
    } : part),
  },
};

describe('toNameArtifact', () => {
  it('maps display text from identity display composition when available', () => {
    const artifact = toNameArtifact(generatedName);

    expect(artifact.id).toBe('generated-aurel');
    expect(artifact.displayText).toBe('Aurel the Bright');
    expect(artifact.identity).toBe(generatedName.identity);
  });

  it('falls back to the generated name when no identity display composition is present', () => {
    const { identity: _identity, ...nameWithoutIdentity } = generatedName;
    const artifact = toNameArtifact(nameWithoutIdentity);

    expect(artifact.displayText).toBe('Aurel');
    expect(artifact.identity).toBeUndefined();
  });

  it('preserves sound and selected spelling metadata', () => {
    const artifact = toNameArtifact(generatedName);

    expect(artifact.soundProfile).toBe(generatedName.soundProfile);
    expect(artifact.sound).toBe(generatedName.sound);
    expect(artifact.spelling).toBe(generatedName.spelling);

    const spelling = requireValue(artifact.spelling, 'selected spelling');
    expect(spelling.text).toBe('Aurel');
  });

  it('preserves generated sound provenance owned by identity parts', () => {
    const artifact = toNameArtifact(generatedNameWithPartProvenance);
    const part = requireValue(artifact.identity?.parts.find((candidate) => candidate.role === 'given'), 'generated identity part');

    expect(part.generation?.soundProfile).toBe(generatedName.soundProfile);
    expect(part.generation?.sound).toBe(generatedName.sound);
    expect(part.generation?.spelling).toBe(generatedName.spelling);
  });

  it('preserves ranked spelling alternatives and current selected-name diagnostics', () => {
    const artifact = toNameArtifact(generatedName);

    expect(artifact.spellingCandidates).toBe(generatedName.spellingCandidates);
    expect(artifact.spellingCandidates).toHaveLength(2);
    expect(artifact.readabilityDiagnostics).toBe(generatedName.readabilityDiagnostics);

    const diagnostics = requireValue(artifact.readabilityDiagnostics, 'readability diagnostics');
    const diagnostic = requireValue(diagnostics[0], 'first readability diagnostic');
    expect(diagnostic.severity).toBe('notice');
  });

  it('does not require cast role metadata on every artifact', () => {
    const artifact = toNameArtifact(generatedName);

    expect(artifact.role).toBeUndefined();
    expect(artifact.roleInfluence).toBeUndefined();
    expect(artifact.silhouette).toBe(generatedName.silhouette);
    expect(artifact.variants).toBe(generatedName.variants);
  });
});
