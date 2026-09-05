import type { Ref } from 'react';
import {
  castRoleGuidance,
  castRoleOptions,
  castRolePresetOptions,
  hasAssignedCastRoles,
  resolveCastRole,
  roleInfluenceOptions,
} from '../fictionCast/roles';
import type {
  CastRole,
  CastRolePresetKind,
  FictionCastSettings,
  RoleInfluenceLevel,
} from '../fictionCast/types';

interface FictionCastRolesConfigurationProps {
  settings: FictionCastSettings;
  onUpdateSetting: <K extends keyof FictionCastSettings>(key: K, value: FictionCastSettings[K]) => void;
  onBack: () => void;
  backButtonRef?: Ref<HTMLButtonElement>;
}

function clampCastSize(value: number): number {
  if (Number.isNaN(value)) return 1;
  return Math.max(1, Math.min(24, Math.round(value)));
}

function updateSlotRole(
  currentRoles: FictionCastSettings['slotRoleOverrides'],
  index: number,
  role: CastRole | '',
): FictionCastSettings['slotRoleOverrides'] {
  const nextRoles = { ...(currentRoles ?? {}) };
  if (role === '') {
    delete nextRoles[index];
    return nextRoles;
  }
  nextRoles[index] = role;
  return nextRoles;
}

export function configuredRoleOverrideCount(settings: FictionCastSettings): number {
  const castSize = clampCastSize(settings.castSize);
  return Object.entries(settings.slotRoleOverrides ?? {}).filter(([index, role]) => (
    role !== undefined && Number(index) >= 0 && Number(index) < castSize
  )).length;
}

function rolePresetLabel(preset: CastRolePresetKind): string {
  return castRolePresetOptions.find((option) => option.value === preset)?.label ?? 'Off';
}

function roleInfluenceLabel(level: RoleInfluenceLevel | undefined): string {
  return roleInfluenceOptions.find((option) => option.value === (level ?? 'off'))?.label ?? 'None';
}

export function fictionCastRolesSummary(settings: FictionCastSettings): string {
  const preset = settings.rolePreset ?? 'none';
  if (preset === 'none') return 'Off';

  const overrideCount = configuredRoleOverrideCount(settings);
  if (preset === 'custom') {
    const assignmentSummary = `${overrideCount} assigned`;
    return overrideCount > 0
      ? `Custom · ${assignmentSummary} · ${roleInfluenceLabel(settings.roleInfluence)}`
      : `Custom · ${assignmentSummary}`;
  }

  const parts = [rolePresetLabel(preset), roleInfluenceLabel(settings.roleInfluence)];
  if (overrideCount > 0) parts.push(`${overrideCount} customized`);
  return parts.join(' · ');
}

export function FictionCastRolesConfiguration({
  settings,
  onUpdateSetting,
  onBack,
  backButtonRef,
}: FictionCastRolesConfigurationProps) {
  const castSize = clampCastSize(settings.castSize);
  const preset = settings.rolePreset ?? 'none';
  const isCustom = preset === 'custom';
  const isOff = preset === 'none';
  const hasAssignedRoles = hasAssignedCastRoles(settings);
  const selectedRoleInfluence = roleInfluenceOptions.find((option) => option.value === (settings.roleInfluence ?? 'off'));

  return (
    <div className="roles-configuration" aria-label="Roles configuration">
      <button
        ref={backButtonRef}
        type="button"
        className="secondary roles-back-button"
        onClick={onBack}
      >
        ← Back to criteria
      </button>

      <section className="roles-configuration-section" aria-labelledby="roles-assignment-title">
        <div className="roles-section-heading">
          <div>
            <p className="eyebrow">Assignment</p>
            <h3 id="roles-assignment-title">Role assignment</h3>
          </div>
        </div>
        <label>
          <span>Role assignment</span>
          <select
            value={preset}
            onChange={(event) => onUpdateSetting('rolePreset', event.target.value as CastRolePresetKind)}
          >
            {castRolePresetOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <p className="section-note">
          Off leaves every cast member unassigned. Presets provide role defaults; Custom assigns only the members you choose.
        </p>
      </section>

      {!isOff ? (
        <section className="roles-configuration-section" aria-labelledby="roles-influence-title">
          <div className="roles-section-heading">
            <div>
              <p className="eyebrow">Shaping</p>
              <h3 id="roles-influence-title">Generation influence</h3>
            </div>
          </div>
          {hasAssignedRoles ? (
            <label>
              <span>Generation influence</span>
              <select
                value={settings.roleInfluence ?? 'off'}
                onChange={(event) => onUpdateSetting('roleInfluence', event.target.value as RoleInfluenceLevel)}
              >
                {roleInfluenceOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
              <small>{selectedRoleInfluence?.help}</small>
            </label>
          ) : (
            <p className="roles-empty-note">Assign at least one cast member before choosing generation influence.</p>
          )}
        </section>
      ) : null}

      {!isOff ? (
        <section className="roles-configuration-section" aria-labelledby="roles-members-title">
          <div className="roles-section-heading">
            <div>
              <p className="eyebrow">Cast members</p>
              <h3 id="roles-members-title">Slot assignments</h3>
            </div>
            <span>{castSize} {castSize === 1 ? 'member' : 'members'}</span>
          </div>
          <p className="section-note">
            {isCustom
              ? 'Unassigned members have no role. Choose only the members you want to contextualize or shape.'
              : 'Choose a role to customize a member. Use role mix restores that member to the selected preset.'}
          </p>
          <div className="roles-slot-list" role="group" aria-label="Role assignments by cast member">
            {Array.from({ length: castSize }, (_, index) => {
              const override = settings.slotRoleOverrides?.[index] ?? '';
              const inheritedRole = isCustom
                ? undefined
                : resolveCastRole({ ...settings, slotRoleOverrides: undefined }, index);
              const defaultLabel = isCustom
                ? 'Unassigned'
                : `Use role mix — ${inheritedRole?.label ?? 'Unassigned'}`;

              return (
                <label key={`role-slot-${index + 1}`} className="roles-slot-row">
                  <span>Slot {index + 1}</span>
                  <select
                    aria-label={`Role for slot ${index + 1}`}
                    value={override}
                    onChange={(event) => onUpdateSetting(
                      'slotRoleOverrides',
                      updateSlotRole(settings.slotRoleOverrides, index, event.target.value as CastRole | ''),
                    )}
                  >
                    <option value="">{defaultLabel}</option>
                    {castRoleOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </label>
              );
            })}
          </div>
        </section>
      ) : null}

      <details className="roles-guide">
        <summary>Role guide</summary>
        <div className="roles-guide-body">
          <p className="section-note">
            These are creative naming directions for generated characters, not claims about how real people or story roles inherently sound.
          </p>
          <div className="roles-guide-list">
            {castRoleGuidance.map((guidance) => (
              <section key={guidance.role} className="roles-guide-item" aria-labelledby={`role-guide-${guidance.role}`}>
                <h4 id={`role-guide-${guidance.role}`}>{guidance.label}</h4>
                <p>{guidance.storyMeaning}</p>
                <p><strong>Naming direction:</strong> {guidance.namingDirection}</p>
              </section>
            ))}
          </div>
        </div>
      </details>
    </div>
  );
}
