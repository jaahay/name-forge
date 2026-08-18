import { describe, expect, it } from 'vitest';
import { generateEnsemble } from '../fictionCast/ensemble';
import type { FictionCastSettings } from '../fictionCast/types';
import { createDefaultRegistry } from '../engine/registry';
import { resolveNameSelection, selectedNameIdFromView } from './workbenchSelection';

const settings: FictionCastSettings = {
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
  it('resolves an empty selection to one active generated identity', () => {
    const ensemble = generateEnsemble(settings, createDefaultRegistry());
    const firstName = ensemble.names[0];

    if (!firstName) throw new Error('Expected fixture ensemble to generate a first name.');

    const selection = resolveNameSelection({ kind: 'name', nameId: '' }, ensemble, new Set());

    expect(selection).toEqual({ kind: 'name', nameId: firstName.id });
    expect(selectedNameIdFromView(selection)).toBe(firstName.id);
  });

  it('falls back to a locked visible name when the selected name disappears', () => {
    const ensemble = generateEnsemble(settings, createDefaultRegistry());
    const [, lockedName] = ensemble.names;

    if (!lockedName) throw new Error('Expected fixture ensemble to generate a second name.');

    const selection = resolveNameSelection({ kind: 'name', nameId: 'missing-name' }, ensemble, new Set([lockedName.id]));

    expect(selection).toEqual({ kind: 'name', nameId: lockedName.id });
  });

  it('keeps an empty active-name id only when the ensemble itself is empty', () => {
    const ensemble = generateEnsemble(settings, createDefaultRegistry());
    const emptyEnsemble = { ...ensemble, names: [] };
    const selection = resolveNameSelection({ kind: 'name', nameId: 'missing-name' }, emptyEnsemble, new Set());

    expect(selection).toEqual({ kind: 'name', nameId: '' });
  });
});
