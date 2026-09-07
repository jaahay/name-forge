import type { GeneratedName } from '../engine/types';
import type { MaterializedNameFormatKind } from './identityFormat';

export type FictionCastIdentityRole = 'given' | 'family' | 'title' | 'epithet' | 'place';
export type FictionCastGeneratedIdentityRole = 'given' | 'family' | 'place';
export type FictionCastLexicalIdentityRole = 'title' | 'epithet';
export type FictionCastDerivedIdentityRole = 'given';

interface FictionCastIdentityComponentBase<
  Kind extends 'generated' | 'lexical' | 'derived',
  Role extends FictionCastIdentityRole,
> {
  readonly id: string;
  readonly kind: Kind;
  readonly role: Role;
  readonly value: string;
}

export interface FictionCastGeneratedIdentityComponent
  extends FictionCastIdentityComponentBase<'generated', FictionCastGeneratedIdentityRole> {
  readonly generatedName: GeneratedName;
}

export interface FictionCastLexicalIdentityComponent
  extends FictionCastIdentityComponentBase<'lexical', FictionCastLexicalIdentityRole> {
  readonly lexemeId: string;
  readonly inventoryId: string;
}

export interface FictionCastDerivedIdentityComponent
  extends FictionCastIdentityComponentBase<'derived', FictionCastDerivedIdentityRole> {
  readonly derivation: {
    readonly ruleId: 'initials';
    readonly sourceComponentIds: readonly string[];
  };
}

export type FictionCastIdentityComponent =
  | FictionCastGeneratedIdentityComponent
  | FictionCastLexicalIdentityComponent
  | FictionCastDerivedIdentityComponent;

export interface FictionCastIdentityComponentReference {
  readonly kind: 'component';
  readonly componentId: string;
}

export interface FictionCastIdentityLiteralPart {
  readonly kind: 'literal';
  readonly value: string;
}

export type FictionCastIdentityPhrasePart = FictionCastIdentityComponentReference | FictionCastIdentityLiteralPart;

export interface FictionCastIdentityStructure {
  readonly id: string;
  readonly version: number;
  readonly kind: MaterializedNameFormatKind;
  readonly label: string;
}

export interface FictionCastMaterializedIdentity {
  readonly displayName: string;
  readonly format: FictionCastIdentityStructure;
  readonly components: readonly FictionCastIdentityComponent[];
  readonly phraseParts: readonly FictionCastIdentityPhrasePart[];
}
