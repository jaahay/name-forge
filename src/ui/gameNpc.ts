import type { NameCriteria, NameCriteriaClause } from '../engine/nameCriteria';

export type GameNpcSpellingStyle = 'plain' | 'balanced' | 'distinctive';
export type GameNpcTexture = 'soft' | 'balanced' | 'hard' | 'liquid';

export interface GameNpcStyleInput {
  readonly spellingStyle: GameNpcSpellingStyle;
  readonly texture: GameNpcTexture;
}

export const defaultGameNpcStyleInput: GameNpcStyleInput = {
  spellingStyle: 'balanced',
  texture: 'balanced',
};

function soundCriterion(texture: GameNpcTexture): NameCriteriaClause | undefined {
  if (texture === 'balanced') return undefined;

  return {
    id: 'game-npc-texture',
    family: 'sound',
    polarity: 'prefer',
    target: texture === 'hard' ? 'crisp' : texture === 'liquid' ? 'flowing' : 'soft',
    strength: 1,
  };
}

function spellingCriterion(spellingStyle: GameNpcSpellingStyle): NameCriteriaClause | undefined {
  if (spellingStyle === 'balanced') return undefined;

  return {
    id: 'game-npc-spelling-style',
    family: 'spelling',
    polarity: 'prefer',
    target: spellingStyle,
    strength: 1,
  };
}

export function compileGameNpcStyleInput(input: GameNpcStyleInput): NameCriteria {
  const clauses: NameCriteriaClause[] = [
    {
      id: 'game-npc-single-name',
      family: 'practical',
      polarity: 'require',
      target: 'single-name',
      strength: 1,
    },
  ];

  const sound = soundCriterion(input.texture);
  if (sound) clauses.push(sound);

  const spelling = spellingCriterion(input.spellingStyle);
  if (spelling) clauses.push(spelling);

  return { clauses };
}
