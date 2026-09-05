import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { FictionCastSettings } from '../fictionCast/types';
import {
  FictionCastRolesConfiguration,
  fictionCastRolesSummary,
} from './FictionCastRolesConfiguration';
import { fictionCastMode } from './modes';

const settings = fictionCastMode.defaultSettings('british-literary-fantasy');

function renderRoles(overrides: Partial<FictionCastSettings> = {}): string {
  const renderedSettings = { ...settings, ...overrides };
  return renderToStaticMarkup(
    <FictionCastRolesConfiguration
      settings={renderedSettings}
      onUpdateSetting={() => {}}
      onBack={() => {}}
    />,
  );
}

describe('FictionCastRolesConfiguration', () => {
  it('makes Off an unambiguous assignment state without child shaping controls', () => {
    const html = renderRoles({
      rolePreset: 'none',
      roleInfluence: 'strong',
      slotRoleOverrides: { 0: 'protagonist' },
    });

    for (const option of ['Off', 'Classic ensemble', 'Quest party', 'Court intrigue', 'Custom']) {
      expect(html).toContain(`>${option}</option>`);
    }
    expect(html).toContain('Off leaves every cast member unassigned');
    expect(html).not.toContain('id="roles-influence-title"');
    expect(html).not.toContain('id="roles-members-title"');
    expect(html).not.toContain('aria-label="Role assignments by cast member"');
    expect(fictionCastRolesSummary({ ...settings, rolePreset: 'none' })).toBe('Off');
  });

  it('keeps assignment, generation influence, and all 24 supported preset slots together', () => {
    const html = renderRoles({
      castSize: 24,
      rolePreset: 'classic-ensemble',
      roleInfluence: 'light',
      slotRoleOverrides: { 1: 'villain', 17: 'mentor' },
    });

    expect(html).toContain('id="roles-influence-title"');
    expect(html).toContain('>Generation influence</span>');
    for (const option of ['None', 'Light', 'Strong']) {
      expect(html).toContain(`>${option}</option>`);
    }
    expect(html).toContain('id="roles-members-title"');
    expect(html).toContain('>24 members</span>');
    expect((html.match(/aria-label="Role for slot /g) ?? []).length).toBe(24);
    expect(html).toContain('aria-label="Role for slot 24"');
    expect(html).toContain('Use role mix — Protagonist');
    expect(html).toContain('Use role mix — Sidekick');
    expect(html).toContain('<summary>Role guide</summary>');
    expect(html).toContain('not claims about how real people or story roles inherently sound');
    expect(fictionCastRolesSummary({
      ...settings,
      castSize: 24,
      rolePreset: 'classic-ensemble',
      roleInfluence: 'light',
      slotRoleOverrides: { 1: 'villain', 17: 'mentor' },
    })).toBe('Classic ensemble · Light · 2 customized');
  });

  it('gives Custom explicit unassigned semantics and withholds influence until a role exists', () => {
    const html = renderRoles({
      castSize: 4,
      rolePreset: 'custom',
      roleInfluence: 'strong',
      slotRoleOverrides: {},
    });

    expect(html).toContain('Custom assigns only the members you choose');
    expect(html).toContain('Unassigned members have no role');
    expect((html.match(/>Unassigned<\/option>/g) ?? []).length).toBe(4);
    expect(html).toContain('Assign at least one cast member before choosing generation influence');
    expect(html).not.toContain('<span>Generation influence</span>');
    expect(fictionCastRolesSummary({
      ...settings,
      castSize: 4,
      rolePreset: 'custom',
      roleInfluence: 'strong',
      slotRoleOverrides: {},
    })).toBe('Custom · 0 assigned');
  });

  it('summarizes assigned Custom roles with the active influence level', () => {
    expect(fictionCastRolesSummary({
      ...settings,
      castSize: 6,
      rolePreset: 'custom',
      roleInfluence: 'light',
      slotRoleOverrides: { 0: 'protagonist', 5: 'outsider', 9: 'villain' },
    })).toBe('Custom · 2 assigned · Light');
  });

  it('provides ordinary-language guidance for every shipped role behind one disclosure', () => {
    const html = renderRoles();

    for (const role of ['Protagonist', 'Rival', 'Mentor', 'Sidekick', 'Guardian', 'Outsider', 'Villain', 'Wildcard']) {
      expect(html).toContain(`>${role}</h4>`);
    }
    expect((html.match(/<strong>Naming direction:<\/strong>/g) ?? []).length).toBe(8);
  });
});
