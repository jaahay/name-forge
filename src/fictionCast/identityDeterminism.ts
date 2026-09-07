import type { FictionCastIdentityStructure } from './identityTypes';

export interface FictionCastIdentityMaterializationContext {
  readonly castSeed: string;
  readonly slotIndex: number;
  readonly candidateAttempt: number;
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
    `candidate-${context.candidateAttempt}`,
    structure.id,
    `v${structure.version}`,
    componentInstanceKey,
  ].join(':');
}
