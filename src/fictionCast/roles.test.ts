import { describe, expect, it } from 'vitest';
import {
  castRoleGuidance,
  castRoleOptions,
  configuredRoleOverrideCount,
  hasAssignedCastRoles,
  isRoleInfluenceActive,
  resolveCastRole,
  resolveEffectiveCastRoleOverride,
  withCastRoleOverride,
} from './roles';
import type { FictionCastSettings } from './types';

const settings: FictionCastSettings = {
  castSize: 4,
  semanticBaseline: {
    familiarity: 'balanced',
    readability: 'balanced',
    compactness: 'balanced',
    styleAnchoring: 'balanced',
    spellingDistinctiveness: 'balanced',
  },
  stylePackId: 'british-literary-fantasy',
  seed: 'roles-test-seed',
  nameFormat: 'mixed',
  castVariation: 'balanced',
  rolePreset: 'none',
  roleInfluence: 'off',
};

describe('Fiction Cast role assignment', () => {
  it('treats Off as authoritative even when stale slot overrides remain', () => {
    const offSettings: FictionCastSettings = {
      ...settings,
      rolePreset: 'none',
      roleInfluence: 'strong',
      slotRoleOverrides: { 0: 'protagonist' },
    };

    expect(hasAssignedCastRoles(offSettings)).toBe(false);
    expect(resolveCastRole(offSettings, 0)).toBeUndefined();
    expect(isRoleInfluenceActive(offSettings)).toBe(false);
  });

  it('lets Custom assign only explicit slots and leaves the rest unassigned', () => {
    const emptyCustom: FictionCastSettings = {
      ...settings,
      rolePreset: 'custom',
      roleInfluence: 'light',
    };
    const assignedCustom: FictionCastSettings = {
      ...emptyCustom,
      slotRoleOverrides: { 1: 'mentor', 3: 'wildcard' },
    };

    expect(hasAssignedCastRoles(emptyCustom)).toBe(false);
    expect(isRoleInfluenceActive(emptyCustom)).toBe(false);
    expect(resolveCastRole(emptyCustom, 0)).toBeUndefined();

    expect(hasAssignedCastRoles(assignedCustom)).toBe(true);
    expect(isRoleInfluenceActive(assignedCustom)).toBe(true);
    expect(resolveCastRole(assignedCustom, 0)).toBeUndefined();
    expect(resolveCastRole(assignedCustom, 1)).toMatchObject({ role: 'mentor', source: 'slot', slot: 2 });
    expect(resolveCastRole(assignedCustom, 2)).toBeUndefined();
    expect(resolveCastRole(assignedCustom, 3)).toMatchObject({ role: 'wildcard', source: 'slot', slot: 4 });
  });

  it('uses preset defaults while allowing an explicit slot role to override one member', () => {
    const presetSettings: FictionCastSettings = {
      ...settings,
      rolePreset: 'classic-ensemble',
      roleInfluence: 'light',
      slotRoleOverrides: { 1: 'villain' },
    };

    expect(resolveCastRole(presetSettings, 0)).toMatchObject({ role: 'protagonist', source: 'preset', slot: 1 });
    expect(resolveCastRole(presetSettings, 1)).toMatchObject({ role: 'villain', source: 'slot', slot: 2 });
    expect(isRoleInfluenceActive(presetSettings)).toBe(true);
  });

  it('treats inherited-equivalent overrides as no-ops rather than customizations', () => {
    const legacySettings: FictionCastSettings = {
      ...settings,
      rolePreset: 'classic-ensemble',
      roleInfluence: 'light',
      slotRoleOverrides: { 0: 'protagonist', 1: 'villain' },
    };

    expect(resolveEffectiveCastRoleOverride(legacySettings, 0)).toBeUndefined();
    expect(resolveCastRole(legacySettings, 0)).toMatchObject({ role: 'protagonist', source: 'preset', slot: 1 });
    expect(resolveEffectiveCastRoleOverride(legacySettings, 1)).toBe('villain');
    expect(configuredRoleOverrideCount(legacySettings)).toBe(1);
  });

  it('stores only material deviations from a preset role', () => {
    const presetSettings: FictionCastSettings = {
      ...settings,
      rolePreset: 'classic-ensemble',
    };

    expect(withCastRoleOverride(presetSettings, 0, 'protagonist')).toBeUndefined();
    expect(withCastRoleOverride(presetSettings, 0, 'villain')).toEqual({ 0: 'villain' });
    expect(withCastRoleOverride({ ...presetSettings, slotRoleOverrides: { 0: 'villain' } }, 0, undefined)).toBeUndefined();
  });

  it('keeps role guidance co-located and complete for every selectable role', () => {
    expect(castRoleGuidance.map((guidance) => guidance.role)).toEqual(castRoleOptions.map((option) => option.value));
    for (const guidance of castRoleGuidance) {
      expect(guidance.label.length).toBeGreaterThan(0);
      expect(guidance.storyMeaning.length).toBeGreaterThan(0);
      expect(guidance.namingDirection.length).toBeGreaterThan(0);
    }
  });
});
