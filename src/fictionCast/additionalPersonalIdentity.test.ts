import { describe, expect, it } from 'vitest';
import { createDefaultRegistry } from '../engine/registry';
import { generateEnsemble } from './ensemble';
import type { FictionCastSettings } from './types';

const settings: FictionCastSettings = {
  castSize: 1,
  semanticBaseline: {
    familiarity: 'balanced',
    readability: 'clear',
    compactness: 'balanced',
    spellingDistinctiveness: 'conventional',
  },
  stylePackId: 'british-literary-fantasy',
  seed: 'additional-personal-identity',
  nameFormat: 'given-additional-family',
  castVariation: 'balanced',
};

describe('additional-personal Fiction Cast identities', () => {
  it('materializes primary, additional, and family names as independent generated components', () => {
    const registry = createDefaultRegistry();
    const first = generateEnsemble(settings, registry).names[0];
    const replay = generateEnsemble(settings, registry).names[0];

    expect(first).toBeDefined();
    expect(replay).toBeDefined();
    if (!first || !replay) throw new Error('Expected generated additional-personal identity.');

    expect(replay.displayName).toBe(first.displayName);
    expect(replay.identity.components).toEqual(first.identity.components);
    expect(first.identity.format).toMatchObject({
      id: 'format:given-additional-family',
      version: 1,
      kind: 'given-additional-family',
      label: 'Given + additional name + family',
    });

    const generatedComponents = first.identity.components.filter((component) => component.kind === 'generated');
    expect(generatedComponents).toHaveLength(3);
    expect(generatedComponents.map((component) => component.role)).toEqual([
      'given',
      'additional-personal',
      'family',
    ]);
    expect(generatedComponents.map((component) => component.id)).toEqual([
      'component:given:0',
      'component:additional-personal:0',
      'component:family:0',
    ]);
    expect(new Set(generatedComponents.map((component) => component.generatedName.id)).size).toBe(3);

    expect(first.displayName).toBe(generatedComponents.map((component) => component.value).join(' '));
    expect(first.identity.phraseParts).toEqual(generatedComponents.map((component) => ({
      kind: 'component' as const,
      componentId: component.id,
    })));
    expect(first.identityAudition.parts.filter((part) => part.kind === 'sound')).toHaveLength(3);
  });
});
