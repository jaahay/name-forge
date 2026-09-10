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
import { ContextualHelp } from './ContextualHelp';
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
          <div className="configure-field">
            <div className="control-label-row">
              <label htmlFor="fiction-cast-naming-idiom">Naming idiom</label>
              <ContextualHelp id="naming-idiom-help" label="Naming idiom">
                <p>A creative naming source for characteristic tendencies. It works alongside your other settings; there is no separate idiom adherence or strength control.</p>
              </ContextualHelp>
            </div>
            <select id="fiction-cast-naming-idiom" value={settings.stylePackId} onChange={(event) => onUpdateSetting('stylePackId', event.target.value)}>
              {stylePacks.map((pack) => <option key={pack.id} value={pack.id}>{pack.label}</option>)}
            </select>
          </div>
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
          <div className="configure-field">
            <div className="control-label-row">
              <label htmlFor="fiction-cast-variation">Cast variation</label>
              <ContextualHelp id="cast-variation-help" label="Cast variation">
                <p>Controls how widely cast members vary around the Familiar baseline. It does not replace or rewrite Familiar.</p>
              </ContextualHelp>
            </div>
            <select id="fiction-cast-variation" value={settings.castVariation ?? 'balanced'} onChange={(event) => onUpdateSetting('castVariation', event.target.value as FictionCastVariation)}>
              {castVariationOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
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
          <div className="configure-field seed-control">
            <div className="control-label-row">
              <label htmlFor="fiction-cast-generation-seed">Generation seed</label>
              <ContextualHelp id="generation-seed-help" label="Generation seed">
                <p>The same resolved settings and seed reproduce the same result. Generate chooses a fresh seed; editing this field applies an explicit seed to an existing cast.</p>
              </ContextualHelp>
            </div>
            <input id="fiction-cast-generation-seed" value={settings.seed} onChange={(event) => onUpdateSetting('seed', event.target.value)} onBlur={onCommitSettings} onKeyDown={commitSeedOnEnter} />
          </div>
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
