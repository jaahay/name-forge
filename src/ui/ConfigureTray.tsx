import { useEffect, useRef, type FormEvent, type KeyboardEvent } from 'react';
import { rarityDistributionOptions, type FictionCastRarityDistributionPresetKind } from '../fictionCast/rarity';
import { castRoleOptions, castRolePresetOptions, roleInfluenceOptions } from '../fictionCast/roles';
import type { CastRole, CastRolePresetKind, FictionCastSettings, RoleInfluenceLevel } from '../fictionCast/types';
import type { NameFormatKind, StylePackSummary } from '../engine/types';
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
  lockedCount: number;
  onOpen: () => void;
  onClose: () => void;
  onUpdateSetting: <K extends keyof FictionCastSettings>(key: K, value: FictionCastSettings[K]) => void;
  onGenerate: (event?: FormEvent<HTMLFormElement>) => void;
  onCommitSettings: () => void;
  onRandomizeSliders: () => void;
  onRandomizeSlider: (key: ControlKey) => void;
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

function tierLabel(value: number, low: string, middle: string, high: string): string {
  if (value < 0.38) return low;
  if (value > 0.62) return high;
  return middle;
}

function criteriaSummaryItems(settings: FictionCastSettings, stylePackLabel: string): string[] {
  return [
    `Style source: ${stylePackLabel}`,
    `Rarity target: ${tierLabel(settings.novelty, 'familiar', 'balanced', 'rarer')}`,
    `Readability target: ${tierLabel(settings.pronounceability, 'loose', 'balanced', 'easy to read')}`,
    `Spelling target: ${tierLabel(settings.orthographicWeirdness, 'plain', 'balanced', 'distinctive')}`,
  ];
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
  onRandomizeSlider,
  onClearLockedNames,
}: ConfigureTrayProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(isOpen);
  const castSize = clampCastSize(settings.castSize);
  const slotRoleCount = Math.max(0, Math.min(castSize, 8));
  const hasRoleMix = (settings.rolePreset ?? 'none') !== 'none';
  const selectedRoleInfluence = roleInfluenceOptions.find((option) => option.value === (settings.roleInfluence ?? 'off'));
  const summarySettings = committedSettings ?? settings;
  const summaryStylePack = stylePacks.find((pack) => pack.id === summarySettings.stylePackId)?.label ?? summarySettings.stylePackId;
  const summaryItems = [summaryStylePack, `${clampCastSize(summarySettings.castSize)} names`, labelForFormat(summarySettings.nameFormat)];
  const criteriaItems = criteriaSummaryItems(summarySettings, summaryStylePack);
  const hasLockedNames = lockedCount > 0;
  const castSizeLabel = `${mode.shortLabel} size`;

  useEffect(() => {
    const wasOpen = wasOpenRef.current;
    if (isOpen && !wasOpen) {
      closeButtonRef.current?.focus();
    } else if (!isOpen && wasOpen) {
      triggerRef.current?.focus();
    }
    wasOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    function closeOnEscape(event: globalThis.KeyboardEvent) {
      if (event.key !== 'Escape') return;
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

          <div className="configure-drawer-summary" aria-label="Criteria summary">
            <p className="eyebrow">Criteria summary</p>
            <p className="section-note">Bounded criteria signals for this cast.</p>
            <ul className="criteria-summary-list">
              {criteriaItems.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>

          <div className="configure-sections">
            <details className="control-section" open>
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
                  <span>Style pack</span>
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
              <summary>Criteria signals</summary>
              <div className="control-section-body">
                <label>
                  <span>Cast variety / rarity spread</span>
                  <select value={settings.rarityDistribution ?? 'style-pack'} onChange={(event) => onUpdateSetting('rarityDistribution', event.target.value as FictionCastRarityDistributionPresetKind)}>
                    {rarityDistributionOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </label>
                {primaryScoreControls.map((control) => (
                  <ScoreControl key={control.key} control={control} value={Number(settings[control.key])} onChange={(key, value) => onUpdateSetting(key, value)} onRandomize={onRandomizeSlider} />
                ))}
                <details className="slot-overrides">
                  <summary>Advanced tuning</summary>
                  <div className="control-section-body">
                    <p className="section-note">These bounded controls shape current criteria signals without introducing free-form text behavior.</p>
                    {advancedScoreControls.map((control) => (
                      <ScoreControl key={control.key} control={control} value={Number(settings[control.key])} onChange={(key, value) => onUpdateSetting(key, value)} onRandomize={onRandomizeSlider} />
                    ))}
                  </div>
                </details>
              </div>
            </details>

            <details className="control-section">
              <summary>Run options</summary>
              <div className="control-section-body">
                <label className="seed-control">
                  <span>Generation seed</span>
                  <input value={settings.seed} onChange={(event) => onUpdateSetting('seed', event.target.value)} onBlur={onCommitSettings} onKeyDown={commitSeedOnEnter} />
                </label>
              </div>
            </details>

            <div className="actions" aria-label="Generation actions">
              <button type="submit">Generate</button>
              <button type="button" className="secondary" onClick={onRandomizeSliders}>Shuffle feel</button>
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
