import { describe, expect, it } from 'vitest';
import { generateEnsemble } from '../fictionCast/ensemble';
import { rarityDistributionOptions, resolveFictionCastRarityBand } from '../fictionCast/rarity';
import type { FictionCastSettings } from '../fictionCast/types';
import { createDefaultRegistry } from './registry';

const baseSettings: FictionCastSettings = {
  castSize: 6,
  novelty: 0.5,
  pronounceability: 0.7,
  memorability: 0.6,
  culturalAnchoring: 0.65,
  orthographicWeirdness: 0.25,
  stylePackId: 'british-literary-fantasy',
  seed: 'ensemble-role-test-seed',
  nameFormat: 'given-only',
};

describe('generateEnsemble role and rarity controls', () => {
  it('assigns preset roles deterministically', () => {
    const registry = createDefaultRegistry();
    const settings = { ...baseSettings, castSize: 4, rolePreset: 'classic-ensemble' as const };
    const first = generateEnsemble(settings, registry);
    const second = generateEnsemble(settings, registry);

    expect(second.names.map((name) => name.role)).toEqual(first.names.map((name) => name.role));
    expect(first.names.map((name) => name.role?.role)).toEqual(['protagonist', 'rival', 'mentor', 'sidekick']);
  });

  it('keeps intrinsic scores and plans separate from Fiction Cast contextual metadata', () => {
    const registry = createDefaultRegistry();
    const ensemble = generateEnsemble({ ...baseSettings, castSize: 2, rolePreset: 'classic-ensemble', roleInfluence: 'light' }, registry);

    for (const name of ensemble.names) {
      expect('ensembleFit' in name.primaryName.scores).toBe(false);
      expect('roleFit' in name.primaryName.scores).toBe(false);
      expect('roleInfluence' in name.primaryName.generationPlan).toBe(false);
      expect(name.roleInfluence?.level).toBe('light');
      expect(name.contextualScores.ensembleFit).toBeGreaterThanOrEqual(0);
      expect(name.contextualScores.ensembleFit).toBeLessThanOrEqual(1);
      expect(name.contextualScores.roleFit).toBeGreaterThanOrEqual(0);
      expect(name.contextualScores.roleFit).toBeLessThanOrEqual(1);
      expect(name.contextualScores.overallFit).toBeGreaterThanOrEqual(0);
      expect(name.contextualScores.overallFit).toBeLessThanOrEqual(1);
    }
  });

  it('lets sparse slot roles override only selected slots', () => {
    const registry = createDefaultRegistry();
    const ensemble = generateEnsemble({
      ...baseSettings,
      castSize: 3,
      rolePreset: 'classic-ensemble',
      slotRoleOverrides: { 0: 'villain', 2: 'sidekick' },
    }, registry);

    expect(ensemble.names.map((name) => name.role?.role)).toEqual(['villain', 'rival', 'sidekick']);
    expect(ensemble.names[0].role?.source).toBe('slot');
    expect(ensemble.names[1].role?.source).toBe('preset');
    expect(ensemble.names[2].role?.source).toBe('slot');
  });

  it('preserves established rarity control labels and preset sequences', () => {
    expect(rarityDistributionOptions).toEqual([
      { value: 'style-pack', label: 'Style-pack weighted' },
      { value: 'grounded', label: 'Grounded cast' },
      { value: 'balanced', label: 'Balanced spread' },
      { value: 'rare-forward', label: 'Rare-forward cast' },
      { value: 'mythic-arc', label: 'Mythic arc' },
    ]);

    const bandsFor = (rarityDistribution: 'grounded' | 'balanced' | 'rare-forward' | 'mythic-arc') => (
      Array.from({ length: 8 }, (_, index) => resolveFictionCastRarityBand({ ...baseSettings, rarityDistribution }, index))
    );

    expect(bandsFor('grounded')).toEqual(['common', 'common', 'uncommon', 'common', 'uncommon', 'rare', 'common', 'uncommon']);
    expect(bandsFor('balanced')).toEqual(['common', 'uncommon', 'rare', 'uncommon', 'epic', 'common', 'rare', 'legendary']);
    expect(bandsFor('rare-forward')).toEqual(['rare', 'uncommon', 'epic', 'rare', 'common', 'legendary', 'rare', 'epic']);
    expect(bandsFor('mythic-arc')).toEqual(['common', 'uncommon', 'rare', 'epic', 'legendary', 'rare', 'epic', 'legendary']);
  });

  it('applies the style-pack novelty shift in the surface rarity policy', () => {
    const settings = { ...baseSettings, novelty: 0.5, rarityDistribution: 'style-pack' as const };
    const rarityBands = Array.from({ length: 8 }, (_, index) => resolveFictionCastRarityBand(settings, index));

    expect(rarityBands).toEqual(['rare', 'epic', 'rare', 'rare', 'rare', 'uncommon', 'uncommon', 'uncommon']);
  });

  it('threads surface-owned rarity distributions through selected names', () => {
    const registry = createDefaultRegistry();
    const ensemble = generateEnsemble({ ...baseSettings, castSize: 5, rarityDistribution: 'mythic-arc' }, registry);

    expect(ensemble.names.map((name) => name.rarityBand)).toEqual(['common', 'uncommon', 'rare', 'epic', 'legendary']);
    expect(ensemble.names.every((name) => !('rarityBand' in name.primaryName.generationPlan))).toBe(true);
  });

  it('changes rarity labels without changing generated primary names', () => {
    const registry = createDefaultRegistry();
    const grounded = generateEnsemble({ ...baseSettings, castSize: 5, rarityDistribution: 'grounded' }, registry);
    const mythic = generateEnsemble({ ...baseSettings, castSize: 5, rarityDistribution: 'mythic-arc' }, registry);

    expect(mythic.names.map((name) => name.primaryName.name)).toEqual(grounded.names.map((name) => name.primaryName.name));
    expect(mythic.names.map((name) => name.rarityBand)).not.toEqual(grounded.names.map((name) => name.rarityBand));
  });

  it('keeps composed Cast identities separate from the singular generated-name result', () => {
    const registry = createDefaultRegistry();
    const ensemble = generateEnsemble({ ...baseSettings, castSize: 1, nameFormat: 'given-family', seed: 'identity-result-boundary' }, registry);
    const name = ensemble.names[0];

    expect(name.displayName).toBe(name.identity.displayName);
    expect(name.primaryName.name).toBe(name.primaryName.spelling.text);
    expect(name.displayName).not.toBe(name.primaryName.name);
    for (const primitiveField of ['name', 'sound', 'soundProfile', 'spelling', 'spellingCandidates', 'generationPlan', 'scores', 'variants']) {
      expect(primitiveField in name).toBe(false);
    }
  });

  it('preserves modeled sounds and generation profiles for every sound-backed part of a composed identity', () => {
    const registry = createDefaultRegistry();
    const ensemble = generateEnsemble({ ...baseSettings, castSize: 1, nameFormat: 'epithet-place', seed: 'identity-audition-evidence' }, registry);
    const name = ensemble.names[0];

    expect(name.identity.format.kind).toBe('epithet-place');
    expect(name.identityAudition.identityText).toBe(name.displayName);

    const generatedParts = name.identity.parts.filter((part) => part.generation);
    expect(generatedParts.map((part) => part.role)).toEqual(['given', 'place']);
    expect(generatedParts).toHaveLength(2);
    for (const part of generatedParts) {
      expect(part.generation?.soundProfile.targets).toBeDefined();
      expect(part.generation?.sound.sequence.segments.length).toBeGreaterThan(0);
      expect(part.generation?.spelling.text).toBe(part.value);
    }
    expect(generatedParts[0]?.generation?.soundProfile).toBe(name.primaryName.soundProfile);
    expect(generatedParts[0]?.generation?.sound).toBe(name.primaryName.sound);
    expect(generatedParts[0]?.generation?.spelling).toBe(name.primaryName.spelling);
    expect(generatedParts[1]?.generation?.soundProfile).not.toBeUndefined();

    const soundParts = name.identityAudition.parts.filter((part) => part.kind === 'sound');
    expect(soundParts).toHaveLength(2);
    for (const part of soundParts) {
      if (part.kind !== 'sound') continue;
      expect(part.transcription.length).toBeGreaterThan(0);
      expect(name.identityAudition.displayText).toContain(part.displayText);
      expect(name.identityAudition.speechText).toContain(part.speechText);
    }
  });

  it('preserves locked names in their slots while rerolling unlocked names', () => {
    const registry = createDefaultRegistry();
    const first = generateEnsemble({ ...baseSettings, castSize: 4, seed: 'locked-before' }, registry);
    const lockedName = first.names[1];
    const next = generateEnsemble(
      { ...baseSettings, castSize: 4, seed: 'locked-after' },
      registry,
      [{ index: 1, name: lockedName }],
    );

    expect(next.names).toHaveLength(4);
    expect(next.names[1]).toEqual(lockedName);
    expect(next.names[0].displayName).not.toEqual(first.names[0].displayName);
    expect(next.names[2].displayName).not.toEqual(first.names[2].displayName);
    expect(next.diagnostics.summary).toContain('cast');
  });
});
