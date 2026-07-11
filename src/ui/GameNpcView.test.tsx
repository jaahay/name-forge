import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { createDefaultRegistry } from '../engine/registry';
import { GameNpcView } from './GameNpcView';
import { gameNpcMode } from './modes';

describe('GameNpcView', () => {
  it('renders a singular criteria-driven NPC workflow without cast surfaces', () => {
    const registry = createDefaultRegistry();
    const html = renderToString(<GameNpcView mode={gameNpcMode} stylePacks={registry.listStylePacks()} />);

    for (const expected of [
      'Game NPC',
      'Configure NPC name',
      'Fast, singular, criteria-driven generation',
      'Familiarity',
      'Sound texture',
      'Pronounceability',
      'Current NPC name',
      'Reroll NPC name',
      'Copy name',
      'Copy details',
      'Spelling candidates',
      'Readability',
      'Variants',
    ]) {
      expect(html).toContain(expected);
    }

    for (const castOnly of ['Cast health', 'Ensemble balance', 'Story roles', 'Slot overrides', 'Export cast']) {
      expect(html).not.toContain(castOnly);
    }
  });
});
