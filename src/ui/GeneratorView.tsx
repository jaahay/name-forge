import type { FormEvent } from 'react';
import { rarityDistributionOptions } from '../engine/rarity';
import { castRolePresetOptions, roleInfluenceOptions } from '../engine/roles';
import type { CastRolePresetKind, GeneratedEnsemble, GenerationSettings, NameFormatKind, RarityDistributionPresetKind, RoleInfluenceLevel, StylePackSummary } from '../engine/types';
import { CastHealthPanel } from './CastHealth';
import type { NamingModeConfig } from './modes';
import { NameCard } from './NameCard';
import { NameInspector } from './NameInspector';
import { advancedScoreControls, primaryScoreControls, type ControlKey } from './presentation';
import { ScoreControl } from './ScoreControl';

interface GeneratorViewProps { mode: NamingModeConfig; stylePacks: StylePackSummary[]; settings: GenerationSettings; committedSettings?: GenerationSettings; ensemble: GeneratedEnsemble; lockedNameIds: Set<string>; onUpdateSetting: <K extends keyof GenerationSettings>(key: K, value: GenerationSettings[K]) => void; onGenerate: (event?: FormEvent) => void; onCommitSettings: () => void; onRandomizeSliders: () => void; onRandomizeSlider: (key: ControlKey) => void; onToggleLockedName: (id: string) => void; onClearLockedNames: () => void; }

const formatOptions: Array<{ value: NameFormatKind; label: string }> = [
  { value: 'mixed', label: 'Mixed cast formats' },
  { value: 'given-only', label: 'Given name only' },
  { value: 'given-family', label: 'Given + family' },
  { value: 'initials-family', label: 'Initials + family' },
  { value: 'title-name', label: 'Title + name' },
  { value: 'epithet-place', label: 'Epithet/place-style' },
];

function clampCastSize(value: number): number { return Number.isNaN(value) ? 1 : Math.max(1, Math.min(24, Math.round(value))); }
function titleCaseLabel(value: string): string { return value.split(' ').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' '); }

export function GeneratorView({ mode, stylePacks, settings, ensemble, lockedNameIds, onUpdateSetting, onGenerate, onRandomizeSliders, onRandomizeSlider, onToggleLockedName, onClearLockedNames }: GeneratorViewProps) {
  const castSize = clampCastSize(settings.castSize);
  const selectedName = ensemble.names[0];
  const lockedCount = lockedNameIds.size;
  return <>
    <section className="hero panel app-header"><div><h1>{titleCaseLabel(mode.label)}</h1><p className="hero-copy">Roll fantasy names, tune the feel, and keep the cast that fits.</p></div><div className="hero-stats" aria-label="Generation summary"><span>{ensemble.names.length} names</span><span>{ensemble.diagnostics.repeatedInitials} repeated initials</span><span>{ensemble.diagnostics.repeatedEndings} repeated endings</span><span>{ensemble.diagnostics.readabilityIssues} read notes</span>{lockedCount > 0 ? <span>{lockedCount} locked</span> : null}</div></section>
    <section className="workspace workbench"><form className="controls panel" onSubmit={(event) => onGenerate(event)}>
      <details className="control-section"><summary>Cast setup</summary><div className="control-section-body"><label><span>{mode.shortLabel} size</span><input type="number" min="1" max="24" value={castSize} onChange={(event) => onUpdateSetting('castSize', clampCastSize(Number(event.target.value)))} /></label><label><span>Style pack</span><select value={settings.stylePackId} onChange={(event) => onUpdateSetting('stylePackId', event.target.value)}>{stylePacks.map((pack) => <option key={pack.id} value={pack.id}>{pack.label}</option>)}</select></label><label><span>Name format</span><select value={settings.nameFormat ?? 'given-only'} onChange={(event) => onUpdateSetting('nameFormat', event.target.value as NameFormatKind)}>{formatOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label></div></details>
      <details className="control-section"><summary>Story roles</summary><div className="control-section-body"><label><span>Cast role mix</span><select value={settings.rolePreset ?? 'none'} onChange={(event) => onUpdateSetting('rolePreset', event.target.value as CastRolePresetKind)}>{castRolePresetOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label><label><span>Role influence</span><select value={settings.roleInfluence ?? 'off'} onChange={(event) => onUpdateSetting('roleInfluence', event.target.value as RoleInfluenceLevel)}>{roleInfluenceOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label></div></details>
      <details className="control-section" open><summary>Feel</summary><div className="control-section-body"><label><span>Cast variety</span><select value={settings.rarityDistribution ?? 'style-pack'} onChange={(event) => onUpdateSetting('rarityDistribution', event.target.value as RarityDistributionPresetKind)}>{rarityDistributionOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>{primaryScoreControls.map((control) => <ScoreControl key={control.key} control={control} value={Number(settings[control.key])} onChange={(key, value) => onUpdateSetting(key, value)} onRandomize={onRandomizeSlider} />)}<details className="slot-overrides"><summary>Advanced tuning</summary><div className="control-section-body">{advancedScoreControls.map((control) => <ScoreControl key={control.key} control={control} value={Number(settings[control.key])} onChange={(key, value) => onUpdateSetting(key, value)} onRandomize={onRandomizeSlider} />)}</div></details></div></details>
      <div className="actions" aria-label="Generation actions"><button type="submit">Generate</button><button type="button" className="secondary" onClick={onRandomizeSliders}>Shuffle feel</button>{lockedCount > 0 ? <p className="lock-status">{lockedCount} locked. <button type="button" className="anchor-button" onClick={onClearLockedNames}>Clear</button></p> : null}</div>
    </form><section className="output" aria-live="polite">{ensemble.names.length > 0 ? <div className="results-layout inspector-rail-layout"><section className="roster-panel panel" aria-label="Name roster"><CastHealthPanel ensemble={ensemble} lockedNameIds={lockedNameIds} /><div className="name-grid" aria-label="Name tiles">{ensemble.names.map((name) => <NameCard key={name.id} name={name} isSelected={name.id === selectedName?.id} isLocked={lockedNameIds.has(name.id)} onSelect={() => undefined} onToggleLocked={onToggleLockedName} />)}</div></section>{selectedName ? <NameInspector name={selectedName} /> : null}</div> : <div className="empty-state panel">Generate names to fill this cast.</div>}</section></section>
  </>;
}
