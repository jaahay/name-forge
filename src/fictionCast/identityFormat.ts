export type FictionCastNameFormatKind =
  | 'given-only'
  | 'given-family'
  | 'given-additional-family'
  | 'initials-family'
  | 'title-name'
  | 'epithet-place'
  | 'mixed';

export type MaterializedNameFormatKind = Exclude<FictionCastNameFormatKind, 'mixed'>;
