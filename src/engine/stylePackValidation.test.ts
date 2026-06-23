import { describe, expect, it } from 'vitest';
import { stylePacks } from '../data/stylePacks';
import type { StylePack } from './types';
import { validateStylePack } from './stylePackValidation';
import { createDefaultRegistry } from './registry';

const pack = stylePacks[0];

function brokenPack(overrides: Partial<StylePack>): StylePack {
  return {
    ...pack,
    phonotactics: { ...pack.phonotactics },
    silhouetteBias: { ...pack.silhouetteBias },
    listedVariants: { ...pack.listedVariants },
    variantRules: [...pack.variantRules],
    ...overrides,
  };
}

describe('style pack validation', () => {
  it('accepts the built-in style pack and preserves source, asset, and style metadata', () => {
    const result = validateStylePack(pack);

    expect(result.packId).toBe('british-literary-fantasy');
    expect(result.valid).toBe(true);
    expect(result.issues).toEqual([]);

    expect(pack.source).toEqual({
      source: {
        schemaVersion: 'name-forge.source.v1',
        id: 'built-in-style-packs@0.1.0',
        label: 'Built-in style packs',
        channel: 'built-in',
        version: '0.1.0',
        assetKinds: ['style-pack', 'phonotactics', 'listed-variants', 'variant-rules'],
        license: 'project-local',
        locale: 'fictional-en-GB-literary',
        enabledByDefault: true,
        priority: 100,
        cachePolicy: 'none',
        sourceNotes: 'Bundled fictionalized starter pack data maintained with the application.',
        trustNotes: 'No remote loading or external name database dependency; safe for deterministic offline generation.',
      },
      asset: {
        schemaVersion: 'name-forge.asset.v1',
        id: 'british-literary-fantasy@0.1.0',
        kind: 'style-pack',
        sourceId: 'built-in-style-packs@0.1.0',
        label: 'British literary fantasy style pack',
        version: '0.1.0',
        sourcePath: 'src/data/stylePacks.ts#british-literary-fantasy',
        license: 'project-local',
        locale: 'fictional-en-GB-literary',
        trustNotes: 'Fictionalized starter style data, not a real-world cultural or etymological authority.',
        limitations: [
          'Fictionalized style guidance, not a real-world cultural or etymological authority.',
          'Bundled starter data only; it should not be treated as exhaustive coverage of British naming traditions.',
        ],
      },
      assetKind: 'style-pack',
      packId: 'british-literary-fantasy',
      packVersion: '0.1.0',
      sourcePath: 'src/data/stylePacks.ts#british-literary-fantasy',
      styleNotes: 'Bookish, folktale-adjacent, British-literary texture for fictional character naming.',
      limitations: [
        'Fictionalized style guidance, not a real-world cultural or etymological authority.',
        'Bundled starter data only; it should not be treated as exhaustive coverage of British naming traditions.',
      ],
    });

    expect(pack.style).toEqual({
      schemaVersion: 'name-forge.style.v1',
      label: 'British literary fantasy',
      summary: 'Bookish, folktale-adjacent, softly literary fantasy naming texture.',
      tags: ['fictional', 'literary', 'fantasy', 'folktale-adjacent', 'soft'],
    });
  });

  it('reports exact contract errors for malformed source, asset, style, and variant metadata', () => {
    const result = validateStylePack(brokenPack({
      source: {
        ...pack.source,
        source: {
          ...pack.source.source,
          schemaVersion: 'bad.schema' as 'name-forge.source.v1',
          id: '',
          channel: 'remote-http',
          assetKinds: [],
          license: '',
          priority: Number.NaN,
        },
        asset: {
          ...pack.source.asset,
          schemaVersion: 'bad.schema' as 'name-forge.asset.v1',
          id: 'wrong-asset-id',
          kind: 'name-list',
          sourceId: 'wrong-source-id',
          license: '',
          limitations: [],
        },
        packId: 'wrong-pack-id',
        limitations: [],
      },
      style: {
        ...pack.style,
        summary: '',
        tags: [],
      },
      phonotactics: {
        ...pack.phonotactics,
        nuclei: [],
      },
      variantRules: [{
        ...pack.variantRules[0],
        sourceKind: 'remote-pack',
        relationship: 'alias',
        confidence: 'low',
        maxApplications: 0,
      }],
    }));

    expect(result.packId).toBe('british-literary-fantasy');
    expect(result.valid).toBe(false);
    expect(result.issues).toEqual([
      { severity: 'error', path: 'source.source.schemaVersion', message: 'Source descriptor schemaVersion must be name-forge.source.v1.' },
      { severity: 'error', path: 'source.source.id', message: 'Source descriptor id is required.' },
      { severity: 'error', path: 'source.source.assetKinds', message: 'At least one source asset kind is required.' },
      { severity: 'error', path: 'source.source.license', message: 'Source license is required.' },
      { severity: 'error', path: 'source.source.priority', message: 'Source priority must be a finite number.' },
      { severity: 'error', path: 'source.asset.schemaVersion', message: 'Asset descriptor schemaVersion must be name-forge.asset.v1.' },
      { severity: 'error', path: 'source.asset.license', message: 'Asset descriptor license is required.' },
      { severity: 'error', path: 'source.asset.limitations', message: 'String array must not be empty.' },
      { severity: 'error', path: 'source.asset.sourceId', message: 'Asset descriptor sourceId must match the source descriptor id.' },
      { severity: 'error', path: 'source.asset.kind', message: 'Asset kind must be declared by the source descriptor.' },
      { severity: 'error', path: 'source.limitations', message: 'String array must not be empty.' },
      { severity: 'error', path: 'source.asset.kind', message: 'Style pack asset kind must be style-pack.' },
      { severity: 'error', path: 'source.asset.id', message: 'Style pack asset id must match provenance sourceId.' },
      { severity: 'error', path: 'source.packId', message: 'Style pack source packId must match the pack id.' },
      { severity: 'error', path: 'style.summary', message: 'Style descriptor summary is required.' },
      { severity: 'error', path: 'style.tags', message: 'String array must not be empty.' },
      { severity: 'error', path: 'phonotactics.nuclei', message: 'Weighted values must not be empty.' },
      { severity: 'error', path: 'variantRules.0.maxApplications', message: 'Variant rule maxApplications must be a positive integer.' },
    ]);
  });

  it('exposes source and asset descriptors through the default source registry', () => {
    const registry = createDefaultRegistry();
    const summaries = registry.listStylePacks();
    const sources = registry.listSources();
    const assets = registry.listAssets();
    const result = registry.validateStylePack('british-literary-fantasy');

    expect(summaries).toHaveLength(1);
    expect(sources).toEqual([pack.source.source]);
    expect(assets).toEqual([pack.source.asset]);
    expect(summaries[0].source).toEqual(pack.source);
    expect(summaries[0].style).toEqual(pack.style);
    expect(result).toEqual({ packId: 'british-literary-fantasy', valid: true, issues: [] });
  });
});
