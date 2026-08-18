import type { FictionCastGeneratedEnsemble } from '../fictionCast/types';

export function resolveSelectedNameId(
  selectedNameId: string,
  ensemble: FictionCastGeneratedEnsemble,
  lockedNameIds: Set<string>,
): string {
  if (selectedNameId && ensemble.names.some((name) => name.id === selectedNameId)) return selectedNameId;

  const firstLocked = ensemble.names.find((name) => lockedNameIds.has(name.id));
  return firstLocked?.id ?? ensemble.names[0]?.id ?? '';
}
