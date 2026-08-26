import { describe, expect, it } from 'vitest';
import { generateEnsemble } from './fictionCast/ensemble';
import { findFictionCastCollisionNotes } from './fictionCast/ensembleCollisionNotes';
import type { FictionCastSettings } from './fictionCast/types';
import { createDefaultRegistry } from './engine/registry';
import { rerollSelectedCastName } from './fictionCastReroll';
import { resolveSelectedNameId } from './ui/workbenchSelection';

const settings: FictionCastSettings = {
  castSize: 4,
  novelty: 0.5,
  pronounceability: 0.7,
  memorability: 0.6,
  culturalAnchoring: 0.65,
  orthographicWeirdness: 0.25,
  stylePackId: 'british-literary-fantasy',
  seed: 'selected-reroll-before',
  nameFormat: 'mixed',
  rolePreset: 'classic-ensemble',
  roleInfluence: 'light',
};

describe('rerollSelectedCastName', () => {
  it('replaces one slot while preserving every non-target composed identity and unaffected lock', () => {
    const registry = createDefaultRegistry();
    const before = generateEnsemble(settings, registry);
    const targetIndex = 1;
    const target = before.names[targetIndex];
    const firstName = before.names[0];
    const finalName = before.names[3];

    if (!target || !firstName || !finalName) throw new Error('Expected four generated fixture names.');

    const lockedNameIds = new Set([firstName.id, finalName.id]);
    const result = rerollSelectedCastName(
      before,
      target.id,
      lockedNameIds,
      'selected-reroll-after',
      registry,
    );

    expect(result).toBeDefined();
    if (!result) throw new Error('Expected selected-name reroll to succeed.');

    expect(result.ensemble.names).toHaveLength(before.names.length);
    before.names.forEach((name, index) => {
      if (index !== targetIndex) expect(result.ensemble.names[index]).toEqual(name);
    });

    const replacement = result.ensemble.names[targetIndex];
    expect(replacement).toBeDefined();
    if (!replacement) throw new Error('Expected replacement name in the target slot.');

    expect(result.replacementId).toBe(replacement.id);
    expect(result.replacementId).not.toBe(target.id);
    expect(replacement.role?.role).toBe(target.role?.role);
    expect(replacement.identity.format.kind).toBe(target.identity.format.kind);
    expect(result.committedSettings.seed).toBe('selected-reroll-after');
    expect(result.lockedNameIds).toEqual(lockedNameIds);
    expect(result.lockedNameIds.has(result.replacementId)).toBe(false);
    expect('historyArtifacts' in result).toBe(false);
    expect(result.ensemble.diagnostics).not.toBe(before.diagnostics);
  });

  it('refreshes composed-identity collision notes from the post-reroll active roster', () => {
    const registry = createDefaultRegistry();
    const before = generateEnsemble(settings, registry);
    const anchor = before.names[0];
    const target = before.names[1];

    if (!anchor || !target) throw new Error('Expected generated cast fixtures.');

    const sentinelTarget = {
      ...target,
      id: 'name-reroll-retired-target',
      displayName: anchor.displayName,
      identity: { ...target.identity, displayName: anchor.displayName },
    };
    const beforeWithSentinel = {
      ...before,
      names: before.names.map((name, index) => (index === 1 ? sentinelTarget : name)),
    };
    const beforeNotes = findFictionCastCollisionNotes(beforeWithSentinel.names);

    expect(beforeNotes.some((note) => (
      note.kind === 'same-visible-identity'
      && note.members.some((member) => member.id === sentinelTarget.id)
    ))).toBe(true);

    const result = rerollSelectedCastName(
      beforeWithSentinel,
      sentinelTarget.id,
      new Set(),
      'selected-reroll-collision-after',
      registry,
    );

    expect(result).toBeDefined();
    if (!result) throw new Error('Expected selected-name reroll to succeed.');

    const activeIds = new Set(result.ensemble.names.map((name) => name.id));
    const afterNotes = findFictionCastCollisionNotes(result.ensemble.names);

    expect(activeIds.has(sentinelTarget.id)).toBe(false);
    expect(activeIds.has(result.replacementId)).toBe(true);
    expect(afterNotes.every((note) => note.members.every((member) => activeIds.has(member.id)))).toBe(true);
    expect(afterNotes.some((note) => note.members.some((member) => member.id === sentinelTarget.id))).toBe(false);
  });

  it('returns the replacement id so inspection can remain on the same slot after identity changes', () => {
    const registry = createDefaultRegistry();
    const before = generateEnsemble(settings, registry);
    const target = before.names[2];

    if (!target) throw new Error('Expected a generated target name.');

    const result = rerollSelectedCastName(
      before,
      target.id,
      new Set(),
      'selected-reroll-selection-after',
      registry,
    );

    expect(result).toBeDefined();
    if (!result) throw new Error('Expected selected-name reroll to succeed.');

    expect(resolveSelectedNameId(result.replacementId, result.ensemble, result.lockedNameIds)).toBe(result.replacementId);
    expect(result.ensemble.names[2]?.id).toBe(result.replacementId);
  });

  it('refuses to reroll a locked selected name', () => {
    const registry = createDefaultRegistry();
    const before = generateEnsemble(settings, registry);
    const target = before.names[1];

    if (!target) throw new Error('Expected a generated target name.');

    expect(rerollSelectedCastName(
      before,
      target.id,
      new Set([target.id]),
      'selected-reroll-locked-after',
      registry,
    )).toBeUndefined();
  });
});
