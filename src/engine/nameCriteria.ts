export type NameCriteriaFamily =
  | 'sound'
  | 'shape'
  | 'register'
  | 'spelling'
  | 'semantic'
  | 'avoid'
  | 'practical';

export type NameCriteriaPolarity = 'prefer' | 'avoid' | 'require';

export interface NameCriteria {
  readonly clauses: readonly NameCriteriaClause[];
}

export interface NameCriteriaClause {
  readonly id: string;
  readonly family: NameCriteriaFamily;
  readonly polarity: NameCriteriaPolarity;
  readonly target: string;
  readonly strength: number;
}
