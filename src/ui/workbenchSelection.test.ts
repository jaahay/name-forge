import { describe, expect, it } from 'vitest';
import { generateEnsemble } from '../fictionCast/ensemble';
import type { FictionCastSettings } from '../fictionCast/types';
import { createDefaultRegistry } from '../engine/registry';
import { resolveSelectedNameId } from './workbenchSelection';

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

describe('active Fiction Cast selection', () => {
  it('uses the first generated identity when no active id is present', () => {
    const ensemble = generateEnsemble(settings, createDefaultRegistry());
    const firstName = ensemble.names[0];

    if (!firstName) throw new Error('Expected fixture ensemble to generate a first name.');

    expect(resolveSelectedNameId('', ensemble, new Set())).toBe(firstName.id);
  });

  it('keeps an active id while that identity remains in the cast', () => {
    const ensemble = generateEnsemble(settings, createDefaultRegistry());
    const selectedName = ensemble.names[2];

    if (!selectedName) throw new Error('Expected fixture ensemble to generate a third name.');

    expect(resolveSelectedNameId(selectedName.id, ensemble, new Set())).toBe(selectedName.id);
  });

  it('falls back to a locked visible identity when the active identity disappears', () => {
    const ensemble = generateEnsemble(settings, createDefaultRegistry());
    const lockedName = ensemble.names[1];

    if (!lockedName) throw new Error('Expected fixture ensemble to generate a second name.');

    expect(resolveSelectedNameId('missing-name', ensemble, new Set([lockedName.id]))).toBe(lockedName.id);
  });

  it('returns no active id for an empty cast', () => {
    const ensemble = generateEnsemble(settings, createDefaultRegistry());
    const emptyEnsemble = { ...ensemble, names: [] };

    expect(resolveSelectedNameId('missing-name', emptyEnsemble, new Set())).toBe('');
  });
});
