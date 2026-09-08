import { describe, expect, it } from 'vitest';
import { generateEnsemble } from '../fictionCast/ensemble';
import { fictionCastEpithetLexemes, fictionCastTitleLexemes } from '../fictionCast/identityLexicon';
import type { FictionCastRarityBand } from '../fictionCast/rarity';
import { fictionCastBaselineGenerationSettings } from '../fictionCast/semanticIntent';
import type { FictionCastGeneratedName, FictionCastSettings } from '../fictionCast/types';
import { generateName } from '../naming/generator';
import { createDefaultRegistry } from './registry';

const settings: FictionCastSettings = {
  castSize: 6,
  semanticBaseline: {
    familiarity: 'balanced',
    readability: 'clear',
    compactness: 'compact',
    styleAnchoring: 'balanced',
    spellingDistinctiveness: 'conventional',
  },
  stylePackId: 'british-literary-fantasy',
  seed: 'deterministic-test-seed',
  nameFormat: 'given-only',
};
const generationSettings = fictionCastBaselineGenerationSettings(settings);
const mmoRarityBands: FictionCastRarityBand[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

function nameListFor(overrides: Partial<FictionCastSettings> = {}): string[] {
  return generateEnsemble({ ...settings, ...overrides }, createDefaultRegistry()).names.map((name) => name.displayName);
}

function onlyNameFor(overrides: Partial<FictionCastSettings> = {}): FictionCastGeneratedName {
  const ensemble = generateEnsemble({ ...settings, castSize: 1, ...overrides }, createDefaultRegistry());
  expect(ensemble.names).toHaveLength(1);
  const [name] = ensemble.names;
  expect(name).toBeDefined();
  if (!name) throw new Error('Expected generated name.');
  return name;
}

describe('generateEnsemble', () => {
  it('is deterministic for the same seed and settings', () => {
    const registry = createDefaultRegistry();
    const first = generateEnsemble(settings, registry);
    const second = generateEnsemble(settings, registry);
    expect(second.names.map((name) => name.displayName)).toEqual(first.names.map((name) => name.displayName));
    expect(second.names.map((name) => name.contextualScores.overallFit)).toEqual(first.names.map((name) => name.contextualScores.overallFit));
    expect(second.names.map((name) => name.primaryName.soundProfile)).toEqual(first.names.map((name) => name.primaryName.soundProfile));
    expect(second.names.map((name) => name.primaryName.sound.transcription)).toEqual(first.names.map((name) => name.primaryName.sound.transcription));
    expect(second.names.map((name) => name.primaryName.spelling.text)).toEqual(first.names.map((name) => name.primaryName.spelling.text));
  });

  it('changes generated names when the seed changes', () => {
    expect(nameListFor({ seed: 'deterministic-test-seed:b' })).not.toEqual(nameListFor());
  });

  it('clamps cast size to the supported output range', () => {
    expect(generateEnsemble({ ...settings, castSize: 0 }, createDefaultRegistry()).names).toHaveLength(1);
    expect(generateEnsemble({ ...settings, castSize: 50 }, createDefaultRegistry()).names).toHaveLength(24);
  });

  it('materializes sound-first candidates before selecting the app-facing name', () => {
    const registry = createDefaultRegistry();
    const pack = registry.getStylePack(settings.stylePackId);
    const generated = generateName({
      settings: generationSettings,
      pack,
      seed: 'candidate',
      index: 0,
    });

    expect(generated.soundProfile.targets).toBeDefined();
    expect(Object.prototype.hasOwnProperty.call(generated.soundProfile, 'contract')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(generated.soundProfile, 'version')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(generated.soundProfile, 'id')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(generated.soundProfile, 'source')).toBe(false);
    expect(generated.sound.contract).toBe('SoundCandidate');
    expect(generated.sound.sequence.contract).toBe('SegmentSequence');
    expect(generated.sound.transcription).toMatch(/^\/.+\/$/);
    expect(generated.spellingCandidates.length).toBeGreaterThan(0);
    expect('rarityBand' in generated.generationPlan).toBe(false);
    expect('roleInfluence' in generated.generationPlan).toBe(false);
    const [topSpelling] = generated.spellingCandidates;
    expect(topSpelling).toBeDefined();
    if (!topSpelling) throw new Error('Expected top ranked spelling.');
    expect(generated.spelling).toBe(topSpelling);
    expect(generated.spelling.rank).toBe(1);
    expect(generated.spelling.text.length).toBeGreaterThan(0);
  });

  it('replays exactly from the same explicit generateName arguments', () => {
    const registry = createDefaultRegistry();
    const pack = registry.getStylePack(settings.stylePackId);
    const options = {
      settings: generationSettings,
      pack,
      seed: 'primitive-replay',
      index: 2,
    } as const;

    expect(generateName(options)).toEqual(generateName(options));
  });

  it('returns intrinsic name scores plus Fiction Cast contextual fit signals', () => {
    const ensemble = generateEnsemble(settings, createDefaultRegistry());
    expect(ensemble.names).toHaveLength(settings.castSize);
    for (const name of ensemble.names) {
      const primaryName = name.primaryName;
      expect(name.displayName.length).toBeGreaterThan(0);
      expect(primaryName.soundProfile.targets).toBeDefined();
      expect(primaryName.sound.contract).toBe('SoundCandidate');
      expect(primaryName.sound.sequence.contract).toBe('SegmentSequence');
      expect(primaryName.sound.transcription).toMatch(/^\/.+\/$/);
      expect(primaryName.spelling.rank).toBe(1);
      expect(primaryName.name).toBe(primaryName.spelling.text);
      expect(primaryName.spellingCandidates.length).toBeGreaterThan(0);
      const [selectedCandidate] = primaryName.spellingCandidates;
      expect(selectedCandidate).toBeDefined();
      if (!selectedCandidate) throw new Error('Expected retained selected spelling candidate.');
      expect(selectedCandidate).toEqual(primaryName.spelling);
      expect(primaryName.spellingCandidates.map((candidate) => candidate.rank)).toEqual(primaryName.spellingCandidates.map((candidate) => candidate.rank).sort((left, right) => left - right));
      expect(new Set(primaryName.spellingCandidates.map((candidate) => candidate.text)).has(primaryName.spelling.text)).toBe(true);
      expect(primaryName.generationPlan.syllableCount).toBeGreaterThan(0);
      expect(Array.isArray(primaryName.variants)).toBe(true);
      expect(primaryName.scores.overallFit).toBeGreaterThan(0);
      expect(primaryName.scores.styleFit).toBeGreaterThan(0);
      expect('ensembleFit' in primaryName.scores).toBe(false);
      expect('roleFit' in primaryName.scores).toBe(false);
      expect(name.contextualScores.ensembleFit).toBeGreaterThanOrEqual(0);
      expect(name.contextualScores.roleFit).toBeGreaterThanOrEqual(0);
      expect(name.contextualScores.overallFit).toBeGreaterThanOrEqual(0);
    }
  });

  it('tracks expanded ensemble diagnostics', () => {
    const ensemble = generateEnsemble(settings, createDefaultRegistry());
    expect(ensemble.diagnostics.repeatedInitials).toBeLessThan(settings.castSize);
    expect(ensemble.diagnostics.repeatedEndings).toBeLessThan(settings.castSize);
    expect(ensemble.diagnostics.repeatedCadences).toBeLessThan(settings.castSize);
    expect(ensemble.diagnostics.repeatedRarityBands).toBeLessThan(settings.castSize);
  });

  it('keeps role presets metadata-only when role influence is off', () => {
    const roleNeutral = generateEnsemble({ ...settings, rolePreset: 'none', roleInfluence: 'off' }, createDefaultRegistry());
    const roleLabeled = generateEnsemble({ ...settings, rolePreset: 'classic-ensemble', roleInfluence: 'off' }, createDefaultRegistry());

    expect(roleLabeled.names.map((name) => name.displayName)).toEqual(roleNeutral.names.map((name) => name.displayName));
    expect(roleLabeled.names.map((name) => name.contextualScores.overallFit)).toEqual(roleNeutral.names.map((name) => name.contextualScores.overallFit));

    const [firstName] = roleLabeled.names;
    expect(firstName).toBeDefined();
    if (!firstName) throw new Error('Expected first role-labeled name.');
    expect(firstName.role?.role).toBe('protagonist');
    expect(firstName.roleInfluence).toBeUndefined();
    expect('roleInfluence' in firstName.primaryName.generationPlan).toBe(false);
    expect(firstName.contextualScores.roleFit).toBe(0.72);
  });

  it('applies deterministic role influence when enabled', () => {
    const offNames = nameListFor({ rolePreset: 'classic-ensemble', roleInfluence: 'off' });
    const lightFirst = generateEnsemble({ ...settings, rolePreset: 'classic-ensemble', roleInfluence: 'light' }, createDefaultRegistry());
    const lightSecond = generateEnsemble({ ...settings, rolePreset: 'classic-ensemble', roleInfluence: 'light' }, createDefaultRegistry());
    const strong = generateEnsemble({ ...settings, rolePreset: 'classic-ensemble', roleInfluence: 'strong' }, createDefaultRegistry());

    expect(lightSecond.names.map((name) => name.displayName)).toEqual(lightFirst.names.map((name) => name.displayName));
    expect(lightFirst.names.map((name) => name.displayName)).not.toEqual(offNames);

    const [lightName] = lightFirst.names;
    const [strongName] = strong.names;
    expect(lightName).toBeDefined();
    expect(strongName).toBeDefined();
    if (!lightName || !strongName) throw new Error('Expected role-influenced names.');
    expect(lightName.role?.role).toBe('protagonist');
    expect(lightName.roleInfluence?.level).toBe('light');
    expect(lightName.roleInfluence?.profileId).toBe('role-profile:protagonist');
    expect(lightName.roleInfluence?.label).toBe('Protagonist clarity');
    expect('roleInfluence' in lightName.primaryName.generationPlan).toBe(false);
    expect(lightName.contextualScores.roleFit).toBeGreaterThan(0);
    expect(strongName.roleInfluence?.level).toBe('strong');
    expect(strongName.contextualScores.roleFit).toBeGreaterThan(0);
  });

  it('uses classic MMO rarity bands as Fiction Cast metadata', () => {
    const ensemble = generateEnsemble(settings, createDefaultRegistry());
    expect(ensemble.names).toHaveLength(settings.castSize);
    for (const name of ensemble.names) {
      expect(mmoRarityBands).toContain(name.rarityBand);
    }
  });

  it('keeps given-only identities equivalent to the generated single-name primitive', () => {
    const name = onlyNameFor({ nameFormat: 'given-only' });
    const identity = name.identity;
    expect(identity.format.kind).toBe('given-only');
    expect(identity.components).toHaveLength(1);
    const [givenComponent] = identity.components;
    expect(givenComponent).toBeDefined();
    if (!givenComponent || givenComponent.kind !== 'generated') throw new Error('Expected generated given component.');
    expect(givenComponent.role).toBe('given');
    expect(name.displayName).toBe(givenComponent.value);
    expect(name.primaryName.name).toBe(givenComponent.value);
    expect(identity.displayName).toBe(givenComponent.value);
    expect(givenComponent.generatedName.id).toBe(name.primaryName.id);
  });

  it('formats generated given and family components through an identity frame', () => {
    const name = onlyNameFor({ nameFormat: 'given-family' });
    const identity = name.identity;
    expect(identity.format.kind).toBe('given-family');
    expect(identity.components).toHaveLength(2);
    const [givenComponent, familyComponent] = identity.components;
    if (givenComponent?.kind !== 'generated' || familyComponent?.kind !== 'generated') {
      throw new Error('Expected generated given and family components.');
    }
    expect(givenComponent.role).toBe('given');
    expect(familyComponent.role).toBe('family');
    expect(name.displayName).toBe(`${givenComponent.value} ${familyComponent.value}`);
    expect(name.primaryName.name).toBe(givenComponent.value);
    expect(givenComponent.generatedName.id).not.toBe(familyComponent.generatedName.id);
    expect(familyComponent.generatedName.name).toBe(familyComponent.value);
  });

  it('retains the generated personal source behind deterministic initialed bylines', () => {
    const first = onlyNameFor({ nameFormat: 'initials-family' });
    const second = onlyNameFor({ nameFormat: 'initials-family' });
    const identity = first.identity;
    expect(identity.displayName).toBe(second.identity.displayName);
    expect(identity.format.kind).toBe('initials-family');
    expect(identity.components).toHaveLength(3);
    const [givenComponent, initialComponent, familyComponent] = identity.components;
    if (givenComponent?.kind !== 'generated' || initialComponent?.kind !== 'derived' || familyComponent?.kind !== 'generated') {
      throw new Error('Expected generated given, derived initial, and generated family components.');
    }
    expect(givenComponent.role).toBe('given');
    expect(initialComponent.role).toBe('given');
    expect(familyComponent.role).toBe('family');
    expect(initialComponent.value).toMatch(/^[A-Z]\.$/);
    expect(initialComponent.derivation.ruleId).toBe('initials');
    expect(initialComponent.derivation.sourceComponentIds).toEqual([givenComponent.id]);
    expect(first.displayName).toBe(`${initialComponent.value} ${familyComponent.value}`);
    expect(identity.phraseParts).toEqual([
      { kind: 'component', componentId: initialComponent.id },
      { kind: 'component', componentId: familyComponent.id },
    ]);
  });

  it('formats titled identities from lexical provenance and generated name material', () => {
    const first = onlyNameFor({ nameFormat: 'title-name' });
    const second = onlyNameFor({ nameFormat: 'title-name' });
    const identity = first.identity;
    expect(identity.displayName).toBe(second.identity.displayName);
    expect(identity.format.kind).toBe('title-name');
    expect(identity.components).toHaveLength(2);
    const [titleComponent, givenComponent] = identity.components;
    if (titleComponent?.kind !== 'lexical' || givenComponent?.kind !== 'generated') {
      throw new Error('Expected lexical title and generated given components.');
    }
    expect(titleComponent.role).toBe('title');
    expect(givenComponent.role).toBe('given');
    expect(fictionCastTitleLexemes.map((lexeme) => lexeme.text)).toContain(titleComponent.value);
    expect(first.displayName).toBe(`${titleComponent.value} ${givenComponent.value}`);
    expect(titleComponent.lexemeId).toMatch(/^title:/);
    expect(titleComponent.inventoryId).toBe('fiction-cast:titles:v1');
    expect('generatedName' in titleComponent).toBe(false);
  });

  it('formats deterministic place-style identities with generated and lexical provenance', () => {
    const first = onlyNameFor({ nameFormat: 'epithet-place' });
    const second = onlyNameFor({ nameFormat: 'epithet-place' });
    const identity = first.identity;
    expect(identity.displayName).toBe(second.identity.displayName);
    expect(identity.format.kind).toBe('epithet-place');
    expect(identity.components).toHaveLength(3);
    const [givenComponent, epithetComponent, placeComponent] = identity.components;
    if (givenComponent?.kind !== 'generated' || epithetComponent?.kind !== 'lexical' || placeComponent?.kind !== 'generated') {
      throw new Error('Expected generated given, lexical epithet, and generated place components.');
    }
    expect(givenComponent.role).toBe('given');
    expect(epithetComponent.role).toBe('epithet');
    expect(placeComponent.role).toBe('place');
    expect(fictionCastEpithetLexemes.map((lexeme) => lexeme.text)).toContain(epithetComponent.value);
    expect(epithetComponent.inventoryId).toBe('fiction-cast:epithets:v1');
    expect('generatedName' in epithetComponent).toBe(false);
    expect(placeComponent.value).toMatch(/^[A-Z][A-Za-z]+$/);
    expect(first.displayName).toBe(`${givenComponent.value} ${epithetComponent.value} of ${placeComponent.value}`);
    expect(givenComponent.generatedName.id).not.toBe(placeComponent.generatedName.id);
    expect(placeComponent.generatedName.name).toBe(placeComponent.value);
    expect(identity.phraseParts).toEqual([
      { kind: 'component', componentId: givenComponent.id },
      { kind: 'component', componentId: epithetComponent.id },
      { kind: 'literal', value: 'of' },
      { kind: 'component', componentId: placeComponent.id },
    ]);
  });

  it('materializes Mixed formats reproducibly from the seed with bounded anti-clumping', () => {
    const registry = createDefaultRegistry();
    const supportedFormats = ['given-only', 'given-family', 'initials-family', 'title-name', 'epithet-place'] as const;
    const mixedSettings: FictionCastSettings = {
      ...settings,
      castSize: 24,
      seed: 'mixed-format-seed-a',
      nameFormat: 'mixed',
    };
    const first = generateEnsemble(mixedSettings, registry);
    const replay = generateEnsemble(mixedSettings, registry);
    const formats = first.names.map((name) => name.identity.format.kind);
    const replayFormats = replay.names.map((name) => name.identity.format.kind);
    const formerFixedCycle = Array.from({ length: mixedSettings.castSize }, (_, index) => supportedFormats[index % supportedFormats.length]);

    expect(first.names).toHaveLength(24);
    expect(replayFormats).toEqual(formats);
    expect(formats.every((format) => supportedFormats.includes(format))).toBe(true);
    expect(formats).not.toEqual(formerFixedCycle);
    for (let index = 2; index < formats.length; index += 1) {
      expect(formats[index] === formats[index - 1] && formats[index] === formats[index - 2]).toBe(false);
    }

    for (const castSize of [1, 24]) {
      const ensemble = generateEnsemble({ ...mixedSettings, castSize }, registry);
      expect(ensemble.names).toHaveLength(castSize);
      expect(ensemble.names.every((name) => supportedFormats.includes(name.identity.format.kind))).toBe(true);
    }
  });

  it('lets new seeds change both Mixed slot order and relative format counts', () => {
    const registry = createDefaultRegistry();
    const supportedFormats = ['given-only', 'given-family', 'initials-family', 'title-name', 'epithet-place'] as const;
    const formatsForSeed = (seed: string) => generateEnsemble({
      ...settings,
      castSize: 12,
      seed,
      nameFormat: 'mixed',
    }, registry).names.map((name) => name.identity.format.kind);
    const countSignature = (formats: ReturnType<typeof formatsForSeed>) => supportedFormats.map(
      (format) => formats.filter((candidate) => candidate === format).length,
    );
    const first = formatsForSeed('mixed-format-seed-a');
    const second = formatsForSeed('mixed-format-seed-b');

    expect(second).not.toEqual(first);
    expect(countSignature(second)).not.toEqual(countSignature(first));
  });
});