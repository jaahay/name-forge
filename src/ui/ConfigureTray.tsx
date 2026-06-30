import type { FormEvent, KeyboardEvent } from 'react';
import { rarityDistributionOptions } from '../engine/rarity';
import { castRoleOptions, castRolePresetOptions, roleInfluenceOptions } from '../engine/roles';
import type { CastRole, CastRolePresetKind, GenerationSettings, NameFormatKind, RarityDistributionPresetKind, RoleInfluenceLevel, StylePackSummary } from '../engine/types';
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
  settings: GenerationSettings;
  committedSettings?: GenerationSettings;
  isOpen: boolean;
  lockedCount: number;
  onToggleOpen: () => void;
  onUpdateSetting: <K extends keyof GenerationSettings>(key: K, value: GenerationSettings[K]) => void;
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

function updateSlotRole(currentRoles: GenerationSettings['slotRoleOverrides'], index: number, role: CastRole | ''): GenerationSettings['slotRoleOverrides'] {
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

function labelForRolePreset(value: CastRolePresetKind | undefined): string {
  return castRolePresetOptions.find((option) => option.value === (value ?? 'none'))?.label ?? 'No role mix';
}

export function ConfigureTray({
  mode,
  stylePacks,
  settings,
  committedSettings,
  isOpen,
  lockedCount,
  onToggleOpen,
  onUpdateSetting,
  onGenerate,
  onCommitSettings,
  onRandomizeSliders,
  onRandomizeSlider,
  onClearLockedNames,
}: ConfigureTrayProps) {
  const castSize = clampCastSize(settings.castSize);
  const slotRoleCount = Math.max(0, Math.min(castSize, 8));
  const hasRoleMix = (settings.rolePreset ?? 'none') !== 'none';
  const selectedRoleInfluence = roleInfluenceOptions.find((option) => option.value === (settings.roleInfluence ?? 'off'));
  const summarySettings = committedSettings ?? settings;
  const summaryStylePack = stylePacks.find((pack) => pack.id === summarySettings.stylePackId)?.label ?? summarySettings.stylePackId;
  const summaryItems = [summaryStylePack, `${clampCastSize(summarySettings.castSize)} names`, labelForFormat(summarySettings.nameFormat), labelForRolePreset(summarySettings.rolePreset)];
  const hasLockedNames = lockedCount > 0;
  const castSizeLabel = `${mode.shortLabel} size`;

  function updateCastSize(value: number) {
    onUpdateSetting('castSize', clampCastSize(value));
  }

  function commitSeedOnEnter(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    event.currentTarget.blur();
  }

  return (
    <form className={`controls configure-tray panel ${isOpen ? 'expanded' : 'collapsed'}`} onSubmit={onGenerate}>
      <div className="configure-summary" aria-label="Current generation settings">
        <div className="configure-summary-copy">
          <p className="eyebrow">Configure run</p>
          <strong>{summaryItems.join(' · ')}</strong>
        </div>
        <div className="configure-summary-actions" aria-label="Configure actions">
          <button type="button" className="secondary" onClick={onToggleOpen}>{isOpen ? 'Hide settings' : 'Tune settings'}</button>
          <button type="submit">Regenerate</button>
        </div>
      </div>

      {isOpen ? (
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
            <summary>Feel</summary>
            <div className="control-section-body">
              <label>
                <span>Cast variety</span>
                <select value={settings.rarityDistribution ?? 'style-pack'} onChange={(event) => onUpdateSetting('rarityDistribution', event.target.value as RarityDistributionPresetKind)}>
                  {rarityDistributionOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
              {primaryScoreControls.map((control) => (
                <ScoreControl key={control.key} control={control} value={Number(settings[control.key])} onChange={(key, value) => onUpdateSetting(key, value)} onRandomize={onRandomizeSlider} />
              ))}
              <details className="slot-overrides">
                <summary>Advanced tuning</summary>
                <div className="control-section-body">
                  <p className="section-note">These controls still shape scoring, but they stay secondary to style pack, story role, cast variety, rarity, and readability.</p>
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
      ) : null}
    </form>
  );
}
