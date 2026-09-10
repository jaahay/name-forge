import type { KeyboardEvent, Ref } from 'react';
import type { FictionCastNameFormatKind } from '../fictionCast/identityFormat';
import {
  fictionCastSemanticBaselineFromSettings,
  withFictionCastSemanticControl,
  type FictionCastSemanticControlValue,
} from '../fictionCast/semanticIntent';
import type { FictionCastSettings } from '../fictionCast/types';
import { castVariationOptions, type FictionCastVariation } from '../fictionCast/variation';
import type { StylePackSummary } from '../engine/types';
import { fictionCastRolesSummary } from './FictionCastRolesConfiguration';
import type { NamingModeConfig } from './modes';
import { advancedScoreControls, primaryScoreControls, type ControlKey } from './presentation';
import { ScoreControl } from './ScoreControl';

export const formatOptions: Array<{ value: FictionCastNameFormatKind; label: string }> = [
  { value: 'mixed', label: 'Mixed cast formats' },
  { value: 'given-only', label: 'Given name only' },
  { value: 'given-family', label: 'Given + family' },
  { value: 'given-additional-family', label: 'Given + additional name + family' },
  { value: 'initials-family', label: 'Initials + family' },
  { value: 'title-name', label: 'Title + name' },
  { value: 'epithet-place', label: 'Epithet/place-style' },
];

function clampCastSize(value: number): number {
  if (Number.isNaN(value)) return 1;
  return Math.max(1, Math.min(24, Math.round(value)));
}

function labelForFormat(value: FictionCastNameFormatKind | undefined): string {
  return formatOptions.find((option) => option.value === (value ?? 'given-only'))?.label ?? 'Given name only';
}

export function configureSummaryItems(settings: FictionCastSettings, stylePacks: StylePackSummary[]): string[] {
  const stylePack = stylePacks.find((pack) => pack.id === settings.stylePackId)?.label ?? settings.stylePackId;
  return [stylePack, `${clampCastSize(settings.castSize)} names`, labelForFormat(settings.nameFormat)];
}

interface ConfigureCriteriaProps {
  readonly mode: NamingModeConfig;
  readonly stylePacks: StylePackSummary[];
  readonly settings: FictionCastSettings;
  readonly hasGeneratedCast: boolean;
  readonly lockedCount: number;
  readonly rolesTriggerRef: Ref<HTMLButtonElement>;
  readonly onOpenRoles: () => void;
  readonly onUpdateSetting: <K extends keyof FictionCastSettings>(key: K, value: FictionCastSettings[K]) => void;
  readonly onCommitSettings: () => void;
  readonly onRandomizeCriteria: () => void;
  readonly onClearLockedNames: () => void;
}

export function ConfigureCriteria({
  mode,
  stylePacks,
  settings,
  hasGeneratedCast,
  lockedCount,
  rolesTriggerRef,
  onOpenRoles,
  onUpdateSetting,
  onCommitSettings,
  onRandomizeCriteria,
  onClearLockedNames,
}: ConfigureCriteriaProps) {
  const castSize = clampCastSize(settings.castSize);
  const semanticBaseline = fictionCastSemanticBaselineFromSettings(settings);
  const rolesSummary = fictionCastRolesSummary(settings);
  const hasLockedNames = lockedCount > 0;
  const castSizeLabel = `${mode.shortLabel} size`;
  const generateLabel = hasGeneratedCast ? 'Generate' : 'Start cast';

  function updateCastSize(value: number) {
    onUpdateSetting('castSize', clampCastSize(value));
  }

  function updateSemanticControl(key: ControlKey, value: FictionCastSemanticControlValue) {
    const nextSettings = withFictionCastSemanticControl(settings, key, value);
    onUpdateSetting('semanticBaseline', nextSettings.semanticBaseline);
  }

  function commitSeedOnEnter(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    event.currentTarget.blur();
  }

  return (
    <div className="configure-sections">
      <section className="control-section configure-essentials" aria-labelledby="configure-essentials-title">
        <div className="control-section-body">
          <p id="configure-essentials-title" className="eyebrow">Essentials</p>
          <label>
            <span>{castSizeLabel}</span>
            <div className="cast-size-control">
              <button type="button" className="stepper-button" onClick={() => updateCastSize(castSize - 1)} aria-label="Decrease cast size">-</button>
              <input type="number" min="1" max="24" value={castSize} onChange={(event) => updateCastSize(Number(event.target.value))} />
              <button type="button" className="stepper-button" onClick={() => updateCastSize(castSize + 1)} aria-label="Increase cast size">+</button>
            </div>
          </label>
          <label>
            <span>Naming idiom</span>
            <select value={settings.stylePackId} onChange={(event) => onUpdateSetting('stylePackId', event.target.value)}>
              {stylePacks.map((pack) => <option key={pack.id} value={pack.id}>{pack.label}</option>)}
            </select>
          </label>
          <div className="configure-role-entry">
            <div className="configure-role-summary">
              <span>Roles</span>
              <strong>{rolesSummary}</strong>
            </div>
            <button
              ref={rolesTriggerRef}
              type="button"
              className="secondary configure-role-button"
              aria-label={`Configure roles, ${rolesSummary}`}
              onClick={onOpenRoles}
            >
              Configure roles
            </button>
          </div>
          <label>
            <span>Cast variation</span>
            <select value={settings.castVariation ?? 'balanced'} onChange={(event) => onUpdateSetting('castVariation', event.target.value as FictionCastVariation)}>
              {castVariationOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        </div>
      </section>

      <details className="control-section">
        <summary>More</summary>
        <div className="control-section-body">
          <label>
            <span>Name format</span>
            <select value={settings.nameFormat ?? 'given-only'} onChange={(event) => onUpdateSetting('nameFormat', event.target.value as FictionCastNameFormatKind)}>
              {formatOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          {primaryScoreControls.map((control) => (
            <ScoreControl key={control.key} control={control} value={semanticBaseline[control.key]} onChange={updateSemanticControl} />
          ))}
        </div>
      </details>

      <details className="control-section">
        <summary>Advanced</summary>
        <div className="control-section-body">
          {advancedScoreControls.map((control) => (
            <ScoreControl key={control.key} control={control} value={semanticBaseline[control.key]} onChange={updateSemanticControl} />
          ))}
          <label className="seed-control">
            <span>Generation seed</span>
            <input value={settings.seed} onChange={(event) => onUpdateSetting('seed', event.target.value)} onBlur={onCommitSettings} onKeyDown={commitSeedOnEnter} />
          </label>
        </div>
      </details>

      <div className="actions" aria-label="Generation actions">
        <button type="submit">{generateLabel}</button>
        <button type="button" className="secondary" onClick={onRandomizeCriteria}>Randomize criteria</button>
        {hasLockedNames ? (
          <p className="lock-status">{lockedCount} locked. Generate keeps locked names and rerolls the rest. <button type="button" className="anchor-button" onClick={onClearLockedNames}>Clear</button></p>
        ) : null}
      </div>
    </div>
  );
}
