import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { createDefaultRegistry } from '../engine/registry';
import type { FictionCastSettings } from '../fictionCast/types';
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

describe('ConfigureTray shell', () => {
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
