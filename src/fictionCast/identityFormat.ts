export type FictionCastNameFormatKind =
  | 'given-only'
  | 'given-family'
  | 'initials-family'
  | 'title-name'
  | 'epithet-place'
  | 'mixed';

export type MaterializedNameFormatKind = Exclude<FictionCastNameFormatKind, 'mixed'>;
