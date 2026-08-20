import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { FictionCastSettings } from '../fictionCast/types';
import { createDefaultRegistry } from '../engine/registry';
import { ConfigureTray } from './ConfigureTray';
import { fictionCastMode } from './modes';
import type { ControlKey } from './presentation';

const registry = createDefaultRegistry();
const stylePacks = registry.listStylePacks();
const stylePackId = stylePacks[0]?.id ?? 'british-literary-fantasy';
const settings = fictionCastMode.defaultSettings(stylePackId);

function renderConfigureTray(overrides: Partial<FictionCastSettings> = {}, isOpen = true): string {
  const renderedSettings = { ...settings, ...overrides };

  return renderToStaticMarkup(
    <ConfigureTray
      mode={fictionCastMode}
      stylePacks={stylePacks}
      settings={renderedSettings}
      committedSettings={renderedSettings}
      isOpen={isOpen}
      lockedCount={0}
      onOpen={() => {}}
      onClose={() => {}}
      onUpdateSetting={() => {}}
      onGenerate={() => {}}
      onCommitSettings={() => {}}
      onRandomizeSliders={() => {}}
      onRandomizeSlider={(_: ControlKey) => {}}
      onClearLockedNames={() => {}}
    />,
  );
}

describe('ConfigureTray criteria surface', () => {
  it('keeps the existing generation controls visible when tuning', () => {
    const html = renderConfigureTray();

    expect(html).toContain('Cast size');
    expect(html).toContain('Style pack');
    expect(html).toContain('Name format');
    expect(html).toContain('Generation seed');
    expect(html).toContain('Generate');
    expect(html).toContain('Shuffle feel');
  });

  it('renders bounded criteria wording without adding a large taxonomy surface', () => {
    const html = renderConfigureTray({
      novelty: 0.72,
      pronounceability: 0.74,
      orthographicWeirdness: 0.24,
    });

    expect(html).toContain('Configure criteria');
    expect(html).toContain('Criteria summary');
    expect(html).toContain('Criteria signals');
    expect(html).toContain('Rarity target: rarer');
    expect(html).toContain('Readability target: easy to read');
    expect(html).toContain('Spelling target: plain');
    expect(html).toContain('Rarity target');
    expect(html).toContain('Readability target');
    expect(html).toContain('Spelling criterion');
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
    expect(html).not.toContain('Criteria summary');
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
    expect(html).not.toContain('<textarea');
    expect(html).not.toContain('What are you naming?');
  });
});
