import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { createDefaultRegistry } from '../engine/registry';
import type { FictionCastSettings } from '../fictionCast/types';
import { ConfigureCriteria } from './ConfigureCriteria';
import { fictionCastMode } from './modes';

const registry = createDefaultRegistry();
const stylePacks = registry.listStylePacks();
const stylePackId = stylePacks[0]?.id ?? 'british-literary-fantasy';
const settings = fictionCastMode.defaultSettings(stylePackId);

function renderCriteria(overrides: Partial<FictionCastSettings> = {}): string {
  const renderedSettings = { ...settings, ...overrides };

  return renderToStaticMarkup(
    <ConfigureCriteria
      mode={fictionCastMode}
      stylePacks={stylePacks}
      settings={renderedSettings}
      hasGeneratedCast
      lockedCount={0}
      rolesTriggerRef={null}
      onOpenRoles={() => {}}
      onUpdateSetting={() => {}}
      onCommitSettings={() => {}}
      onRandomizeCriteria={() => {}}
      onClearLockedNames={() => {}}
    />,
  );
}

describe('Configure criteria surface', () => {
  it('keeps the essential cast controls visible before any disclosure with one Roles entry point', () => {
    const html = renderCriteria();
    const firstDisclosure = html.indexOf('<details');

    expect(firstDisclosure).toBeGreaterThan(0);
    for (const label of ['Cast size', 'Naming idiom', 'Roles', 'Cast variation', 'Configure roles']) {
      const labelIndex = html.indexOf(label);
      expect(labelIndex).toBeGreaterThan(0);
      expect(labelIndex).toBeLessThan(firstDisclosure);
    }
    expect(html).toContain('aria-label="Configure roles, Off"');
    expect(html).not.toContain('Cast role mix');
    expect(html).not.toContain('Style pack');
  });

  it('summarizes active role intent without exposing its child controls on the criteria surface', () => {
    const html = renderCriteria({
      rolePreset: 'classic-ensemble',
      roleInfluence: 'light',
      slotRoleOverrides: { 1: 'villain', 4: 'mentor' },
    });

    expect(html).toContain('Classic ensemble · Light · 2 customized');
    expect(html).toContain('aria-label="Configure roles, Classic ensemble · Light · 2 customized"');
    expect(html).not.toContain('Role influence');
    expect(html).not.toContain('Slot role overrides');
    expect(html).not.toContain('Generation influence');
  });

  it('offers Cast variation as centered spread rather than rarity-direction presets', () => {
    const html = renderCriteria();
    const variationStart = html.indexOf('Cast variation');
    const variationHtml = html.slice(variationStart, html.indexOf('</label>', variationStart));

    for (const option of ['Tight', 'Balanced', 'Wide']) {
      expect(variationHtml).toContain(`>${option}</option>`);
    }
    for (const oldOption of ['Style-pack weighted', 'Grounded cast', 'Rare-forward cast', 'Mythic arc']) {
      expect(html).not.toContain(oldOption);
    }
  });

  it('uses exactly two initially closed secondary groups', () => {
    const html = renderCriteria();

    expect((html.match(/<details/g) ?? []).length).toBe(2);
    expect(html).toContain('<summary>More</summary>');
    expect(html).toContain('<summary>Advanced</summary>');
    expect(html).not.toContain('<details class="control-section" open');
    expect(html).not.toContain('Cast setup');
    expect(html).not.toContain('Story roles');
    expect(html).not.toContain('Criteria signals');
    expect(html).not.toContain('Run options');
    expect(html).not.toContain('Advanced tuning');
  });

  it('puts common optional controls in More without separating role influence from Roles', () => {
    const html = renderCriteria();
    const moreStart = html.indexOf('<summary>More</summary>');
    const advancedStart = html.indexOf('<summary>Advanced</summary>');
    const moreHtml = html.slice(moreStart, advancedStart);

    for (const label of ['Name format', 'Familiar', 'Readable']) {
      expect(moreHtml).toContain(label);
    }
    for (const label of ['Role influence', 'Generation influence', 'Compact', 'Spelling', 'Generation seed']) {
      expect(moreHtml).not.toContain(label);
    }
  });

  it('keeps specialist semantic controls in Advanced without a separate idiom-adherence axis', () => {
    const html = renderCriteria({ rolePreset: 'classic-ensemble' });
    const advancedStart = html.indexOf('<summary>Advanced</summary>');
    const advancedHtml = html.slice(advancedStart);

    for (const label of ['Compact', 'Spelling', 'Generation seed']) {
      expect(advancedHtml).toContain(label);
    }
    expect(advancedHtml).not.toContain('<legend>Style</legend>');
    expect(advancedHtml).not.toContain('Loose');
    expect(advancedHtml).not.toContain('Faithful');
    expect(advancedHtml).not.toContain('Slot role overrides');
    expect(advancedHtml).not.toContain('Use role mix');
    expect((advancedHtml.match(/<details/g) ?? []).length).toBe(0);
    expect(advancedHtml).not.toContain('Advanced tuning');
  });

  it('uses visible semantic radio groups instead of numeric criterion tuning', () => {
    const html = renderCriteria();
    const criteriaStart = html.indexOf('<summary>More</summary>');
    const criteriaHtml = html.slice(criteriaStart);

    for (const label of ['Familiar', 'Readable', 'Compact', 'Spelling']) {
      expect(criteriaHtml).toContain(`<legend>${label}</legend>`);
    }
    for (const choice of ['Unusual', 'Familiar', 'Tricky', 'Clear', 'Extended', 'Compact', 'Conventional', 'Distinctive']) {
      expect(criteriaHtml).toContain(`<span>${choice}</span>`);
    }

    expect((criteriaHtml.match(/class="semantic-score-options"/g) ?? []).length).toBe(4);
    expect((criteriaHtml.match(/type="radio"/g) ?? []).length).toBe(12);
    expect(criteriaHtml).toContain('name="score-familiarity"');
    expect(criteriaHtml).toContain('name="score-readability"');
    expect(criteriaHtml).toContain('name="score-compactness"');
    expect(criteriaHtml).toContain('name="score-spellingDistinctiveness"');
    expect(criteriaHtml).not.toContain('name="score-styleAnchoring"');
    expect(criteriaHtml).not.toContain('<legend>Style</legend>');
    expect(criteriaHtml).not.toContain('<span>Loose</span>');
    expect(criteriaHtml).not.toContain('<span>Faithful</span>');
    expect(html).not.toContain('type="range"');
    expect(criteriaHtml).not.toContain('type="number"');
    expect(criteriaHtml).not.toContain('<datalist');
    expect(criteriaHtml).not.toContain('anchor values');
    expect(criteriaHtml).not.toContain('Shuffle Familiar');
    expect(criteriaHtml).not.toContain('Shuffle Readable');
    expect(criteriaHtml).not.toContain('Shuffle Compact');
    expect(criteriaHtml).not.toContain('Shuffle Style');
    expect(criteriaHtml).not.toContain('Shuffle Spelling');
    expect(html).toContain('>Randomize criteria</button>');
  });
});
