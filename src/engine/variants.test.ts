import { describe, expect, it } from 'vitest';
import { stylePacks } from '../data/stylePacks';
import { createCastExportPayload, serializeCastAsMarkdown } from './export';
import type { GeneratedEnsemble, GeneratedName, NameScores, NameSilhouette } from './types';
import { generateVariants } from './variants';

const pack = stylePacks[0];

const scores: NameScores = {
  pronounceability: 0.8,
  memorability: 0.7,
  novelty: 0.5,
  culturalAnchoring: 0.4,
  orthographicNaturalness: 0.9,
  styleFit: 0.8,
  silhouetteFit: 0.7,
  ensembleFit: 0.6,
  roleFit: 0.5,
  overallFit: 0.72,
};

const silhouette: NameSilhouette = {
  id: 'test-silhouette',
  syllableCount: 3,
  stressPattern: 'soft-middle',
  rhythm: 'lilting',
  shape: ['soft', 'liquid', 'open'],
  rarityBand: 'uncommon',
  texture: 'soft',
  targetNovelty: 0.5,
  targetLength: 'medium',
};

function fixtureName(): GeneratedName {
  const soundProfile = {
    contract: 'SoundProfile' as const,
    version: 1 as const,
    id: 'sound-profile:test',
    source: {
      kind: 'style-input' as const,
      job: 'fiction-cast' as const,
      compiler: 'name-forge:style-compiler@0.1.0' as const,
    },
    targets: {
      length: 'medium' as const,
      syllableCount: { min: 2, max: 3, preferred: 3 },
      texture: 'soft' as const,
      distinctiveness: 0.5,
      cadences: ['balanced' as const],
    },
    phonotactics: {
      preferredSyllableShapes: ['CV', 'CVC'],
      onsetWeight: 0.72,
      codaWeight: 0.46,
      liquidWeight: 0.34,
      glideWeight: 0.18,
      clusterTolerance: 0.22,
    },
    lexicon: {
      titles: [{ id: 'title:archivist', kind: 'title' as const, text: 'Archivist' }],
      epithets: [{ id: 'epithet:the-ashen', kind: 'epithet' as const, text: 'the Ashen' }],
    },
  };
  const sound = {
    contract: 'SoundCandidate' as const,
    version: 1 as const,
    id: 'sound-candidate:test-profile:a-v-e-l-i-n',
    profileId: soundProfile.id,
    cadence: 'balanced' as const,
    transcription: '/a.ve.lin/',
    sequence: {
      contract: 'SegmentSequence' as const,
      version: 1 as const,
      id: 'segment-sequence:test-profile:a-v-e-l-i-n',
      profileId: soundProfile.id,
      segments: ['a', 'v', 'e', 'l', 'i', 'n'] as const,
      syllables: [
        {
          start: 0,
          end: 2,
          onset: [],
          nucleus: [0],
          coda: [1],
          shape: 'CVC' as const,
          weight: 'heavy' as const,
          sonorityProfile: 'falling' as const,
          stress: 'unspecified' as const,
          stressSource: 'unspecified' as const,
        },
        {
          start: 2,
          end: 4,
          onset: [],
          nucleus: [2],
          coda: [3],
          shape: 'CVC' as const,
          weight: 'heavy' as const,
          sonorityProfile: 'falling' as const,
          stress: 'unspecified' as const,
          stressSource: 'unspecified' as const,
        },
        {
          start: 4,
          end: 6,
          onset: [],
          nucleus: [4],
          coda: [5],
          shape: 'CVC' as const,
          weight: 'heavy' as const,
          sonorityProfile: 'falling' as const,
          stress: 'unspecified' as const,
          stressSource: 'unspecified' as const,
        },
      ],
    },
  };
  const spelling = {
    contract: 'SpellingCandidate' as const,
    version: 1 as const,
    id: 'spelling-candidate:test-profile:aveline',
    soundCandidateId: sound.id,
    profileId: sound.profileId,
    sequenceId: sound.sequence.id,
    text: 'Aveline',
    mappings: [],
    rank: 1,
    score: 1,
  };

  return {
    id: 'name-1',
    name: 'Aveline',
    soundProfile,
    sound,
    spelling,
    spellingCandidates: [spelling],
    silhouette,
    scores,
    variants: generateVariants('Aveline', pack, { orthographicWeirdness: 0.5 }),
    readabilityDiagnostics: [],
  };
}

function fixtureEnsemble(): GeneratedEnsemble {
  return {
    settings: {
      castSize: 1,
      novelty: 0.5,
      pronounceability: 0.5,
      memorability: 0.5,
      culturalAnchoring: 0.5,
      orthographicWeirdness: 0.5,
      stylePackId: pack.id,
      seed: 'variant-contract-test',
    },
    sourcePack: {
      id: pack.id,
      label: pack.label,
      description: pack.description,
      source: pack.source,
      style: pack.style,
    },
    names: [fixtureName()],
    diagnostics: {
      repeatedInitials: 0,
      repeatedEndings: 0,
      repeatedCadences: 0,
      repeatedRarityBands: 0,
      noveltySpread: 0,
      readabilityIssues: 0,
      readabilityWarnings: 0,
      readabilitySummary: 'No deterministic read-friction notes.',
      readabilityDiagnostics: [],
      summary: 'No ensemble pressure in single-name fixture.',
    },
  };
}

describe('variant metadata', () => {
  it('labels listed and generated variants with relationship, confidence, source, and generated status', () => {
    const variants = generateVariants('Aveline', pack, { orthographicWeirdness: 0.5 });

    expect(variants).toHaveLength(3);
    expect(variants.map((variant) => variant.value)).toEqual(['Avelyn', 'Avelina', 'Avelyne']);

    expect(variants[0]).toMatchObject({
      value: 'Avelyn',
      kind: 'listed',
      relationship: 'orthographic_variant',
      confidence: 'high',
      generated: false,
      locale: pack.localeHint,
      ruleId: 'listed-style-pack-alternate',
      source: {
        id: `${pack.id}:listedVariants`,
        kind: 'listed-source',
        label: 'Listed alternate',
      },
    });

    expect(variants[2]).toMatchObject({
      value: 'Avelyne',
      kind: 'generated',
      relationship: 'orthographic_variant',
      confidence: 'medium',
      generated: true,
      locale: pack.localeHint,
      ruleId: 'i-to-y',
      source: {
        id: `${pack.id}:i-to-y`,
        kind: 'algorithm',
        label: 'Medial i to y',
      },
    });
  });

  it('includes variant relationship metadata in JSON and Markdown exports', () => {
    const ensemble = fixtureEnsemble();
    const payload = createCastExportPayload(ensemble);

    expect(payload.sourcePack.source).toEqual(pack.source);
    expect(payload.sourcePack.style).toEqual(pack.style);
    expect(payload.names[0].variants[0]).toEqual({
      value: 'Avelyn',
      kind: 'listed',
      relationship: 'orthographic_variant',
      confidence: 'high',
      generated: false,
      ruleId: 'listed-style-pack-alternate',
      sourceId: `${pack.id}:listedVariants`,
      sourceKind: 'listed-source',
      sourceLabel: 'Listed alternate',
      locale: pack.localeHint,
    });

    const markdown = serializeCastAsMarkdown(ensemble);
    expect(markdown).toContain('Avelyn (orthographic variant, high confidence, listed, british-literary-fantasy:listedVariants)');
    expect(markdown).toContain('Avelyne (orthographic variant, medium confidence, generated, british-literary-fantasy:i-to-y)');
  });
});
