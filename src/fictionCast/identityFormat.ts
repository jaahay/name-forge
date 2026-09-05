import type { NameFormatKind } from '../engine/types';

export type MaterializedNameFormatKind = Exclude<NameFormatKind, 'mixed'>;
