import type { GeneratedEnsemble } from '../engine/types';

export type NameSelectionView =
  | { kind: 'all-names' }
  | { kind: 'name'; nameId: string };

export const allNamesSelectorValue = '__all-names__';

export function selectedNameIdFromView(selection: NameSelectionView): string {
  return selection.kind === 'name' ? selection.nameId : '';
}

export function sameNameSelection(left: NameSelectionView, right: NameSelectionView): boolean {
  if (left.kind === 'all-names' || right.kind === 'all-names') {
    return left.kind === right.kind;
  }

  return left.nameId === right.nameId;
}

export function resolveNameSelection(selection: NameSelectionView, ensemble: GeneratedEnsemble, lockedNameIds: Set<string>): NameSelectionView {
  if (selection.kind === 'all-names') return selection;
  if (selection.nameId && ensemble.names.some((name) => name.id === selection.nameId)) return selection;

  const firstLocked = ensemble.names.find((name) => lockedNameIds.has(name.id));
  const fallbackNameId = firstLocked?.id ?? ensemble.names[0]?.id ?? '';
  return fallbackNameId ? { kind: 'name', nameId: fallbackNameId } : { kind: 'all-names' };
}
