import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { createDefaultRegistry } from '../engine/registry';
import type { GenerationSettings } from '../engine/types';
import { ConfigureTray } from './ConfigureTray';
import { fictionCastMode } from './modes';
import type { ControlKey } from './presentation';

const registry = createDefaultRegistry();
const stylePacks = registry.listStylePacks();
const stylePackId = stylePacks[0]?.id ?? 'british-literary-fantasy';
const settings = fictionCastMode.defaultSettings(stylePackId);

function renderConfigureTray(overrides: Partial<GenerationSettings> = {}): string {
  const renderedSettings = { ...settings, ...overrides };

  return renderToStaticMarkup(
    <ConfigureTray
      mode={fictionCastMode}
      stylePacks={stylePacks}
      settings={renderedSettings}
      committedSettings={renderedSettings}
      isOpen
      lockedCount={0}
      onToggleOpen={() => {}}
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
  it('keeps the existing generation controls visible', () => {
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

  it('does not require a new mode or prompt-first surface to generate names', () => {
    const html = renderConfigureTray();

    expect(html).toContain('Generate');
    expect(html).not.toMatch(/prompt/i);
    expect(html).not.toMatch(/LLM/i);
    expect(html).not.toContain('What are you naming?');
  });
});
