import { generateEnsemble, type LockedNameSlot } from './engine/ensemble';
import { toNameArtifact, type NameArtifact } from './engine/nameArtifact';
import type { SourceRegistry } from './engine/registry';
import type { GeneratedEnsemble, GenerationSettings } from './engine/types';

export interface FictionCastRerollResult {
  readonly ensemble: GeneratedEnsemble;
  readonly committedSettings: GenerationSettings;
  readonly replacementId: string;
  readonly lockedNameIds: Set<string>;
  readonly historyArtifacts: readonly NameArtifact[];
}

function lockedSlotsExcept(ensemble: GeneratedEnsemble, targetIndex: number): LockedNameSlot[] {
  return ensemble.names.flatMap((name, index) => (index === targetIndex ? [] : [{ index, name }]));
}

function retainedLockIds(ensemble: GeneratedEnsemble, lockedNameIds: ReadonlySet<string>): Set<string> {
  const visibleIds = new Set(ensemble.names.map((name) => name.id));
  return new Set([...lockedNameIds].filter((id) => visibleIds.has(id)));
}

export function rerollSelectedCastName(
  ensemble: GeneratedEnsemble,
  selectedNameId: string,
  lockedNameIds: ReadonlySet<string>,
  seed: string,
  registry: SourceRegistry,
): FictionCastRerollResult | undefined {
  const targetIndex = ensemble.names.findIndex((name) => name.id === selectedNameId);
  if (targetIndex < 0 || lockedNameIds.has(selectedNameId)) return undefined;

  const committedSettings = { ...ensemble.settings, seed };
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
