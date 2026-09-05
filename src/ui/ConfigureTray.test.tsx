import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { FictionCastSettings } from '../fictionCast/types';
import { createDefaultRegistry } from '../engine/registry';
import { ConfigureTray } from './ConfigureTray';
import { fictionCastMode } from './modes';

const registry = createDefaultRegistry();
const stylePacks = registry.listStylePacks();
const stylePackId = stylePacks[0]?.id ?? 'british-literary-fantasy';
const settings = fictionCastMode.defaultSettings(stylePackId);

function renderConfigureTray(
  overrides: Partial<FictionCastSettings> = {},
  isOpen = true,
  hasGeneratedCast = true,
): string {
  const renderedSettings = { ...settings, ...overrides };

  return renderToStaticMarkup(
    <ConfigureTray
      mode={fictionCastMode}
      stylePacks={stylePacks}
      settings={renderedSettings}
      committedSettings={renderedSettings}
      isOpen={isOpen}
      hasGeneratedCast={hasGeneratedCast}
      lockedCount={0}
      onOpen={() => {}}
      onClose={() => {}}
      onUpdateSetting={() => {}}
      onGenerate={() => {}}
      onCommitSettings={() => {}}
      onRandomizeCriteria={() => {}}
      onClearLockedNames={() => {}}
    />,
  );
}

describe('ConfigureTray criteria surface', () => {
  it('keeps the essential cast controls visible before any disclosure with one Roles entry point', () => {
    const html = renderConfigureTray();
    const firstDisclosure = html.indexOf('<details');

    expect(firstDisclosure).toBeGreaterThan(0);
    for (const label of ['Cast size', 'Style pack', 'Roles', 'Cast variation', 'Configure roles']) {
      const labelIndex = html.indexOf(label);
      expect(labelIndex).toBeGreaterThan(0);
      expect(labelIndex).toBeLessThan(firstDisclosure);
    }
    expect(html).toContain('aria-label="Configure roles, Off"');
    expect(html).not.toContain('Cast role mix');
  });

  it('summarizes active role intent without exposing its child controls on the criteria surface', () => {
    const html = renderConfigureTray({
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
    const html = renderConfigureTray();
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
    const html = renderConfigureTray();

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
    const html = renderConfigureTray();
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

  it('keeps specialist semantic controls in Advanced without remote role overrides', () => {
    const html = renderConfigureTray({ rolePreset: 'classic-ensemble' });
    const advancedStart = html.indexOf('<summary>Advanced</summary>');
    const advancedHtml = html.slice(advancedStart);

    for (const label of ['Compact', 'Style', 'Spelling', 'Generation seed']) {
      expect(advancedHtml).toContain(label);
    }
    expect(advancedHtml).not.toContain('Slot role overrides');
    expect(advancedHtml).not.toContain('Use role mix');
    expect((advancedHtml.match(/<details/g) ?? []).length).toBe(0);
    expect(advancedHtml).not.toContain('Advanced tuning');
  });

  it('uses visible semantic radio groups instead of numeric criterion tuning', () => {
    const html = renderConfigureTray();
    const criteriaStart = html.indexOf('<summary>More</summary>');
    const criteriaHtml = html.slice(criteriaStart);

    for (const label of ['Familiar', 'Readable', 'Compact', 'Style', 'Spelling']) {
      expect(criteriaHtml).toContain(`<legend>${label}</legend>`);
    }
    for (const choice of ['Unusual', 'Familiar', 'Tricky', 'Clear', 'Extended', 'Compact', 'Loose', 'Faithful', 'Conventional', 'Distinctive']) {
      expect(criteriaHtml).toContain(`<span>${choice}</span>`);
    }

    expect((criteriaHtml.match(/class="semantic-score-options"/g) ?? []).length).toBe(5);
    expect((criteriaHtml.match(/type="radio"/g) ?? []).length).toBe(15);
    expect(criteriaHtml).toContain('name="score-familiarity"');
    expect(criteriaHtml).toContain('name="score-readability"');
    expect(criteriaHtml).toContain('name="score-compactness"');
    expect(criteriaHtml).toContain('name="score-styleAnchoring"');
    expect(criteriaHtml).toContain('name="score-spellingDistinctiveness"');
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

  it('uses a durable Configure launcher instead of a collapsed Generation summary', () => {
    const html = renderConfigureTray({ castSize: 8, nameFormat: 'mixed' }, false);

    expect(html).toContain('aria-label="Generation controls"');
    expect(html).toContain('>Configure</button>');
    expect(html).toContain('>Regenerate</button>');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('aria-controls="fiction-cast-configure-drawer"');
    expect(html).not.toContain('>Generation<');
    expect(html).not.toContain('>Tune</button>');
    expect(html).not.toContain('role="dialog"');
    expect(html).not.toContain('Configure criteria');
  });

  it('uses Start cast before the first generated ensemble', () => {
    const closedHtml = renderConfigureTray({}, false, false);
    const openHtml = renderConfigureTray({}, true, false);

    expect(closedHtml).toContain('>Configure</button>');
    expect(closedHtml).toContain('>Start cast</button>');
    expect(closedHtml).not.toContain('>Regenerate</button>');
    expect(openHtml).toContain('<button type="submit">Start cast</button>');
  });

  it('exposes the open Configure surface as a labelled drawer with an explicit close control', () => {
    const html = renderConfigureTray();

    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).toContain('id="fiction-cast-configure-drawer"');
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-labelledby="fiction-cast-configure-title"');
    expect(html).toContain('id="fiction-cast-configure-title"');
    expect(html).toContain('aria-label="Close configure"');
  });

  it('does not require a new mode or free-form text surface to generate names', () => {
    const html = renderConfigureTray();

    expect(html).toContain('Generate');
    expect(html).toContain('Randomize criteria');
    expect(html).not.toContain('<textarea');
    expect(html).not.toContain('What are you naming?');
  });
});
