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
  it('accepts the built-in style pack and preserves provider, pack source, and design metadata', () => {
    const result = validateStylePack(pack);

    expect(result.packId).toBe('british-literary-fantasy');
    expect(result.valid).toBe(true);
    expect(result.issues).toEqual([]);

    expect(pack.source).toEqual({
      descriptor: {
        id: 'built-in-style-packs@0.1.0',
        label: 'Built-in style packs',
        kind: 'built-in-bundle',
        version: '0.1.0',
        origin: { kind: 'bundled', value: 'src/data/stylePacks.ts' },
        trustBoundary: 'bundled-offline',
        capabilities: ['style-packs', 'phonotactics', 'listed-variants', 'variant-rules'],
        sourceNotes: 'Bundled fictionalized starter pack data maintained with the application.',
        trustNotes: 'No remote loading or external name database dependency; safe for deterministic offline generation.',
      },
      packId: 'british-literary-fantasy',
      packVersion: '0.1.0',
      sourcePath: 'src/data/stylePacks.ts#british-literary-fantasy',
      licenseNotes: 'Project-local fictionalized style data; no external corpus attribution required.',
      styleNotes: 'Bookish, folktale-adjacent, British-literary texture for fictional character naming.',
      limitations: [
        'Fictionalized style guidance, not a real-world cultural or etymological authority.',
        'Bundled starter data only; it should not be treated as exhaustive coverage of British naming traditions.',
      ],
    });

    expect(pack.design).toEqual({
      schemaVersion: 'name-forge.style-pack.v1',
      status: 'starter',
      compatibleModes: ['fiction-cast'],
      intendedUse: 'Generate literary-fantasy character names with soft British-adjacent texture for fiction casts.',
      designPrinciples: [
        'Prefer readable names that can be spoken aloud on first sight.',
        'Blend soft consonants, liquid textures, and bookish endings rather than copying real-world names directly.',
        'Keep rarity tunable through weights instead of hard-coding a single exoticness level.',
      ],
      safetyNotes: [
        'Do not present outputs as culturally authentic British names.',
        'Do not infer real ethnicity, nationality, or ancestry from this fictionalized pack.',
      ],
    });
  });

  it('reports exact contract errors for malformed source, design, and variant metadata', () => {
    const result = validateStylePack(brokenPack({
      source: {
        ...pack.source,
        descriptor: {
          ...pack.source.descriptor,
          id: '',
          kind: 'http',
          origin: { kind: 'url', value: '' },
          capabilities: [],
        },
        packId: 'wrong-pack-id',
        limitations: [],
      },
      design: {
        ...pack.design,
        compatibleModes: [],
        intendedUse: '',
        designPrinciples: [],
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
      { severity: 'error', path: 'source.descriptor.id', message: 'Source descriptor id is required.' },
      { severity: 'error', path: 'source.descriptor.origin', message: 'Source descriptor origin is required.' },
      { severity: 'error', path: 'source.descriptor.capabilities', message: 'At least one source capability is required.' },
      { severity: 'error', path: 'source.limitations', message: 'String array must not be empty.' },
      { severity: 'error', path: 'source.packId', message: 'Style pack source packId must match the pack id.' },
      { severity: 'error', path: 'design.intendedUse', message: 'Style pack intended use is required.' },
      { severity: 'error', path: 'design.compatibleModes', message: 'At least one compatible mode is required.' },
      { severity: 'error', path: 'design.designPrinciples', message: 'String array must not be empty.' },
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
    expect(summaries[0].design).toEqual(pack.design);
    expect(result).toEqual({ packId: 'british-literary-fantasy', valid: true, issues: [] });
  });
});
