import { generateEnsemble, type LockedNameSlot } from './fictionCast/ensemble';
import type { FictionCastGeneratedEnsemble, FictionCastSettings } from './fictionCast/types';
import { toNameArtifact, type NameArtifact } from './engine/nameArtifact';
import type { SourceRegistry } from './engine/registry';

export interface FictionCastRerollResult {
  readonly ensemble: FictionCastGeneratedEnsemble;
  readonly committedSettings: FictionCastSettings;
  readonly replacementId: string;
  readonly lockedNameIds: Set<string>;
  readonly historyArtifacts: readonly NameArtifact[];
}

function lockedSlotsExcept(ensemble: FictionCastGeneratedEnsemble, targetIndex: number): LockedNameSlot[] {
  return ensemble.names.flatMap((name, index) => (index === targetIndex ? [] : [{ index, name }]));
}

function retainedLockIds(ensemble: FictionCastGeneratedEnsemble, lockedNameIds: ReadonlySet<string>): Set<string> {
  const visibleIds = new Set(ensemble.names.map((name) => name.id));
  return new Set([...lockedNameIds].filter((id) => visibleIds.has(id)));
}

export function rerollSelectedCastName(
  ensemble: FictionCastGeneratedEnsemble,
  selectedNameId: string,
  lockedNameIds: ReadonlySet<string>,
  seed: string,
  registry: SourceRegistry,
): FictionCastRerollResult | undefined {
  const targetIndex = ensemble.names.findIndex((name) => name.id === selectedNameId);
  if (targetIndex < 0 || lockedNameIds.has(selectedNameId)) return undefined;

  const committedSettings: FictionCastSettings = { ...ensemble.settings, seed };
  const nextEnsemble = generateEnsemble(
    committedSettings,
    registry,
    lockedSlotsExcept(ensemble, targetIndex),
  );
  const replacement = nextEnsemble.names[targetIndex];
  if (!replacement) return undefined;

  return {
    ensemble: nextEnsemble,
    committedSettings,
    replacementId: replacement.id,
    lockedNameIds: retainedLockIds(nextEnsemble, lockedNameIds),
    historyArtifacts: [toNameArtifact(replacement)],
  };
}
