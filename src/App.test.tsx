import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { generateEnsemble } from './fictionCast/ensemble';
import type { FictionCastRememberedCast } from './fictionCast/rememberedCast';
import { createDefaultRegistry } from './engine/registry';
import App from './App';
import { fictionCastMode } from './ui/modes';

const registry = createDefaultRegistry();
const stylePacks = registry.listStylePacks();
const stylePackId = stylePacks[0]?.id ?? 'british-literary-fantasy';
const rememberedSettings = fictionCastMode.defaultSettings(stylePackId);
const rememberedEnsemble = generateEnsemble(rememberedSettings, registry);
const rememberedCast: FictionCastRememberedCast = {
  id: 'remembered-court',
  label: 'Court cast',
  savedAt: '2026-08-24T12:00:00.000Z',
  ensemble: rememberedEnsemble,
  lockedNameIds: rememberedEnsemble.names[0] ? [rememberedEnsemble.names[0].id] : [],
};

describe('App', () => {
  it('opens Fiction Cast as a quiet new-cast workspace with predictable Help navigation', () => {
    const html = renderToString(<App />);

    for (const expected of [
      'Name Forge',
      'Fiction Cast',
      'Recent names',
      '>Help</button>',
      '>Configure</button>',
      '>Start cast</button>',
    ]) {
      expect(html).toContain(expected);
    }

    expect(html).not.toContain('>Regenerate</button>');
    expect(html).not.toContain('>Export<');
    expect(html).not.toContain('role="tablist"');
  });

  it('offers remembered casts explicitly without auto-loading them', () => {
    const html = renderToString(<App rememberedCasts={[rememberedCast]} />);

    expect(html).toContain('aria-label="Fiction Cast workspaces"');
    expect(html).toContain('aria-label="Start a new cast"');
    expect(html).toContain('aria-label="Remembered casts"');
    expect(html).toContain('>New Cast</button>');
    expect(html).toContain('>Court cast</button>');
    expect(html).not.toContain('aria-current="page"');
    expect(html).toContain('>Start cast</button>');
    expect(html).not.toContain('role="tablist"');
  });
});
