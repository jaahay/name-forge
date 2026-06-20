import { useEffect, useState, type FormEvent, type KeyboardEvent } from 'react';
import { serializeCastAsJson, serializeCastAsMarkdown } from '../engine/export';
import { rarityDistributionOptions } from '../engine/rarity';
import { castRoleOptions, castRolePresetOptions, roleInfluenceOptions } from '../engine/roles';
import type { CastRole, CastRolePresetKind, GeneratedEnsemble, GenerationSettings, NameFormatKind, RarityDistributionPresetKind, RoleInfluenceLevel, StylePackSummary } from '../engine/types';
import type { NamingModeConfig } from './modes';
import { scoreControls, type ControlKey } from './presentation';
import { ScoreControl } from './ScoreControl';
import { NameCard, NameInspector } from './NameCard';

interface GeneratorViewProps {
  mode: NamingModeConfig;
  stylePacks: StylePackSummary[];
  settings: GenerationSettings;
  committedSettings?: GenerationSettings;
  ensemble: GeneratedEnsemble;
  lockedNameIds: Set<string>;
  onUpdateSetting: <K extends keyof GenerationSettings>(key: K, value: GenerationSettings[K]) => void;
  onGenerate: (event?: FormEvent) => void;
  onCommitSettings: () => void;
  onRandomizeSliders: () => void;
  onRandomizeSlider: (key: ControlKey) => void;
  onToggleLockedName: (id: string) => void;
  onClearLockedNames: () => void;
}

const formatOptions: Array<{ value: NameFormatKind; label: string }> = [
  { value: 'mixed', label: 'Mixed cast formats' },
  { value: 'given-only', label: 'Given name only' },
  { value: 'given-family', label: 'Given + family' },
  { value: 'initials-family', label: 'Initials + family' },
  { value: 'title-name', label: 'Title + name' },
  { value: 'epithet-place', label: 'Epithet/place-style' },
];

function exportHref(mimeType: string, value: string): string {
  return 'data:' + mimeType + ';charset=utf-8,' + encodeURIComponent(value);
}

function copyExport(value: string) {
  void navigator.clipboard?.writeText(value);
}

function clampCastSize(value: number): number {
  if (Number.isNaN(value)) return 1;
  return Math.max(1, Math.min(24, Math.round(value)));
}

function titleCaseLabel(value: string): string {
  return value
    .split(' ')
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

function updateSlotRole(currentRoles: GenerationSettings['slotRoleOverrides'], index: number, role: CastRole | ''): GenerationSettings['slotRoleOverrides'] {
  const nextRoles = { ...(currentRoles ?? {}) };
  if (role === '') {
    delete nextRoles[index];
    return nextRoles;
  }
  nextRoles[index] = role;
  return nextRoles;
}

function EmptyInspector() {
  return (
    <aside className="inspector-empty-panel panel" aria-label="Name inspector">
      <h2>Inspect</h2>
      <p>Select a name to view fit, parts, spellings, and construction cues.</p>
    </aside>
  );
}

function resolveSelectedNameId(previousSelectedId: string, ensemble: GeneratedEnsemble, lockedNameIds: Set<string>): string {
  if (previousSelectedId && ensemble.names.some((name) => name.id === previousSelectedId)) {
    return previousSelectedId;
  }

  const firstLocked = ensemble.names.find((name) => lockedNameIds.has(name.id));
  return firstLocked?.id ?? ensemble.names[0]?.id ?? '';
}

export function GeneratorView({
  mode,
  stylePacks,
  settings,
  ensemble,
  lockedNameIds,
  onUpdateSetting,
  onGenerate,
  onCommitSettings,
  onRandomizeSliders,
  onRandomizeSlider,
  onToggleLockedName,
  onClearLockedNames,
}: GeneratorViewProps) {
  const [selectedNameId, setSelectedNameId] = useState('');
  const jsonExport = serializeCastAsJson(ensemble);
  const markdownExport = serializeCastAsMarkdown(ensemble);
  const castSize = clampCastSize(settings.castSize);
  const slotRoleCount = Math.max(0, Math.min(castSize, 8));
  const hasRoleMix = (settings.rolePreset ?? 'none') !== 'none';
  const selectedRoleInfluence = roleInfluenceOptions.find((option) => option.value === (settings.roleInfluence ?? 'off'));
  const modeTitle = titleCaseLabel(mode.label);
  const castSizeLabel = `${mode.shortLabel} size`;
  const lockedCount = lockedNameIds.size;
  const hasLockedNames = lockedCount > 0;
  const resolvedSelectedNameId = resolveSelectedNameId(selectedNameId, ensemble, lockedNameIds);
  const selectedName = ensemble.names.find((name) => name.id === resolvedSelectedNameId);
  const selectedNameKey = selectedName?.id ?? '';

  useEffect(() => {
    if (selectedNameId !== resolvedSelectedNameId) {
      setSelectedNameId(resolvedSelectedNameId);
    }
  }, [resolvedSelectedNameId, selectedNameId]);

  function updateCastSize(value: number) {
    onUpdateSetting('castSize', clampCastSize(value));
  }

  function selectName(id: string) {
    setSelectedNameId(id);
  }

  function submitGeneration(event?: FormEvent) {
    onGenerate(event);
  }

  function commitSeed() {
    onCommitSettings();
  }

  function commitSeedOnEnter(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    event.currentTarget.blur();
  }

  function randomizeSliders() {
    onRandomizeSliders();
  }

  function randomizeSlider(key: ControlKey) {
    onRandomizeSlider(key);
  }

  const roster = (
    <section className="roster-panel panel" aria-label="Name roster">
      <div className="name-grid" aria-label="Name tiles">
        {ensemble.names.map((name) => (
          <NameCard
            key={name.id}
            name={name}
            isSelected={name.id === selectedNameKey}
            isLocked={lockedNameIds.has(name.id)}
            onSelect={selectName}
            onToggleLocked={onToggleLockedName}
          />
        ))}
      </div>
    </section>
  );

  const inspector = selectedName ? <NameInspector name={selectedName} /> : <EmptyInspector />;

  return (
    <>
      <section className="hero panel app-header">
        <div>
          <h1>{modeTitle}</h1>
          <p className="hero-copy">Roll fantasy names, tune the feel, and keep the cast that fits.</p>
        </div>
        <div className="hero-stats" aria-label="Generation summary">
          <span>{ensemble.names.length} names</span>
          <span>{ensemble.diagnostics.repeatedInitials} repeated initials</span>
          <span>{ensemble.diagnostics.repeatedEndings} repeated endings</span>
          {hasLockedNames ? <span>{lockedCount} locked</span> : null}
        </div>
      </section>

      <section className="workspace workbench">
        <form className="controls panel" onSubmit={submitGeneration}>
          <details className="control-section">
            <summary>Cast setup</summary>
            <div className="control-section-body">
              <label>
                <span>{castSizeLabel}</span>
                <div className="cast-size-control">
                  <button type="button" className="stepper-button" onClick={() => updateCastSize(castSize - 1)} aria-label="Decrease cast size">-</button>
                  <input type="number" min="1" max="24" value={castSize} onChange={(event) => updateCastSize(Number(event.target.value))} />
                  <button type="button" className="stepper-button" onClick={() => updateCastSize(castSize + 1)} aria-label="Increase cast size">+</button>
                </div>
              </label>
              <label>
                <span>Style preset</span>
                <select value={settings.stylePackId} onChange={(event) => onUpdateSetting('stylePackId', event.target.value)}>
                  {stylePacks.map((pack) => <option key={pack.id} value={pack.id}>{pack.label}</option>)}
                </select>
              </label>
              <label>
                <span>Name format</span>
                <select value={settings.nameFormat ?? 'given-only'} onChange={(event) => onUpdateSetting('nameFormat', event.target.value as NameFormatKind)}>
                  {formatOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
            </div>
          </details>

          <details className="control-section">
            <summary>Story roles</summary>
            <div className="control-section-body">
              <label>
                <span>Cast role mix</span>
                <select value={settings.rolePreset ?? 'none'} onChange={(event) => onUpdateSetting('rolePreset', event.target.value as CastRolePresetKind)}>
                  {castRolePresetOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
              <label>
                <span>Role influence</span>
                <select value={settings.roleInfluence ?? 'off'} onChange={(event) => onUpdateSetting('roleInfluence', event.target.value as RoleInfluenceLevel)}>
                  {roleInfluenceOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
                <small>{selectedRoleInfluence?.help}</small>
              </label>
              <p className="section-note">Role influence is opt-in. Off keeps roles as labels only; Light and Strong nudge silhouette, sound patterns, role-fit scoring, and export metadata.</p>
              {hasRoleMix ? (
                <details className="slot-overrides">
                  <summary>Customize slots</summary>
                  <div className="slot-role-grid" aria-label="Slot role overrides">
                    {Array.from({ length: slotRoleCount }, (_, index) => (
                      <label key={`slot-role-${index + 1}`}>
                        <span>Slot {index + 1}</span>
                        <select value={settings.slotRoleOverrides?.[index] ?? ''} onChange={(event) => onUpdateSetting('slotRoleOverrides', updateSlotRole(settings.slotRoleOverrides, index, event.target.value as CastRole | ''))}>
                          <option value="">Use role mix</option>
                          {castRoleOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                      </label>
                    ))}
                    <p className="section-note">Slot overrides only affect selected slots and preserve the rest of the role mix.</p>
                  </div>
                </details>
              ) : (
                <p className="section-note">Choose a role mix to reveal optional slot-by-slot overrides.</p>
              )}
            </div>
          </details>

          <details className="control-section" open>
            <summary>Name feel</summary>
            <div className="control-section-body">
              <label>
                <span>Rarity distribution</span>
                <select value={settings.rarityDistribution ?? 'style-pack'} onChange={(event) => onUpdateSetting('rarityDistribution', event.target.value as RarityDistributionPresetKind)}>
                  {rarityDistributionOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
              {scoreControls.map((control) => (
                <ScoreControl key={control.key} control={control} value={Number(settings[control.key])} onChange={(key, value) => onUpdateSetting(key, value)} onRandomize={randomizeSlider} />
              ))}
            </div>
          </details>

          <details className="control-section">
            <summary>Run options</summary>
            <div className="control-section-body">
              <label className="seed-control">
                <span>Generation seed</span>
                <input value={settings.seed} onChange={(event) => onUpdateSetting('seed', event.target.value)} onBlur={commitSeed} onKeyDown={commitSeedOnEnter} />
              </label>
            </div>
          </details>

          <div className="actions" aria-label="Generation actions">
            <button type="submit">Generate</button>
            <button type="button" className="secondary" onClick={randomizeSliders}>Reroll feel</button>
            {hasLockedNames ? (
              <p className="lock-status">{lockedCount} locked. Generate keeps locked names and rerolls the rest. <button type="button" className="anchor-button" onClick={onClearLockedNames}>Clear</button></p>
            ) : null}
          </div>
        </form>

        <section className="output" aria-live="polite">
          {ensemble.names.length > 0 ? (
            <div className="results-layout inspector-rail-layout">
              {roster}
              {inspector}
            </div>
          ) : (
            <div className="empty-state panel">Generate names to fill this cast.</div>
          )}

          <details className="save-menu panel">
            <summary>Export</summary>
            <div className="save-menu-content" aria-label="Export cast">
              <div className="save-group" aria-label="Save files">
                <span className="save-group-label">Save</span>
                <a className="export-link" download="name-forge-cast.json" href={exportHref('application/json', jsonExport)}>JSON</a>
                <a className="export-link" download="name-forge-cast.md" href={exportHref('text/markdown', markdownExport)}>Markdown</a>
              </div>
              <div className="save-group" aria-label="Copy cast">
                <span className="save-group-label">Copy</span>
                <button type="button" className="secondary" aria-label="Copy JSON" onClick={() => copyExport(jsonExport)}>JSON</button>
                <button type="button" className="secondary" aria-label="Copy Markdown" onClick={() => copyExport(markdownExport)}>Markdown</button>
              </div>
            </div>
          </details>
        </section>
      </section>
    </>
  );
}
