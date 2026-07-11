import type { NameCriteria, NameCriteriaClause } from '../engine/nameCriteria';

export type GameNpcFamiliarity = 'familiar' | 'balanced' | 'strange';
export type GameNpcTexture = 'soft' | 'balanced' | 'hard' | 'liquid';

export interface GameNpcStyleInput {
  readonly familiarity: GameNpcFamiliarity;
  readonly pronounceability: number;
  readonly texture: GameNpcTexture;
}

export const defaultGameNpcStyleInput: GameNpcStyleInput = {
  familiarity: 'balanced',
  pronounceability: 0.78,
  texture: 'balanced',
};

function clampStrength(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(1, Math.max(0, value));
}

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

function familiarityCriterion(familiarity: GameNpcFamiliarity): NameCriteriaClause | undefined {
  if (familiarity === 'balanced') return undefined;

  return {
    id: 'game-npc-familiarity',
    family: 'spelling',
    polarity: 'prefer',
    target: familiarity === 'familiar' ? 'plain' : 'distinctive',
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
    {
      id: 'game-npc-pronounceability',
      family: 'practical',
      polarity: 'prefer',
      target: 'easy-to-spell',
      strength: clampStrength(input.pronounceability),
    },
  ];

  const sound = soundCriterion(input.texture);
  if (sound) clauses.push(sound);

  const familiarity = familiarityCriterion(input.familiarity);
  if (familiarity) clauses.push(familiarity);

  return { clauses };
}
