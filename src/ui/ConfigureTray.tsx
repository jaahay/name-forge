import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import {
  fictionCastSemanticBaselineFromSettings,
  withFictionCastSemanticControl,
  type FictionCastSemanticControlValue,
} from '../fictionCast/semanticIntent';
import type { FictionCastSettings } from '../fictionCast/types';
import { castVariationOptions, type FictionCastVariation } from '../fictionCast/variation';
import type { NameFormatKind, StylePackSummary } from '../engine/types';
import { resolveConfigureFocusTarget, shouldCloseConfigureOnKey } from './configureBehavior';
import {
  FictionCastRolesConfiguration,
  fictionCastRolesSummary,
} from './FictionCastRolesConfiguration';
import type { NamingModeConfig } from './modes';
import { advancedScoreControls, primaryScoreControls, type ControlKey } from './presentation';
import { ScoreControl } from './ScoreControl';

export const formatOptions: Array<{ value: NameFormatKind; label: string }> = [
  { value: 'mixed', label: 'Mixed cast formats' },
  { value: 'given-only', label: 'Given name only' },
  { value: 'given-family', label: 'Given + family' },
  { value: 'initials-family', label: 'Initials + family' },
  { value: 'title-name', label: 'Title + name' },
  { value: 'epithet-place', label: 'Epithet/place-style' },
];

interface ConfigureTrayProps {
  mode: NamingModeConfig;
  stylePacks: StylePackSummary[];
  settings: FictionCastSettings;
  committedSettings?: FictionCastSettings;
  isOpen: boolean;
  hasGeneratedCast: boolean;
  lockedCount: number;
  onOpen: () => void;
  onClose: () => void;
  onUpdateSetting: <K extends keyof FictionCastSettings>(key: K, value: FictionCastSettings[K]) => void;
  onGenerate: (event?: FormEvent<HTMLFormElement>) => void;
  onCommitSettings: () => void;
  onRandomizeCriteria: () => void;
  onClearLockedNames: () => void;
}

type ConfigureView = 'criteria' | 'roles';

function clampCastSize(value: number): number {
  if (Number.isNaN(value)) return 1;
  return Math.max(1, Math.min(24, Math.round(value)));
}

function labelForFormat(value: NameFormatKind | undefined): string {
  return formatOptions.find((option) => option.value === (value ?? 'given-only'))?.label ?? 'Given name only';
}

export function ConfigureTray({
  mode,
  stylePacks,
  settings,
  committedSettings,
  isOpen,
  hasGeneratedCast,
  lockedCount,
  onOpen,
  onClose,
  onUpdateSetting,
  onGenerate,
  onCommitSettings,
  onRandomizeCriteria,
  onClearLockedNames,
}: ConfigureTrayProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const rolesTriggerRef = useRef<HTMLButtonElement>(null);
  const rolesBackButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);
  const previousViewRef = useRef<ConfigureView>('criteria');
  const [configureView, setConfigureView] = useState<ConfigureView>('criteria');
  const castSize = clampCastSize(settings.castSize);
  const semanticBaseline = fictionCastSemanticBaselineFromSettings(settings);
  const rolesSummary = fictionCastRolesSummary(settings);
  const summarySettings = committedSettings ?? settings;
  const summaryStylePack = stylePacks.find((pack) => pack.id === summarySettings.stylePackId)?.label ?? summarySettings.stylePackId;
  const summaryItems = [summaryStylePack, `${clampCastSize(summarySettings.castSize)} names`, labelForFormat(summarySettings.nameFormat)];
  const hasLockedNames = lockedCount > 0;
  const castSizeLabel = `${mode.shortLabel} size`;
  const launcherGenerateLabel = hasGeneratedCast ? 'Regenerate' : 'Start cast';
  const drawerGenerateLabel = hasGeneratedCast ? 'Generate' : 'Start cast';
  const isRolesView = configureView === 'roles';

  useEffect(() => {
    const focusTarget = resolveConfigureFocusTarget(wasOpenRef.current, isOpen);
    if (focusTarget === 'close') {
      closeButtonRef.current?.focus();
    } else if (focusTarget === 'trigger') {
      triggerRef.current?.focus();
    }
    wasOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      previousViewRef.current = 'criteria';
      if (configureView !== 'criteria') setConfigureView('criteria');
      return;
    }

    const previousView = previousViewRef.current;
    if (previousView !== configureView) {
      if (configureView === 'roles') rolesBackButtonRef.current?.focus();
      else rolesTriggerRef.current?.focus();
    }
    previousViewRef.current = configureView;
  }, [configureView, isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    function closeOnEscape(event: globalThis.KeyboardEvent) {
      if (!shouldCloseConfigureOnKey(event.key)) return;
      event.preventDefault();
      setConfigureView('criteria');
      onClose();
    }

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isOpen, onClose]);

  function closeConfigure() {
    setConfigureView('criteria');
    onClose();
  }

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
    <>
      <div className="configure-launcher panel" aria-label="Generation controls">
        <button
          ref={triggerRef}
          type="button"
          className="secondary configure-trigger"
          aria-controls="fiction-cast-configure-drawer"
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          onClick={onOpen}
        >
          Configure
        </button>
        <button type="button" onClick={() => onGenerate()}>{launcherGenerateLabel}</button>
        {hasLockedNames ? <span className="configure-lock-count">{lockedCount} locked</span> : null}
      </div>

      {isOpen ? (
        <form
          id="fiction-cast-configure-drawer"
          className="controls configure-drawer panel"
          role="dialog"
          aria-labelledby="fiction-cast-configure-title"
          onSubmit={onGenerate}
        >
          <header className="configure-drawer-header">
            <div className="configure-drawer-heading">
              <p className="eyebrow">{isRolesView ? 'Configure' : 'Tune cast'}</p>
              <h2 id="fiction-cast-configure-title">{isRolesView ? 'Roles' : 'Configure criteria'}</h2>
              <p className="configure-current-settings">
                {isRolesView ? 'Assignment · generation influence · cast members' : summaryItems.join(' · ')}
              </p>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              className="secondary configure-close"
              aria-label="Close configure"
              title="Close configure"
              onClick={closeConfigure}
            >
              ×
            </button>
          </header>

          {isRolesView ? (
            <div className="configure-sections configure-roles-sections">
              <FictionCastRolesConfiguration
                settings={settings}
                onUpdateSetting={onUpdateSetting}
                onBack={() => setConfigureView('criteria')}
                backButtonRef={rolesBackButtonRef}
              />
            </div>
          ) : (
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
                    <span>Style pack</span>
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
                      onClick={() => setConfigureView('roles')}
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
                    <select value={settings.nameFormat ?? 'given-only'} onChange={(event) => onUpdateSetting('nameFormat', event.target.value as NameFormatKind)}>
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
                <button type="submit">{drawerGenerateLabel}</button>
                <button type="button" className="secondary" onClick={onRandomizeCriteria}>Randomize criteria</button>
                {hasLockedNames ? (
                  <p className="lock-status">{lockedCount} locked. Generate keeps locked names and rerolls the rest. <button type="button" className="anchor-button" onClick={onClearLockedNames}>Clear</button></p>
                ) : null}
              </div>
            </div>
          )}
        </form>
      ) : null}
    </>
  );
}
