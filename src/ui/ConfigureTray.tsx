import { useEffect, useRef, type FormEvent, type KeyboardEvent } from 'react';
import { rarityDistributionOptions, type FictionCastRarityDistributionPresetKind } from '../fictionCast/rarity';
import { castRoleOptions, castRolePresetOptions, roleInfluenceOptions } from '../fictionCast/roles';
import type { CastRole, CastRolePresetKind, FictionCastSettings, RoleInfluenceLevel } from '../fictionCast/types';
import type { NameFormatKind, StylePackSummary } from '../engine/types';
import { resolveConfigureFocusTarget, shouldCloseConfigureOnKey } from './configureBehavior';
import type { NamingModeConfig } from './modes';
import { advancedScoreControls, primaryScoreControls } from './presentation';
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
  lockedCount: number;
  onOpen: () => void;
  onClose: () => void;
  onUpdateSetting: <K extends keyof FictionCastSettings>(key: K, value: FictionCastSettings[K]) => void;
  onGenerate: (event?: FormEvent<HTMLFormElement>) => void;
  onCommitSettings: () => void;
  onRandomizeSliders: () => void;
  onClearLockedNames: () => void;
}

function clampCastSize(value: number): number {
  if (Number.isNaN(value)) return 1;
  return Math.max(1, Math.min(24, Math.round(value)));
}

function updateSlotRole(currentRoles: FictionCastSettings['slotRoleOverrides'], index: number, role: CastRole | ''): FictionCastSettings['slotRoleOverrides'] {
  const nextRoles = { ...(currentRoles ?? {}) };
  if (role === '') {
    delete nextRoles[index];
    return nextRoles;
  }
  nextRoles[index] = role;
  return nextRoles;
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
  lockedCount,
  onOpen,
  onClose,
  onUpdateSetting,
  onGenerate,
  onCommitSettings,
  onRandomizeSliders,
  onClearLockedNames,
}: ConfigureTrayProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);
  const castSize = clampCastSize(settings.castSize);
  const slotRoleCount = Math.max(0, Math.min(castSize, 8));
  const hasRoleMix = (settings.rolePreset ?? 'none') !== 'none';
  const selectedRoleInfluence = roleInfluenceOptions.find((option) => option.value === (settings.roleInfluence ?? 'off'));
  const summarySettings = committedSettings ?? settings;
  const summaryStylePack = stylePacks.find((pack) => pack.id === summarySettings.stylePackId)?.label ?? summarySettings.stylePackId;
  const summaryItems = [summaryStylePack, `${clampCastSize(summarySettings.castSize)} names`, labelForFormat(summarySettings.nameFormat)];
  const hasLockedNames = lockedCount > 0;
  const castSizeLabel = `${mode.shortLabel} size`;

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
    if (!isOpen) return undefined;

    function closeOnEscape(event: globalThis.KeyboardEvent) {
      if (!shouldCloseConfigureOnKey(event.key)) return;
      event.preventDefault();
      onClose();
    }

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isOpen, onClose]);

  function updateCastSize(value: number) {
    onUpdateSetting('castSize', clampCastSize(value));
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
        <button type="button" onClick={() => onGenerate()}>Regenerate</button>
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
              <p className="eyebrow">Tune cast</p>
              <h2 id="fiction-cast-configure-title">Configure criteria</h2>
              <p className="configure-current-settings">{summaryItems.join(' · ')}</p>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              className="secondary configure-close"
              aria-label="Close configure"
              title="Close configure"
              onClick={onClose}
            >
              ×
            </button>
          </header>

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
                <label>
                  <span>Cast role mix</span>
                  <select value={settings.rolePreset ?? 'none'} onChange={(event) => onUpdateSetting('rolePreset', event.target.value as CastRolePresetKind)}>
                    {castRolePresetOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </label>
                <label>
                  <span>Cast variety</span>
                  <select value={settings.rarityDistribution ?? 'style-pack'} onChange={(event) => onUpdateSetting('rarityDistribution', event.target.value as FictionCastRarityDistributionPresetKind)}>
                    {rarityDistributionOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
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
                <label>
                  <span>Role influence</span>
                  <select value={settings.roleInfluence ?? 'off'} onChange={(event) => onUpdateSetting('roleInfluence', event.target.value as RoleInfluenceLevel)}>
                    {roleInfluenceOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                  <small>{selectedRoleInfluence?.help}</small>
                </label>
                {primaryScoreControls.map((control) => (
                  <ScoreControl key={control.key} control={control} value={Number(settings[control.key])} onChange={(key, value) => onUpdateSetting(key, value)} />
                ))}
              </div>
            </details>

            <details className="control-section">
              <summary>Advanced</summary>
              <div className="control-section-body">
                {hasRoleMix ? (
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
                  </div>
                ) : null}
                {advancedScoreControls.map((control) => (
                  <ScoreControl key={control.key} control={control} value={Number(settings[control.key])} onChange={(key, value) => onUpdateSetting(key, value)} />
                ))}
                <label className="seed-control">
                  <span>Generation seed</span>
                  <input value={settings.seed} onChange={(event) => onUpdateSetting('seed', event.target.value)} onBlur={onCommitSettings} onKeyDown={commitSeedOnEnter} />
                </label>
              </div>
            </details>

            <div className="actions" aria-label="Generation actions">
              <button type="submit">Generate</button>
              <button type="button" className="secondary" onClick={onRandomizeSliders}>Shuffle criteria</button>
              {hasLockedNames ? (
                <p className="lock-status">{lockedCount} locked. Generate keeps locked names and rerolls the rest. <button type="button" className="anchor-button" onClick={onClearLockedNames}>Clear</button></p>
              ) : null}
            </div>
          </div>
        </form>
      ) : null}
    </>
  );
}
