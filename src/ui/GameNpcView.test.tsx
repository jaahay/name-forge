import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { createDefaultRegistry } from '../engine/registry';
import { defaultGameNpcStyleInput } from './gameNpc';
import { GameNpcView, generateGameNpcResponse } from './GameNpcView';
import { gameNpcMode } from './modes';

describe('GameNpcView', () => {
  it('renders a singular criteria-driven NPC workflow through the shared artifact inspector', () => {
    const registry = createDefaultRegistry();
    const html = renderToString(<GameNpcView mode={gameNpcMode} stylePacks={registry.listStylePacks()} />);

    for (const expected of [
      'Game NPC',
      'Configure NPC name',
      'Fast, singular, criteria-driven generation',
      'Spelling style',
      'Sound texture',
      'Current NPC name',
      'Reroll NPC name',
      'Copy name',
      'Copy details',
      'Play voice draft',
      'Sound',
      'Spelling',
      'Spelling candidates',
      'Readability',
    ]) {
      expect(html).toContain(expected);
    }

    for (const castOnly of ['Cast health', 'Ensemble balance', 'Story roles', 'Slot overrides', 'Export cast', 'Cast context']) {
      expect(html).not.toContain(castOnly);
    }
  });

  it('produces the same singular artifact for the same input and seed', () => {
    const registry = createDefaultRegistry();
    const stylePackId = registry.listStylePacks()[0]?.id ?? 'british-literary-fantasy';
    const first = generateGameNpcResponse(defaultGameNpcStyleInput, stylePackId, 'game-npc-deterministic');
    const second = generateGameNpcResponse(defaultGameNpcStyleInput, stylePackId, 'game-npc-deterministic');

    expect(first.request.mode).toBe('game-npc');
    expect(first.random.seed).toBe('game-npc-deterministic');
    expect(first.names).toHaveLength(1);
    expect(first.names).toEqual(second.names);
  });
});
