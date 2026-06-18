import type {
  CastRole,
  CastRoleAssignment,
  CastRolePresetKind,
  GenerationSettings,
  NameTexture,
  RoleInfluenceLevel,
  RoleInfluenceMetadata,
  WeightedValue,
} from './types';
import { clamp } from './random';

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

export const roleInfluenceOptions: Array<{ value: RoleInfluenceLevel; label: string; help: string }> = [
  { value: 'off', label: 'Off', help: 'Roles label cast slots only; generation and scoring stay role-neutral.' },
  { value: 'light', label: 'Light', help: 'Roles add small silhouette and scoring nudges while preserving slider intent.' },
  { value: 'strong', label: 'Strong', help: 'Roles more visibly shape silhouette, phonotactics, and score preference.' },
];

export interface CastRolePreferenceProfile {
  id: string;
  role: CastRole;
  label: string;
  effects: string[];
  settingShifts: Partial<Pick<GenerationSettings, 'novelty' | 'pronounceability' | 'memorability' | 'culturalAnchoring' | 'orthographicWeirdness'>>;
  syllableCounts: Array<WeightedValue<number>>;
  textures: Array<WeightedValue<NameTexture>>;
  targetLengths: Array<WeightedValue<'short' | 'medium' | 'long'>>;
  rhythms: Array<WeightedValue<string>>;
}

const rolePresetSlots: Record<Exclude<CastRolePresetKind, 'none'>, CastRole[]> = {
  'classic-ensemble': ['protagonist', 'rival', 'mentor', 'sidekick', 'guardian', 'outsider', 'villain', 'wildcard'],
  'quest-party': ['protagonist', 'sidekick', 'mentor', 'guardian', 'outsider', 'rival', 'wildcard', 'villain'],
  'court-intrigue': ['protagonist', 'rival', 'mentor', 'villain', 'outsider', 'guardian', 'sidekick', 'wildcard'],
};

const rolePreferenceProfiles: Record<CastRole, CastRolePreferenceProfile> = {
  protagonist: {
    id: 'role-profile:protagonist',
    role: 'protagonist',
    label: 'Protagonist clarity',
    effects: ['slightly memorable', 'balanced texture', 'clear medium length'],
    settingShifts: { memorability: 0.08, culturalAnchoring: 0.03, orthographicWeirdness: -0.02 },
    syllableCounts: [{ value: 2, weight: 2.2 }, { value: 3, weight: 2.8 }, { value: 4, weight: 0.7 }],
    textures: [{ value: 'balanced', weight: 2.4 }, { value: 'soft', weight: 1.4 }, { value: 'liquid', weight: 1.1 }],
    targetLengths: [{ value: 'short', weight: 1.1 }, { value: 'medium', weight: 2.6 }, { value: 'long', weight: 0.8 }],
    rhythms: [{ value: 'balanced', weight: 2.3 }, { value: 'falling', weight: 1.5 }, { value: 'rising', weight: 1 }],
  },
  rival: {
    id: 'role-profile:rival',
    role: 'rival',
    label: 'Rival edge',
    effects: ['harder texture', 'sharper novelty', 'compact pressure'],
    settingShifts: { novelty: 0.08, memorability: 0.04, orthographicWeirdness: 0.04 },
    syllableCounts: [{ value: 1, weight: 1.1 }, { value: 2, weight: 2.7 }, { value: 3, weight: 1.5 }],
    textures: [{ value: 'hard', weight: 2.8 }, { value: 'balanced', weight: 1.4 }, { value: 'liquid', weight: 0.7 }],
    targetLengths: [{ value: 'short', weight: 2.1 }, { value: 'medium', weight: 1.7 }, { value: 'long', weight: 0.5 }],
    rhythms: [{ value: 'falling', weight: 1.9 }, { value: 'balanced', weight: 1.4 }, { value: 'rising', weight: 1.2 }],
  },
  mentor: {
    id: 'role-profile:mentor',
    role: 'mentor',
    label: 'Mentor gravitas',
    effects: ['more anchored', 'slightly longer', 'liquid or balanced texture'],
    settingShifts: { novelty: -0.04, pronounceability: 0.03, culturalAnchoring: 0.09, orthographicWeirdness: -0.03 },
    syllableCounts: [{ value: 2, weight: 1 }, { value: 3, weight: 2.2 }, { value: 4, weight: 1.8 }],
    textures: [{ value: 'liquid', weight: 2.1 }, { value: 'balanced', weight: 1.9 }, { value: 'soft', weight: 1.2 }],
    targetLengths: [{ value: 'short', weight: 0.5 }, { value: 'medium', weight: 1.8 }, { value: 'long', weight: 2.1 }],
    rhythms: [{ value: 'falling', weight: 2.2 }, { value: 'braided', weight: 1.3 }, { value: 'balanced', weight: 1.1 }],
  },
  sidekick: {
    id: 'role-profile:sidekick',
    role: 'sidekick',
    label: 'Sidekick warmth',
    effects: ['shorter', 'pronounceable', 'soft memorable texture'],
    settingShifts: { novelty: -0.02, pronounceability: 0.06, memorability: 0.1, orthographicWeirdness: -0.05 },
    syllableCounts: [{ value: 1, weight: 1.4 }, { value: 2, weight: 3 }, { value: 3, weight: 1.1 }],
    textures: [{ value: 'soft', weight: 2.5 }, { value: 'liquid', weight: 1.6 }, { value: 'balanced', weight: 1.2 }],
    targetLengths: [{ value: 'short', weight: 2.8 }, { value: 'medium', weight: 1.2 }, { value: 'long', weight: 0.3 }],
    rhythms: [{ value: 'rising', weight: 1.9 }, { value: 'balanced', weight: 1.7 }, { value: 'falling', weight: 0.9 }],
  },
  guardian: {
    id: 'role-profile:guardian',
    role: 'guardian',
    label: 'Guardian solidity',
    effects: ['grounded', 'stable cadence', 'hard or balanced texture'],
    settingShifts: { pronounceability: 0.02, culturalAnchoring: 0.05, memorability: 0.03 },
    syllableCounts: [{ value: 2, weight: 1.8 }, { value: 3, weight: 2.2 }, { value: 4, weight: 1.1 }],
    textures: [{ value: 'hard', weight: 2 }, { value: 'balanced', weight: 2 }, { value: 'liquid', weight: 0.8 }],
    targetLengths: [{ value: 'short', weight: 0.7 }, { value: 'medium', weight: 2.2 }, { value: 'long', weight: 1.4 }],
    rhythms: [{ value: 'balanced', weight: 2.3 }, { value: 'falling', weight: 1.6 }, { value: 'braided', weight: 0.8 }],
  },
  outsider: {
    id: 'role-profile:outsider',
    role: 'outsider',
    label: 'Outsider strangeness',
    effects: ['more novel', 'less anchored', 'unusual texture'],
    settingShifts: { novelty: 0.12, culturalAnchoring: -0.02, orthographicWeirdness: 0.08, pronounceability: -0.02 },
    syllableCounts: [{ value: 2, weight: 1 }, { value: 3, weight: 2.1 }, { value: 4, weight: 1.7 }],
    textures: [{ value: 'liquid', weight: 2 }, { value: 'hard', weight: 1.8 }, { value: 'balanced', weight: 0.8 }],
    targetLengths: [{ value: 'short', weight: 0.7 }, { value: 'medium', weight: 1.7 }, { value: 'long', weight: 1.9 }],
    rhythms: [{ value: 'braided', weight: 1.9 }, { value: 'rising', weight: 1.5 }, { value: 'falling', weight: 1.1 }],
  },
  villain: {
    id: 'role-profile:villain',
    role: 'villain',
    label: 'Villain severity',
    effects: ['harder', 'darker novelty', 'longer or sharper silhouette'],
    settingShifts: { novelty: 0.09, pronounceability: -0.03, culturalAnchoring: 0.03, orthographicWeirdness: 0.07 },
    syllableCounts: [{ value: 2, weight: 1.2 }, { value: 3, weight: 2.1 }, { value: 4, weight: 1.8 }],
    textures: [{ value: 'hard', weight: 3 }, { value: 'balanced', weight: 1 }, { value: 'liquid', weight: 0.6 }],
    targetLengths: [{ value: 'short', weight: 0.6 }, { value: 'medium', weight: 1.7 }, { value: 'long', weight: 2.2 }],
    rhythms: [{ value: 'falling', weight: 2.4 }, { value: 'braided', weight: 1.4 }, { value: 'balanced', weight: 0.9 }],
  },
  wildcard: {
    id: 'role-profile:wildcard',
    role: 'wildcard',
    label: 'Wildcard swing',
    effects: ['slightly novel', 'mixed texture', 'looser cadence'],
    settingShifts: { novelty: 0.05, orthographicWeirdness: 0.03 },
    syllableCounts: [{ value: 1, weight: 1 }, { value: 2, weight: 1.4 }, { value: 3, weight: 1.4 }, { value: 4, weight: 1 }],
    textures: [{ value: 'soft', weight: 1.2 }, { value: 'balanced', weight: 1.2 }, { value: 'hard', weight: 1.2 }, { value: 'liquid', weight: 1.2 }],
    targetLengths: [{ value: 'short', weight: 1.2 }, { value: 'medium', weight: 1.2 }, { value: 'long', weight: 1.2 }],
    rhythms: [{ value: 'balanced', weight: 1.2 }, { value: 'falling', weight: 1.2 }, { value: 'rising', weight: 1.2 }, { value: 'braided', weight: 1.2 }],
  },
};

function normalizeRoleToken(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, '-');
}

function roleInfluenceStrength(level: RoleInfluenceLevel | undefined): number {
  if (level === 'strong') return 1;
  if (level === 'light') return 0.42;
  return 0;
}

export function parseCastRole(value: string): CastRole | undefined {
  const normalized = normalizeRoleToken(value);
  return castRoleOptions.some((option) => option.value === normalized) ? normalized as CastRole : undefined;
}

export function resolveCastRole(settings: GenerationSettings, index: number): CastRoleAssignment | undefined {
  const slotRole = settings.slotRoleOverrides?.[index];
  if (slotRole) {
    return { role: slotRole, label: castRoleLabels[slotRole], source: 'slot', slot: index + 1 };
  }

  const preset = settings.rolePreset ?? 'none';
  if (preset === 'none') return undefined;

  const presetSlots = rolePresetSlots[preset];
  const role = presetSlots[index % presetSlots.length];
  return { role, label: castRoleLabels[role], source: 'preset', slot: index + 1 };
}

export function isRoleInfluenceActive(settings: GenerationSettings): boolean {
  return roleInfluenceStrength(settings.roleInfluence) > 0;
}

export function getRolePreferenceProfile(role: CastRole): CastRolePreferenceProfile {
  return rolePreferenceProfiles[role];
}

export function resolveRoleInfluence(settings: GenerationSettings, role?: CastRoleAssignment): RoleInfluenceMetadata | undefined {
  const strength = roleInfluenceStrength(settings.roleInfluence);
  if (!role || strength === 0) return undefined;
  const profile = getRolePreferenceProfile(role.role);
  return {
    level: settings.roleInfluence === 'strong' ? 'strong' : 'light',
    role: role.role,
    profileId: profile.id,
    label: profile.label,
    strength,
    effects: profile.effects,
  };
}

export function roleInfluencedSettings(settings: GenerationSettings, role?: CastRoleAssignment): GenerationSettings {
  const influence = resolveRoleInfluence(settings, role);
  if (!influence) return settings;
  const profile = getRolePreferenceProfile(influence.role);
  return {
    ...settings,
    novelty: clamp(settings.novelty + (profile.settingShifts.novelty ?? 0) * influence.strength),
    pronounceability: clamp(settings.pronounceability + (profile.settingShifts.pronounceability ?? 0) * influence.strength),
    memorability: clamp(settings.memorability + (profile.settingShifts.memorability ?? 0) * influence.strength),
    culturalAnchoring: clamp(settings.culturalAnchoring + (profile.settingShifts.culturalAnchoring ?? 0) * influence.strength),
    orthographicWeirdness: clamp(settings.orthographicWeirdness + (profile.settingShifts.orthographicWeirdness ?? 0) * influence.strength),
  };
}
