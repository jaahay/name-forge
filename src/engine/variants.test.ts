import { describe, expect, it } from 'vitest';
import { stylePacks } from '../data/stylePacks';
import { createCastExportPayload, serializeCastAsMarkdown } from './export';
import type { GeneratedEnsemble, GeneratedName, NameScores, NameSilhouette, ProvenanceNote } from './types';
import { generateVariants } from './variants';

const pack = stylePacks[0];

const baseProvenance: ProvenanceNote = {
  sourceId: 'test-source',
  sourceKind: 'algorithm',
  label: 'Test source',
  detail: 'Fixture provenance for variant metadata tests.',
};

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
  provenance: [baseProvenance],
};

function fixtureName(): GeneratedName {
  return {
    id: 'name-1',
    name: 'Aveline',
    silhouette,
    scores,
    variants: generateVariants('Aveline', pack, { orthographicWeirdness: 0.5 }),
    provenance: [baseProvenance],
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
