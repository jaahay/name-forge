import type { FictionCastSettings } from '../fictionCast/types';

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
  defaultSettings: (stylePackId: string) => FictionCastSettings;
}

export type NamingModeConfig = FictionCastModeConfig;

export const fictionCastMode: FictionCastModeConfig = {
  id: 'fiction-cast',
  label: 'Fiction cast',
  shortLabel: 'Cast',
  description: 'Build a coherent-but-distinct ensemble of fictional character names.',
  heroTitle: 'Names that are random, usable, and cast-aware.',
  heroCopy: 'Generate a balanced ensemble from explicit name-generation settings, contextual cast scoring, spelling variants, and source evidence for every result.',
  outputHeading: 'Ensemble balance',
  exportHeading: 'Export cast',
  generateLabel: 'Generate cast',
  defaultSettings: (stylePackId) => ({
    castSize: 8,
    semanticBaseline: {
      familiarity: 'balanced',
      readability: 'clear',
      compactness: 'compact',
      styleAnchoring: 'balanced',
      spellingDistinctiveness: 'conventional',
    },
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
  description: 'Generate one inspectable NPC name quickly for prep or live play.',
  heroTitle: 'One generated name, ready to use.',
  heroCopy: 'Generate from a selected source model, inspect the resulting artifact, copy it, or reroll with a fresh seed.',
  outputHeading: 'Current NPC name',
  exportHeading: 'Copy NPC name',
  generateLabel: 'Reroll NPC name',
};

export const namingModes = [fictionCastMode, gameNpcMode] as const;
