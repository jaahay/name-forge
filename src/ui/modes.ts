import type { GenerationSettings } from '../engine/types';

export type NamingModeId = 'fiction-cast';

export interface NamingModeConfig {
  id: NamingModeId;
  label: string;
  shortLabel: string;
  description: string;
  heroTitle: string;
  heroCopy: string;
  outputHeading: string;
  exportHeading: string;
  generateLabel: string;
  defaultSettings: (stylePackId: string) => GenerationSettings;
}

export const fictionCastMode: NamingModeConfig = {
  id: 'fiction-cast',
  label: 'Fiction cast',
  shortLabel: 'Cast',
  description: 'Build a coherent-but-distinct ensemble of fictional character names.',
  heroTitle: 'Names that are random, usable, and cast-aware.',
  heroCopy: 'Generate a balanced ensemble by shaping name silhouettes first, scoring overall fit, suggesting spelling variants, and preserving source traces for every result.',
  outputHeading: 'Ensemble balance',
  exportHeading: 'Export cast',
  generateLabel: 'Generate cast',
  defaultSettings: (stylePackId) => ({
    castSize: 8,
    novelty: 0.48,
    pronounceability: 0.72,
    memorability: 0.65,
    culturalAnchoring: 0.62,
    orthographicWeirdness: 0.28,
    stylePackId,
    seed: 'name-forge-001',
    nameFormat: 'mixed',
    rarityDistribution: 'style-pack',
    rolePreset: 'none',
    roleInfluence: 'off',
    slotRoleOverrides: {},
  }),
};

export const namingModes = [fictionCastMode] as const;
