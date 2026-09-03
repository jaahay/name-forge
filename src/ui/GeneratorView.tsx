import { useEffect, useReducer, useRef, useState, type FormEvent } from 'react';
import { serializeCastAsJson, serializeCastAsMarkdown } from '../fictionCast/export';
import type { FictionCastRememberedCast } from '../fictionCast/rememberedCast';
import type { FictionCastGeneratedEnsemble, FictionCastSettings } from '../fictionCast/types';
import type { StylePackSummary } from '../engine/types';
import { CastNotes } from './CastNotes';
import { reduceConfigureDrawerOpen } from './configureBehavior';
import { ConfigureTray } from './ConfigureTray';
import { ExportMenu } from './ExportMenu';
import type { FictionCastModeConfig } from './modes';
import { NameInspector } from './NameInspector';
import { NameSelectionSurface } from './NameSelectionSurface';
import { resolveSelectedNameId } from './workbenchSelection';

interface GeneratorViewProps {
  mode: FictionCastModeConfig;
  stylePacks: StylePackSummary[];
  settings: FictionCastSettings;
  committedSettings?: FictionCastSettings;
  ensemble: FictionCastGeneratedEnsemble | null;
  rememberedCasts: readonly FictionCastRememberedCast[];
  activeRememberedCastId?: string;
  lockedNameIds: Set<string>;
  onStartNewCast: () => void;
  onLoadRememberedCast: (rememberedCast: FictionCastRememberedCast) => void;
  onUpdateSetting: <K extends keyof FictionCastSettings>(key: K, value: FictionCastSettings[K]) => void;
  onGenerate: (event?: FormEvent<HTMLFormElement>) => void;
  onCommitSettings: () => void;
  onRandomizeCriteria: () => void;
  onRerollName: (id: string) => string | undefined;
  onToggleLockedName: (id: string) => void;
  onClearLockedNames: () => void;
}

function titleCaseLabel(value: string): string {
  return value
    .split(' ')
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

export function GeneratorView({
  mode,
  stylePacks,
  settings,
  committedSettings,
  ensemble,
  rememberedCasts,
  activeRememberedCastId,
  lockedNameIds,
  onStartNewCast,
  onLoadRememberedCast,
  onUpdateSetting,
  onGenerate,
  onCommitSettings,
  onRandomizeCriteria,
  onRerollName,
  onToggleLockedName,
  onClearLockedNames,
}: GeneratorViewProps) {
  const [selectedNameId, setSelectedNameId] = useState('');
  const [isConfigureOpen, dispatchConfigure] = useReducer(reduceConfigureDrawerOpen, false);
  const inspectorRegionRef = useRef<HTMLDivElement>(null);
  const modeTitle = titleCaseLabel(mode.label);
  const lockedCount = lockedNameIds.size;
  const hasGeneratedCast = ensemble !== null;
  const resolvedSelectedNameId = ensemble ? resolveSelectedNameId(selectedNameId, ensemble, lockedNameIds) : '';
  const selectedName = ensemble?.names.find((name) => name.id === resolvedSelectedNameId);
  const selectedNameIndex = ensemble?.names.findIndex((name) => name.id === resolvedSelectedNameId) ?? -1;

  useEffect(() => {
    if (selectedNameId !== resolvedSelectedNameId) {
      setSelectedNameId(resolvedSelectedNameId);
    }
  }, [resolvedSelectedNameId, selectedNameId]);

  function selectName(id: string) {
    setSelectedNameId(id);
  }

  function selectCastNoteName(id: string) {
    selectName(id);
    inspectorRegionRef.current?.scrollIntoView({ block: 'start' });
  }

  function generateFromConfigure(event?: FormEvent<HTMLFormElement>) {
    dispatchConfigure('generate');
    onGenerate(event);
  }

  function randomizeFromConfigure() {
    dispatchConfigure('shuffle');
    onRandomizeCriteria();
  }

  function rerollSelectedName() {
    if (!selectedName) return;
    const replacementId = onRerollName(selectedName.id);
    if (replacementId) selectName(replacementId);
  }

  const inspector = selectedName && ensemble && selectedNameIndex >= 0 ? (
    <NameInspector
      name={selectedName}
      settings={ensemble.settings}
      stylePackLabel={ensemble.sourcePack.label}
      slotIndex={selectedNameIndex}
      isLocked={lockedNameIds.has(selectedName.id)}
      onRerollName={rerollSelectedName}
      onToggleLockedName={onToggleLockedName}
    />
  ) : null;

  return (
    <>
      <section className="hero panel app-header">
        <h1>{modeTitle}</h1>
        {rememberedCasts.length > 0 ? (
          <nav className="cast-workspace-nav" aria-label="Fiction Cast workspaces">
            <button
              type="button"
              className="secondary"
              aria-label="Start a new cast"
              onClick={onStartNewCast}
            >
              New Cast
            </button>
            <div className="remembered-cast-nav" role="group" aria-label="Remembered casts">
              {rememberedCasts.map((rememberedCast) => (
                <button
                  type="button"
                  className="secondary"
                  aria-current={activeRememberedCastId === rememberedCast.id ? 'page' : undefined}
                  onClick={() => onLoadRememberedCast(rememberedCast)}
                  key={rememberedCast.id}
                >
                  {rememberedCast.label}
                </button>
              ))}
            </div>
          </nav>
        ) : null}
      </section>

      <section className={hasGeneratedCast ? 'workspace workbench' : 'workspace workbench new-cast-workbench'}>
        <ConfigureTray
          mode={mode}
          stylePacks={stylePacks}
          settings={settings}
          committedSettings={committedSettings}
          isOpen={isConfigureOpen}
          hasGeneratedCast={hasGeneratedCast}
          lockedCount={lockedCount}
          onOpen={() => dispatchConfigure('open')}
          onClose={() => dispatchConfigure('close')}
          onUpdateSetting={onUpdateSetting}
          onGenerate={generateFromConfigure}
          onCommitSettings={onCommitSettings}
          onRandomizeCriteria={randomizeFromConfigure}
          onClearLockedNames={onClearLockedNames}
        />

        {ensemble ? (
          <section className="output" aria-live="polite">
            <NameSelectionSurface
              ensemble={ensemble}
              lockedNameIds={lockedNameIds}
              selectedNameId={resolvedSelectedNameId}
              onSelectName={selectName}
            >
              <div ref={inspectorRegionRef}>
                {inspector}
              </div>
            </NameSelectionSurface>
            <CastNotes names={ensemble.names} onSelectName={selectCastNoteName} />
            <ExportMenu jsonExport={serializeCastAsJson(ensemble)} markdownExport={serializeCastAsMarkdown(ensemble)} />
          </section>
        ) : null}
      </section>
    </>
  );
}
