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
  it('accepts the built-in style pack and preserves source descriptor metadata', () => {
    const result = validateStylePack(pack);

    expect(result.packId).toBe('british-literary-fantasy');
    expect(result.valid).toBe(true);
    expect(result.issues).toEqual([]);

    expect(pack.source).toEqual({
      id: 'built-in-style-packs@0.1.0',
      label: 'Built-in style packs',
      kind: 'built-in-bundle',
      version: '0.1.0',
      origin: { kind: 'bundled', value: 'src/data/stylePacks.ts' },
      sourceNotes: 'Bundled fictionalized starter pack data maintained with the application.',
      trustNotes: 'No remote loading or external name database dependency; safe for deterministic offline generation.',
    });
  });

  it('reports exact contract errors for malformed source and variant metadata', () => {
    const result = validateStylePack(brokenPack({
      source: {
        ...pack.source,
        id: '',
        kind: 'http' as const,
        origin: { kind: 'url', value: '' },
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
      { severity: 'error', path: 'source.id', message: 'Source descriptor id is required.' },
      { severity: 'error', path: 'source.origin', message: 'Source descriptor origin is required.' },
      { severity: 'error', path: 'phonotactics.nuclei', message: 'Weighted values must not be empty.' },
      { severity: 'error', path: 'variantRules.0.maxApplications', message: 'Variant rule maxApplications must be a positive integer.' },
    ]);
  });

  it('exposes style pack validation through the default source registry', () => {
    const registry = createDefaultRegistry();
    const summaries = registry.listStylePacks();
    const result = registry.validateStylePack('british-literary-fantasy');

    expect(summaries).toHaveLength(1);
    expect(summaries[0].source).toEqual(pack.source);
    expect(result).toEqual({ packId: 'british-literary-fantasy', valid: true, issues: [] });
  });
});
