import type { CastRole, CastRoleAssignment, CastRolePresetKind, GenerationSettings } from './types';

export const castRoleLabels: Record<CastRole, string> = {
  protagonist: 'Protagonist',
  rival: 'Rival',
  mentor: 'Mentor',
  sidekick: 'Sidekick',
  guardian: 'Guardian',
  outsider: 'Outsider',
  villain: 'Villain',
  wildcard: 'Wildcard',
};

export const castRoleOptions: Array<{ value: CastRole; label: string }> = Object.entries(castRoleLabels).map(([value, label]) => ({
  value: value as CastRole,
  label,
}));

export const castRolePresetOptions: Array<{ value: CastRolePresetKind; label: string }> = [
  { value: 'none', label: 'No role mix' },
  { value: 'classic-ensemble', label: 'Classic ensemble' },
  { value: 'quest-party', label: 'Quest party' },
  { value: 'court-intrigue', label: 'Court intrigue' },
];

const rolePresetSlots: Record<Exclude<CastRolePresetKind, 'none'>, CastRole[]> = {
  'classic-ensemble': ['protagonist', 'rival', 'mentor', 'sidekick', 'guardian', 'outsider', 'villain', 'wildcard'],
  'quest-party': ['protagonist', 'sidekick', 'mentor', 'guardian', 'outsider', 'rival', 'wildcard', 'villain'],
  'court-intrigue': ['protagonist', 'rival', 'mentor', 'villain', 'outsider', 'guardian', 'sidekick', 'wildcard'],
};

function normalizeRoleToken(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, '-');
}

export function parseCastRole(value: string): CastRole | undefined {
  const normalized = normalizeRoleToken(value);
  return castRoleOptions.some((option) => option.value === normalized) ? normalized as CastRole : undefined;
}

export function parseSlotRoles(value: string): CastRole[] {
  return value
    .split(/[,\n]/)
    .map(parseCastRole)
    .filter((role): role is CastRole => Boolean(role));
}

export function resolveCastRole(settings: GenerationSettings, index: number): CastRoleAssignment | undefined {
  const slotRole = settings.slotRoles?.[index];
  if (slotRole) {
    return { role: slotRole, label: castRoleLabels[slotRole], source: 'slot', slot: index + 1 };
  }

  const preset = settings.rolePreset ?? 'none';
  if (preset === 'none') return undefined;

  const presetSlots = rolePresetSlots[preset];
  const role = presetSlots[index % presetSlots.length];
  return { role, label: castRoleLabels[role], source: 'preset', slot: index + 1 };
}
