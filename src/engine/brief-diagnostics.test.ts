import { describe, expect, it } from 'vitest';
import { generateEnsemble } from './ensemble';
import { createDefaultRegistry } from './registry';
import { diagnoseNameReadability } from './diagnostics';
import { serializeCastAsJson, serializeCastAsMarkdown } from './export';
import type { GenerationSettings } from './types';

const registry = createDefaultRegistry();

function baseSettings(overrides: Partial<GenerationSettings> = {}): GenerationSettings {
  return {
    castSize: 4,
    novelty: 0.48,
    pronounceability: 0.72,
    memorability: 0.65,
    culturalAnchoring: 0.62,
    orthographicWeirdness: 0.28,
    stylePackId: registry.listStylePacks()[0]?.id ?? 'british-literary-fantasy',
    seed: 'brief-test-seed',
    nameFormat: 'given-only',
    rarityDistribution: 'style-pack',
    rolePreset: 'none',
    roleInfluence: 'off',
    slotRoleOverrides: {},
    ...overrides,
  };
}

describe('briefed generation', () => {
  it('keeps empty brief behavior deterministic', () => {
    const first = generateEnsemble(baseSettings(), registry);
    const second = generateEnsemble(baseSettings({ brief: {} }), registry);

    expect(second.names.map((name) => name.name)).toEqual(first.names.map((name) => name.name));
    expect(second.settings.brief).toEqual({});
  });

  it('keeps the same seed/settings/brief reproducible', () => {
    const settings = baseSettings({
      brief: {
        useContext: 'frontier town rivals',
        toneWords: ['warm', 'eerie'],
        desiredAssociations: ['moon', 'iron'],
        avoidList: ['bob'],
        anchorExamples: ['Mira', 'Orlan'],
      },
    });

    const first = generateEnsemble(settings, registry);
    const second = generateEnsemble(settings, registry);

    expect(second.names.map((name) => name.name)).toEqual(first.names.map((name) => name.name));
    expect(second.names.map((name) => name.scores.overallFit)).toEqual(first.names.map((name) => name.scores.overallFit));
    expect(second.names.some((name) => name.briefInfluence)).toBe(true);
  });

  it('changes brief influence when avoid-list input changes', () => {
    const withoutAvoid = generateEnsemble(baseSettings({ seed: 'avoid-test', brief: { desiredAssociations: ['stone'] } }), registry);
    const withAvoid = generateEnsemble(baseSettings({ seed: 'avoid-test', brief: { desiredAssociations: ['stone'], avoidList: [withoutAvoid.names[0].name] } }), registry);

    expect(withAvoid.names.some((name) => name.briefInfluence?.penalties.length)).toBe(true);
  });
});

describe('readability diagnostics', () => {
  it('flags deterministic read friction without creating pronunciation claims', () => {
    const diagnostics = diagnoseNameReadability('Thrkkll Aeia');

    expect(diagnostics.map((diagnostic) => diagnostic.id)).toContain('consonant-cluster');
    expect(diagnostics.map((diagnostic) => diagnostic.id)).toContain('vowel-cluster');
    expect(diagnostics.every((diagnostic) => !diagnostic.detail.toLowerCase().includes('ipa'))).toBe(true);
  });

  it('exports brief and readability metadata', () => {
    const ensemble = generateEnsemble(baseSettings({ brief: { useContext: 'court intrigue', toneWords: ['sharp'], avoidList: ['bob'] } }), registry);
    const json = serializeCastAsJson(ensemble);
    const markdown = serializeCastAsMarkdown(ensemble);

    expect(json).toContain('"namingBrief"');
    expect(json).toContain('"readabilityDiagnostics"');
    expect(markdown).toContain('Naming brief:');
    expect(markdown).toContain('Readability notes:');
    expect(markdown).not.toContain('IPA');
  });
});
