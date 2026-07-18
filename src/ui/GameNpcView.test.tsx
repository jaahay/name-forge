import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { createDefaultRegistry } from '../engine/registry';
import { GameNpcView, generateGameNpcResponse } from './GameNpcView';
import { gameNpcMode } from './modes';

describe('GameNpcView', () => {
  it('renders a minimal singular workflow through the shared artifact inspector', () => {
    const registry = createDefaultRegistry();
    const html = renderToString(<GameNpcView mode={gameNpcMode} stylePacks={registry.listStylePacks()} />);

    for (const expected of [
      'Game NPC',
      'Generate NPC name',
      'One generated name, fully inspectable and reproducible',
      'Style source',
      'Deterministic by seed',
      'Current NPC name',
      'Reroll NPC name',
      'Copy name',
      'Copy details',
      'Play voice draft',
      'Sound',
      'Selected spelling',
      'Top same-sound spellings',
      'Spelling display cap',
      'Readability',
    ]) {
      expect(html).toContain(expected);
    }

    for (const unsupported of ['Spelling style', 'Sound texture', 'Pronounceability', 'Familiarity', 'Cast health', 'Cast context']) {
      expect(html).not.toContain(unsupported);
    }
  });

  it('produces the same singular artifact for the same style source and seed', () => {
    const registry = createDefaultRegistry();
    const stylePackId = registry.listStylePacks()[0]?.id ?? 'british-literary-fantasy';
    const first = generateGameNpcResponse(stylePackId, 'game-npc-deterministic');
    const second = generateGameNpcResponse(stylePackId, 'game-npc-deterministic');

    expect(first.request.mode).toBe('game-npc');
    expect(first.random.seed).toBe('game-npc-deterministic');
    expect(first.names).toHaveLength(1);
    expect(first.names).toEqual(second.names);
  });
});
