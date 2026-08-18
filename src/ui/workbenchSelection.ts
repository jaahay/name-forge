import type { FictionCastGeneratedEnsemble } from '../fictionCast/types';

export type NameSelectionView = { kind: 'name'; nameId: string };

export function selectedNameIdFromView(selection: NameSelectionView): string {
  return selection.nameId;
}

export function sameNameSelection(left: NameSelectionView, right: NameSelectionView): boolean {
  return left.nameId === right.nameId;
}

export function resolveNameSelection(selection: NameSelectionView, ensemble: FictionCastGeneratedEnsemble, lockedNameIds: Set<string>): NameSelectionView {
  if (selection.nameId && ensemble.names.some((name) => name.id === selection.nameId)) return selection;

  const firstLocked = ensemble.names.find((name) => lockedNameIds.has(name.id));
  const fallbackNameId = firstLocked?.id ?? ensemble.names[0]?.id ?? '';
  return { kind: 'name', nameId: fallbackNameId };
}
