import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { generateEnsemble } from '../fictionCast/ensemble';
import type { FictionCastRememberedCast } from '../fictionCast/rememberedCast';
import { createDefaultRegistry } from '../engine/registry';
import { GeneratorView } from './GeneratorView';
import { fictionCastMode } from './modes';

const registry = createDefaultRegistry();
const stylePacks = registry.listStylePacks();
const stylePackId = stylePacks[0]?.id ?? 'british-literary-fantasy';
const settings = fictionCastMode.defaultSettings(stylePackId);
const ensemble = generateEnsemble(settings, registry);
const rememberedCast: FictionCastRememberedCast = {
  id: 'remembered-court',
  label: 'Court cast',
  savedAt: '2026-08-24T12:00:00.000Z',
  ensemble,
  lockedNameIds: ensemble.names[0] ? [ensemble.names[0].id] : [],
};

function renderGenerator(
  currentEnsemble: typeof ensemble | null,
  activeRememberedCastId?: string,
): string {
  return renderToStaticMarkup(
    <GeneratorView
      mode={fictionCastMode}
      stylePacks={stylePacks}
      settings={settings}
      committedSettings={settings}
      ensemble={currentEnsemble}
      rememberedCasts={[rememberedCast]}
      activeRememberedCastId={activeRememberedCastId}
      lockedNameIds={new Set(rememberedCast.lockedNameIds)}
      onStartNewCast={() => {}}
      onLoadRememberedCast={() => {}}
      onUpdateSetting={() => {}}
      onGenerate={() => {}}
      onCommitSettings={() => {}}
      onRandomizeSliders={() => {}}
      onRerollName={() => undefined}
      onToggleLockedName={() => {}}
      onClearLockedNames={() => {}}
    />,
  );
}

describe('GeneratorView cast lifecycle', () => {
  it('keeps the new-cast state skeletal while exposing remembered-cast navigation', () => {
    const html = renderGenerator(null);

    expect(html).toContain('aria-label="Fiction Cast workspaces"');
    expect(html).toContain('aria-label="Open a new cast workspace"');
    expect(html).toContain('aria-label="Remembered casts"');
    expect(html).toContain('>New Cast</button>');
    expect(html).toContain('>Court cast</button>');
    expect(html).toContain('>Start cast</button>');
    expect(html).not.toContain('>Regenerate</button>');
    expect(html).not.toContain('aria-label="Generation summary"');
    expect(html).not.toContain('repeated endings');
    expect(html).not.toContain('read notes');
    expect(html).not.toContain('Generated cast');
    expect(html).not.toContain('<summary>Export</summary>');
  });

  it('restores the composed cast workspace for an explicitly selected remembered cast', () => {
    const html = renderGenerator(ensemble, rememberedCast.id);

    for (const expected of [
      '>Court cast</button>',
      '>Regenerate</button>',
      '>Names</h2>',
      'aria-label="Generated cast"',
      'role="tablist"',
      'role="tabpanel"',
      'Inspect',
      'Cast review',
      '<summary>Export</summary>',
    ]) {
      expect(html).toContain(expected);
    }

    expect(html).toContain('aria-current="page"');
    expect(html).not.toContain('aria-label="Generation summary"');
    expect(html).not.toContain('repeated endings');
  });
});
