import { describe, expect, it } from 'vitest';
import { generateEnsemble } from './ensemble';
import { createCastExportPayload, serializeCastAsJson, serializeCastAsMarkdown } from './export';
import { createDefaultRegistry } from './registry';
import type { GenerationSettings } from './types';

const settings: GenerationSettings = {
  castSize: 4,
  novelty: 0.5,
  pronounceability: 0.7,
  memorability: 0.6,
  culturalAnchoring: 0.65,
  orthographicWeirdness: 0.25,
  stylePackId: 'british-literary-fantasy',
  seed: 'export-test-seed',
  nameFormat: 'mixed',
};

function exportableEnsemble() {
  return generateEnsemble(settings, createDefaultRegistry());
}

describe('cast export serialization', () => {
  it('creates a deterministic JSON payload with cast metadata and exportable names', () => {
    const ensemble = exportableEnsemble();
    const firstJson = serializeCastAsJson(ensemble);
    const secondJson = serializeCastAsJson(exportableEnsemble());
    const payload = JSON.parse(firstJson) as ReturnType<typeof createCastExportPayload>;

    expect(secondJson).toBe(firstJson);
    expect(payload.exportVersion).toBe('name-forge.cast.v1');
    expect(payload.generatedBy).toBe('Name Forge');
    expect(payload.seed).toBe(settings.seed);
    expect(payload.settings.seed).toBe(settings.seed);
    expect(payload.sourcePack.id).toBe(settings.stylePackId);
    expect(payload.names).toHaveLength(settings.castSize);

    const [firstName] = payload.names;
    expect(firstName).toBeDefined();
    if (!firstName) throw new Error('Expected at least one exported name.');
    expect(firstName.name).toBe(ensemble.names[0]?.name);
    expect(firstName.seed).toBe(settings.seed);
    expect(firstName.score).toBe(ensemble.names[0]?.scores.overallFit);
    expect(firstName.silhouette.syllableCount).toBeGreaterThan(0);
    expect(firstName.silhouette.rarityBand).toBeDefined();
    expect(firstName.parts.length).toBeGreaterThan(0);
    expect(firstName.provenance.length).toBeGreaterThan(0);
    expect(firstName.warnings).toEqual([]);
  });

  it('renders a Markdown export with score, silhouette, variants, provenance, and seed', () => {
    const markdown = serializeCastAsMarkdown(exportableEnsemble());

    expect(markdown).toContain('# Name Forge Cast Export');
    expect(markdown).toContain('Seed: `export-test-seed`');
    expect(markdown).toContain('Style pack: British literary fantasy');
    expect(markdown).toContain('## Ensemble balance');
    expect(markdown).toContain('## 1.');
    expect(markdown).toContain('- Overall fit:');
    expect(markdown).toContain('- Format:');
    expect(markdown).toContain('- Parts:');
    expect(markdown).toContain('- Silhouette:');
    expect(markdown).toContain('- Variants:');
    expect(markdown).toContain('- Provenance:');
    expect(markdown).toContain('- Warnings: none');
  });
});
