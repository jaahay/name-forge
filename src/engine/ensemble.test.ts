import { describe, expect, it } from 'vitest';
import { generateEnsemble } from '../fictionCast/ensemble';
import { rarityBandForNovelty } from '../fictionCast/rarity';
import { resolveFictionCastSemanticIntent } from '../fictionCast/semanticIntent';
import type { FictionCastSettings } from '../fictionCast/types';
import { createDefaultRegistry } from './registry';

const baseSettings: FictionCastSettings = {
  castSize: 6,
  semanticBaseline: {
    familiarity: 'balanced',
    readability: 'clear',
    compactness: 'compact',
    styleAnchoring: 'balanced',
    spellingDistinctiveness: 'conventional',
  },
  stylePackId: 'british-literary-fantasy',
  seed: 'ensemble-role-test-seed',
  nameFormat: 'given-only',
  castVariation: 'balanced',
};

function noveltyRange(settings: FictionCastSettings): number {
  const values = Array.from({ length: settings.castSize }, (_, slotIndex) => (
    resolveFictionCastSemanticIntent(settings, { slotIndex }).generationSettings.novelty
  ));
  return Math.max(...values) - Math.min(...values);
}

describe('generateEnsemble role and variation controls', () => {
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

  it('makes Cast variation causal while keeping Familiar as the baseline center', () => {
    const tightSettings = { ...baseSettings, castSize: 7, castVariation: 'tight' as const };
    const balancedSettings = { ...baseSettings, castSize: 7, castVariation: 'balanced' as const };
    const wideSettings = { ...baseSettings, castSize: 7, castVariation: 'wide' as const };

    expect(noveltyRange(tightSettings)).toBeLessThan(noveltyRange(balancedSettings));
    expect(noveltyRange(balancedSettings)).toBeLessThan(noveltyRange(wideSettings));
    expect(tightSettings.semanticBaseline.familiarity).toBe('balanced');
    expect(wideSettings.semanticBaseline.familiarity).toBe('balanced');

    const registry = createDefaultRegistry();
    const tight = generateEnsemble(tightSettings, registry);
    const wide = generateEnsemble(wideSettings, registry);
    expect(wide.names.map((name) => name.primaryName.generationPlan.targetNovelty))
      .not.toEqual(tight.names.map((name) => name.primaryName.generationPlan.targetNovelty));
  });

  it('derives rarity evidence from each slot resolved novelty instead of a separate rarity policy', () => {
    const registry = createDefaultRegistry();
    const settings = { ...baseSettings, castSize: 5, castVariation: 'wide' as const };
    const ensemble = generateEnsemble(settings, registry);

    ensemble.names.forEach((name, slotIndex) => {
      const resolvedNovelty = resolveFictionCastSemanticIntent(settings, { slotIndex }).generationSettings.novelty;
      expect(name.rarityBand).toBe(rarityBandForNovelty(resolvedNovelty));
      expect('rarityBand' in name.primaryName.generationPlan).toBe(false);
    });
  });

  it('makes Cast variation naturally inert for a one-name cast', () => {
    const registry = createDefaultRegistry();
    const tight = generateEnsemble({ ...baseSettings, castSize: 1, castVariation: 'tight' }, registry);
    const wide = generateEnsemble({ ...baseSettings, castSize: 1, castVariation: 'wide' }, registry);

    expect(tight.names[0].primaryName).toEqual(wide.names[0].primaryName);
    expect(tight.names[0].rarityBand).toBe(wide.names[0].rarityBand);
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
