import { describe, expect, it } from 'vitest';
import { compileGameNpcStyleInput, defaultGameNpcStyleInput } from './gameNpc';

describe('compileGameNpcStyleInput', () => {
  it('emits only the singular requirement for the balanced default input', () => {
    expect(compileGameNpcStyleInput(defaultGameNpcStyleInput)).toEqual({
      clauses: [
        {
          id: 'game-npc-single-name',
          family: 'practical',
          polarity: 'require',
          target: 'single-name',
          strength: 1,
        },
      ],
    });
  });

  it('maps hard sound and distinctive spelling into supported criteria', () => {
    expect(compileGameNpcStyleInput({
      spellingStyle: 'distinctive',
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
          id: 'game-npc-texture',
          family: 'sound',
          polarity: 'prefer',
          target: 'crisp',
          strength: 1,
        },
        {
          id: 'game-npc-spelling-style',
          family: 'spelling',
          polarity: 'prefer',
          target: 'distinctive',
          strength: 1,
        },
      ],
    });
  });
});
