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
import { resolveSelectedNameId } from './workbenchSelection';

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
  const [selectedNameId, setSelectedNameId] = useState('');
  const [isConfigureOpen, setIsConfigureOpen] = useState(() => ensemble.names.length === 0);
  const inspectorRegionRef = useRef<HTMLDivElement>(null);
  const jsonExport = serializeCastAsJson(ensemble);
  const markdownExport = serializeCastAsMarkdown(ensemble);
  const modeTitle = titleCaseLabel(mode.label);
  const lockedCount = lockedNameIds.size;
  const hasLockedNames = lockedCount > 0;
  const resolvedSelectedNameId = resolveSelectedNameId(selectedNameId, ensemble, lockedNameIds);
  const selectedName = ensemble.names.find((name) => name.id === resolvedSelectedNameId);

  useEffect(() => {
    if (selectedNameId !== resolvedSelectedNameId) {
      setSelectedNameId(resolvedSelectedNameId);
    }
  }, [resolvedSelectedNameId, selectedNameId]);

  function selectName(id: string) {
    setSelectedNameId(id);
  }

  function selectRelationshipName(id: string) {
    selectName(id);
    inspectorRegionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
  ) : null;

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
          onOpen={() => setIsConfigureOpen(true)}
          onClose={() => setIsConfigureOpen(false)}
          onUpdateSetting={onUpdateSetting}
          onGenerate={onGenerate}
          onCommitSettings={onCommitSettings}
          onRandomizeSliders={onRandomizeSliders}
          onRandomizeSlider={onRandomizeSlider}
          onClearLockedNames={onClearLockedNames}
        />

        <section className="output" aria-live="polite">
          {ensemble.names.length > 0 ? (
            <>
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
