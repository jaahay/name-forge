import { describe, expect, it } from 'vitest';
import { createDefaultRegistry } from '../engine/registry';
import { generateEnsemble } from './ensemble';
import type { FictionCastSettings } from './types';

const baseSettings: FictionCastSettings = {
  castSize: 1,
  semanticBaseline: {
    familiarity: 'balanced',
    readability: 'clear',
    compactness: 'compact',
    styleAnchoring: 'balanced',
    spellingDistinctiveness: 'conventional',
  },
  stylePackId: 'british-literary-fantasy',
  seed: 'identity-audition-provenance',
  nameFormat: 'given-only',
};

function onlyName(nameFormat: NonNullable<FictionCastSettings['nameFormat']>, seed: string) {
  const ensemble = generateEnsemble({ ...baseSettings, nameFormat, seed }, createDefaultRegistry());
  const [name] = ensemble.names;
  if (!name) throw new Error('Expected one Fiction Cast name.');
  return name;
}

describe('Fiction Cast identity audition', () => {
  it('auditions generated components while keeping lexical and literal phrase material text-only', () => {
    const name = onlyName('epithet-place', 'identity-audition-epithet-place');
    const phrase = name.identityAudition;

    expect(phrase.contract).toBe('IdentityAuditionPhrase');
    expect(phrase.source).toBe('fiction-cast-identity');
    expect(phrase.identityText).toBe(name.displayName);
    expect(phrase.parts.map((part) => [part.kind, part.role])).toEqual([
      ['sound', 'given'],
      ['text', 'epithet'],
      ['literal', 'literal'],
      ['sound', 'place'],
    ]);

    const lexicalPart = phrase.parts[1];
    expect(lexicalPart?.kind).toBe('text');
    if (!lexicalPart || lexicalPart.kind !== 'text') throw new Error('Expected lexical audition part.');
    expect(lexicalPart.componentKind).toBe('lexical');
    expect('generatedNameId' in lexicalPart).toBe(false);
    expect('sourceNameId' in lexicalPart).toBe(false);

    const soundParts = phrase.parts.filter((part) => part.kind === 'sound');
    expect(soundParts).toHaveLength(2);
    for (const part of soundParts) {
      expect(part.generatedNameId.length).toBeGreaterThan(0);
      expect(part.componentId.length).toBeGreaterThan(0);
      expect(part.transcription.length).toBeGreaterThan(0);
      expect(phrase.speechText).toContain(part.speechText);
      expect(phrase.displayText).toContain(part.displayText);
    }
  });

  it('keeps a derived initial text-only while retaining its hidden generated source in the identity', () => {
    const name = onlyName('initials-family', 'identity-audition-initials-family');
    const phrase = name.identityAudition;
    const generatedGiven = name.identity.components.find((component) => component.kind === 'generated' && component.role === 'given');
    const derivedInitial = name.identity.components.find((component) => component.kind === 'derived');

    expect(generatedGiven).toBeDefined();
    expect(derivedInitial).toBeDefined();
    expect(phrase.parts.map((part) => [part.kind, part.role])).toEqual([
      ['text', 'given'],
      ['sound', 'family'],
    ]);

    const initialPart = phrase.parts[0];
    expect(initialPart?.kind).toBe('text');
    if (!initialPart || initialPart.kind !== 'text') throw new Error('Expected derived initial audition part.');
    expect(initialPart.componentKind).toBe('derived');
    expect(initialPart.componentId).toBe(derivedInitial?.id);
    expect(initialPart.value).toBe(derivedInitial?.value);
    expect(initialPart.value).not.toBe(generatedGiven?.value);
    expect(phrase.identityText).not.toContain(generatedGiven?.value ?? '');
  });

  it('keeps title lexemes text-only and the generated personal name sound-backed', () => {
    const name = onlyName('title-name', 'identity-audition-title-name');

    expect(name.identityAudition.parts.map((part) => [part.kind, part.role])).toEqual([
      ['text', 'title'],
      ['sound', 'given'],
    ]);
  });
});
