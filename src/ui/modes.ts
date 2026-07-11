import type { GenerationSettings } from '../engine/types';

export type NamingModeId = 'fiction-cast' | 'game-npc';

export interface NamingModePresentation {
  id: NamingModeId;
  label: string;
  shortLabel: string;
  description: string;
  heroTitle: string;
  heroCopy: string;
  outputHeading: string;
  exportHeading: string;
  generateLabel: string;
}

export interface FictionCastModeConfig extends NamingModePresentation {
  id: 'fiction-cast';
  defaultSettings: (stylePackId: string) => GenerationSettings;
}

export const fictionCastMode: FictionCastModeConfig = {
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

export const gameNpcMode: NamingModePresentation = {
  id: 'game-npc',
  label: 'Game NPC',
  shortLabel: 'NPC',
  description: 'Generate one usable NPC name quickly for prep or live play.',
  heroTitle: 'A usable NPC name, without the setup tax.',
  heroCopy: 'Choose a few criteria, generate one inspectable name, and reroll without constructing a fictional cast.',
  outputHeading: 'Current NPC name',
  exportHeading: 'Copy NPC name',
  generateLabel: 'Reroll NPC name',
};

export const namingModes = [fictionCastMode, gameNpcMode] as const;
