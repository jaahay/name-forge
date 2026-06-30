import { describe, expect, it } from 'vitest';
import { generateEnsemble } from '../engine/ensemble';
import { createDefaultRegistry } from '../engine/registry';
import type { GenerationSettings } from '../engine/types';
import { resolveNameSelection, selectedNameIdFromView } from './workbenchSelection';

const settings: GenerationSettings = {
  castSize: 3,
  novelty: 0.5,
  pronounceability: 0.7,
  memorability: 0.6,
  culturalAnchoring: 0.65,
  orthographicWeirdness: 0.25,
  stylePackId: 'british-literary-fantasy',
  seed: 'workbench-selection-test-seed',
  nameFormat: 'mixed',
  rolePreset: 'classic-ensemble',
  roleInfluence: 'light',
};

describe('workbench selection state', () => {
  it('treats all names as navigation state rather than a selected name id', () => {
    const ensemble = generateEnsemble(settings, createDefaultRegistry());
    const selection = resolveNameSelection({ kind: 'all-names' }, ensemble, new Set());

    expect(selection).toEqual({ kind: 'all-names' });
    expect(selectedNameIdFromView(selection)).toBe('');
  });

  it('falls back to a locked visible name when the selected name disappears', () => {
    const ensemble = generateEnsemble(settings, createDefaultRegistry());
    const [, lockedName] = ensemble.names;

    if (!lockedName) throw new Error('Expected fixture ensemble to generate a second name.');

    const selection = resolveNameSelection({ kind: 'name', nameId: 'missing-name' }, ensemble, new Set([lockedName.id]));

    expect(selection).toEqual({ kind: 'name', nameId: lockedName.id });
  });
});
