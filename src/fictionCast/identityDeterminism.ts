import type { FictionCastIdentityStructure } from './identityTypes';

export interface FictionCastIdentityMaterializationContext {
  readonly castSeed: string;
  readonly slotIndex: number;
}

export function componentMaterializationSeed(
  context: FictionCastIdentityMaterializationContext,
  structure: FictionCastIdentityStructure,
  componentInstanceKey: string,
): string {
  return [
    context.castSeed,
    'fiction-cast',
    'identity',
    `slot-${context.slotIndex}`,
    structure.id,
    `v${structure.version}`,
    componentInstanceKey,
  ].join(':');
}
