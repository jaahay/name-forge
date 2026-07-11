import { describe, expect, it } from 'vitest';
import { compileGameNpcStyleInput, defaultGameNpcStyleInput } from './gameNpc';

describe('compileGameNpcStyleInput', () => {
  it('emits deterministic singular criteria for the default Game NPC input', () => {
    expect(compileGameNpcStyleInput(defaultGameNpcStyleInput)).toEqual({
      clauses: [
        {
          id: 'game-npc-single-name',
          family: 'practical',
          polarity: 'require',
          target: 'single-name',
          strength: 1,
        },
        {
          id: 'game-npc-pronounceability',
          family: 'practical',
          polarity: 'prefer',
          target: 'easy-to-spell',
          strength: 0.78,
        },
      ],
    });
  });

  it('maps hard and strange intent into supported sound and spelling criteria', () => {
    expect(compileGameNpcStyleInput({
      familiarity: 'strange',
      pronounceability: 0.55,
      texture: 'hard',
    })).toEqual({
      clauses: [
        {
          id: 'game-npc-single-name',
          family: 'practical',
          polarity: 'require',
          target: 'single-name',
          strength: 1,
        },
        {
          id: 'game-npc-pronounceability',
          family: 'practical',
          polarity: 'prefer',
          target: 'easy-to-spell',
          strength: 0.55,
        },
        {
          id: 'game-npc-texture',
          family: 'sound',
          polarity: 'prefer',
          target: 'crisp',
          strength: 1,
        },
        {
          id: 'game-npc-familiarity',
          family: 'spelling',
          polarity: 'prefer',
          target: 'distinctive',
          strength: 1,
        },
      ],
    });
  });
});
