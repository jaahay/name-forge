import { describe, expect, it } from 'vitest';
import { selectFromOptions } from '../engine/deterministicSelection';
import { createDefaultRegistry } from '../engine/registry';
import type { GenerationSettings } from '../engine/types';
import { generateGivenName } from '../naming/givenName';
import { createNameIdentity, identityStructureForFormat } from './identity';
import {
  componentMaterializationSeed,
  type FictionCastIdentityMaterializationContext,
} from './identityDeterminism';

const generationSettings: GenerationSettings = {
  novelty: 0.48,
  pronounceability: 0.62,
  memorability: 0.58,
  culturalAnchoring: 0.62,
  orthographicWeirdness: 0.5,
  stylePackId: 'british-literary-fantasy',
  seed: 'identity-determinism-settings',
};

function generatedName(seed: string, resultIndex = 0) {
  return generateGivenName({
    settings: generationSettings,
    registry: createDefaultRegistry(),
    determinism: { seed, resultIndex },
  });
}

function lexicalComponent(identity: ReturnType<typeof createNameIdentity>) {
  const component = identity.components.find((candidate) => candidate.kind === 'lexical');
  if (!component || component.kind !== 'lexical') throw new Error('Expected lexical identity component.');
  return component;
}

function derivedComponent(identity: ReturnType<typeof createNameIdentity>) {
  const component = identity.components.find((candidate) => candidate.kind === 'derived');
  if (!component || component.kind !== 'derived') throw new Error('Expected derived identity component.');
  return component;
}

describe('Fiction Cast identity determinism', () => {
  it('builds stable component namespaces from explicit materialization context', () => {
    const context: FictionCastIdentityMaterializationContext = {
      castSeed: 'cast-seed',
      slotIndex: 3,
      candidateAttempt: 5,
    };
    const structure = identityStructureForFormat('given-family');
    const primary = componentMaterializationSeed(context, structure, 'component:given:0');
    const family = componentMaterializationSeed(context, structure, 'component:family:0');
    const repeatedGiven = componentMaterializationSeed(context, structure, 'component:given:1');

    expect(primary).toBe(componentMaterializationSeed(context, structure, 'component:given:0'));
    expect(new Set([primary, family, repeatedGiven]).size).toBe(3);
    expect(primary).toContain('slot-3');
    expect(primary).toContain('candidate-5');
    expect(primary).toContain('format:given-family');
    expect(primary).toContain('v1');
  });

  it('changes the component namespace when structure version changes', () => {
    const context: FictionCastIdentityMaterializationContext = {
      castSeed: 'versioned-cast',
      slotIndex: 0,
      candidateAttempt: 0,
    };
    const structure = identityStructureForFormat('title-name');
    const nextVersion = { ...structure, version: structure.version + 1 };

    expect(componentMaterializationSeed(context, structure, 'component:title:0'))
      .not.toBe(componentMaterializationSeed(context, nextVersion, 'component:title:0'));
  });

  it('selects finite options reproducibly from the same explicit seed', () => {
    const options = ['alpha', 'beta', 'gamma', 'delta'] as const;
    const first = selectFromOptions(options, 'finite-choice');
    const second = selectFromOptions(options, 'finite-choice');

    expect(second).toBe(first);
    expect(options).toContain(first);
    expect(() => selectFromOptions([], 'empty-choice')).toThrow('Cannot select from an empty option set.');
  });

  it('selects lexical identity material independently of the generated given spelling', () => {
    const first = generatedName('lexical-independence:0');
    const alternatives = Array.from({ length: 8 }, (_, index) => generatedName(`lexical-independence:${index + 1}`, index + 1));
    const second = alternatives.find((candidate) => candidate.name !== first.name);
    if (!second) throw new Error('Expected a distinct generated given name for the lexical-independence fixture.');

    const context: FictionCastIdentityMaterializationContext = {
      castSeed: 'lexical-context',
      slotIndex: 2,
      candidateAttempt: 4,
    };
    const firstIdentity = createNameIdentity(first, undefined, 'title-name', context);
    const secondIdentity = createNameIdentity(second, undefined, 'title-name', context);

    expect(first.name).not.toBe(second.name);
    expect(lexicalComponent(secondIdentity).lexemeId).toBe(lexicalComponent(firstIdentity).lexemeId);
    expect(firstIdentity.format.version).toBe(1);
  });

  it('keeps derived initials deterministic from their retained source rather than independent randomness', () => {
    const given = generatedName('derived-source:given');
    const family = generatedName('derived-source:family', 1);
    const first = createNameIdentity(given, family, 'initials-family', {
      castSeed: 'derived-cast',
      slotIndex: 1,
      candidateAttempt: 0,
    });
    const second = createNameIdentity(given, family, 'initials-family', {
      castSeed: 'derived-cast',
      slotIndex: 1,
      candidateAttempt: 9,
    });

    expect(derivedComponent(second)).toEqual(derivedComponent(first));
    expect(derivedComponent(first).derivation.sourceComponentIds).toEqual(['component:given:0']);
  });
});
