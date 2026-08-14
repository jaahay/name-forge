import { useEffect, useRef, useState, type FormEvent } from 'react';
import { serializeCastAsJson, serializeCastAsMarkdown } from '../fictionCast/export';
import type { FictionCastGeneratedEnsemble, FictionCastSettings } from '../fictionCast/types';
import type { StylePackSummary } from '../engine/types';
import { CastHealthPanel } from './CastHealth';
import { ConfigureTray } from './ConfigureTray';
import { ExportMenu } from './ExportMenu';
import type { FictionCastModeConfig } from './modes';
import { NameInspector } from './NameInspector';
import { NameSelectionSurface } from './NameSelectionSurface';
import type { ControlKey } from './presentation';
import { resolveNameSelection, sameNameSelection, selectedNameIdFromView, type NameSelectionView } from './workbenchSelection';

interface GeneratorViewProps {
  mode: FictionCastModeConfig;
  stylePacks: StylePackSummary[];
  settings: FictionCastSettings;
  committedSettings?: FictionCastSettings;
  ensemble: FictionCastGeneratedEnsemble;
  lockedNameIds: Set<string>;
  onUpdateSetting: <K extends keyof FictionCastSettings>(key: K, value: FictionCastSettings[K]) => void;
  onGenerate: (event?: FormEvent<HTMLFormElement>) => void;
  onCommitSettings: () => void;
  onRandomizeSliders: () => void;
  onRandomizeSlider: (key: ControlKey) => void;
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

function EmptyInspector() {
  return (
    <aside className="inspector-empty-panel panel" aria-label="Name inspector">
      <h2>Inspect</h2>
      <p>Select a name to view its sound, spelling, cast context, usability, and export-ready details.</p>
    </aside>
  );
}

export function GeneratorView({
  mode,
  stylePacks,
  settings,
  committedSettings,
  ensemble,
  lockedNameIds,
  onUpdateSetting,
  onGenerate,
  onCommitSettings,
  onRandomizeSliders,
  onRandomizeSlider,
  onRerollName,
  onToggleLockedName,
  onClearLockedNames,
}: GeneratorViewProps) {
  const [selection, setSelection] = useState<NameSelectionView>(() => ({ kind: 'name', nameId: '' }));
  const [isConfigureOpen, setIsConfigureOpen] = useState(() => ensemble.names.length === 0);
  const inspectorRegionRef = useRef<HTMLDivElement>(null);
  const jsonExport = serializeCastAsJson(ensemble);
  const markdownExport = serializeCastAsMarkdown(ensemble);
  const modeTitle = titleCaseLabel(mode.label);
  const lockedCount = lockedNameIds.size;
  const hasLockedNames = lockedCount > 0;
  const resolvedSelection = resolveNameSelection(selection, ensemble, lockedNameIds);
  const selectedNameId = selectedNameIdFromView(resolvedSelection);
  const selectedName = ensemble.names.find((name) => name.id === selectedNameId);
  const selectedNameIndex = selectedName ? ensemble.names.findIndex((name) => name.id === selectedName.id) : -1;
  const hasPreviousName = selectedNameIndex > 0;
  const hasNextName = selectedNameIndex >= 0 && selectedNameIndex < ensemble.names.length - 1;

  useEffect(() => {
    if (!sameNameSelection(selection, resolvedSelection)) {
      setSelection(resolvedSelection);
    }
  }, [resolvedSelection, selection]);

  function selectName(id: string) {
    setSelection({ kind: 'name', nameId: id });
  }

  function selectRelationshipName(id: string) {
    selectName(id);
    inspectorRegionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function selectAllNames() {
    setSelection({ kind: 'all-names' });
  }

  function selectPreviousName() {
    const previousName = ensemble.names[selectedNameIndex - 1];
    if (!previousName) return;
    selectName(previousName.id);
  }

  function selectNextName() {
    const nextName = ensemble.names[selectedNameIndex + 1];
    if (!nextName) return;
    selectName(nextName.id);
  }

  function submitGeneration(event?: FormEvent<HTMLFormElement>) {
    setIsConfigureOpen(false);
    onGenerate(event);
  }

  function randomizeSliders() {
    setIsConfigureOpen(false);
    onRandomizeSliders();
  }

  function rerollSelectedName() {
    if (!selectedName) return;
    const replacementId = onRerollName(selectedName.id);
    if (replacementId) selectName(replacementId);
  }

  const inspector = selectedName ? (
    <NameInspector
      name={selectedName}
      isLocked={lockedNameIds.has(selectedName.id)}
      onRerollName={rerollSelectedName}
      onToggleLockedName={onToggleLockedName}
    />
  ) : <EmptyInspector />;

  return (
    <>
      <section className="hero panel app-header">
        <div>
          <h1>{modeTitle}</h1>
          <p className="hero-copy">Roll fantasy names, tune the feel, and keep the cast that fits.</p>
        </div>
        <div className="hero-stats" aria-label="Generation summary">
          <span>{ensemble.names.length} names</span>
          <span>{ensemble.diagnostics.repeatedEndings} repeated endings</span>
          <span>{ensemble.diagnostics.readabilityIssues} read notes</span>
          {hasLockedNames ? <span>{lockedCount} locked</span> : null}
        </div>
      </section>

      <section className="workspace workbench">
        <ConfigureTray
          mode={mode}
          stylePacks={stylePacks}
          settings={settings}
          committedSettings={committedSettings}
          isOpen={isConfigureOpen}
          lockedCount={lockedCount}
          onToggleOpen={() => setIsConfigureOpen((isOpen) => !isOpen)}
          onUpdateSetting={onUpdateSetting}
          onGenerate={submitGeneration}
          onCommitSettings={onCommitSettings}
          onRandomizeSliders={randomizeSliders}
          onRandomizeSlider={onRandomizeSlider}
          onClearLockedNames={onClearLockedNames}
        />

        <section className="output" aria-live="polite">
          {ensemble.names.length > 0 ? (
            <>
              <NameSelectionSurface
                ensemble={ensemble}
                lockedNameIds={lockedNameIds}
                selection={resolvedSelection}
                selectedNameId={selectedNameId}
                hasPreviousName={hasPreviousName}
                hasNextName={hasNextName}
                onSelectName={selectName}
                onSelectAllNames={selectAllNames}
                onSelectPreviousName={selectPreviousName}
                onSelectNextName={selectNextName}
                onToggleLockedName={onToggleLockedName}
              >
                <div ref={inspectorRegionRef}>
                  {inspector}
                </div>
              </NameSelectionSurface>
              <CastHealthPanel ensemble={ensemble} lockedNameIds={lockedNameIds} onSelectName={selectRelationshipName} />
            </>
          ) : (
            <div className="empty-state panel">Generate names to fill this cast.</div>
          )}

          <ExportMenu jsonExport={jsonExport} markdownExport={markdownExport} />
        </section>
      </section>
    </>
  );
}
