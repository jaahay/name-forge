import { describe, expect, it } from 'vitest';
import { generateEnsemble } from './ensemble';
import { createDefaultRegistry } from './registry';
import type { GenerationSettings } from './types';

const baseSettings: GenerationSettings = {
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

  it('threads rarity distributions through selected names', () => {
    const registry = createDefaultRegistry();
    const ensemble = generateEnsemble({ ...baseSettings, castSize: 5, rarityDistribution: 'mythic-arc' }, registry);

    expect(ensemble.names.map((name) => name.silhouette.rarityBand)).toEqual(['common', 'uncommon', 'rare', 'epic', 'legendary']);
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
    expect(next.names[0].name).not.toEqual(first.names[0].name);
    expect(next.names[2].name).not.toEqual(first.names[2].name);
    expect(next.diagnostics.summary).toContain('cast');
  });
});
