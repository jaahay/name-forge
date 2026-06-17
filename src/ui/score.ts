import type { GenerationSettings, NameTexture, RarityBand } from '../engine/types';
import { rarityPresentation, scoreControls } from './presentation';

export function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export function formatScore(value: number): string {
  return Math.round(value * 100).toString();
}

export function scoreBand(value: number): string {
  const score = clampScore(value);
  if (score >= 0.86) return 'Excellent fit';
  if (score >= 0.76) return 'Strong fit';
  if (score >= 0.66) return 'Usable fit';
  if (score >= 0.56) return 'Experimental fit';
  return 'Weak fit';
}

export function scoreFromPercent(value: string): number {
  return clampScore(Number(value) / 100);
}

export function randomScore(): number {
  return Math.round(Math.random() * 100) / 100;
}

export function randomizeScoreSettings(settings: GenerationSettings): GenerationSettings {
  return scoreControls.reduce<GenerationSettings>((nextSettings, control) => ({
    ...nextSettings,
    [control.key]: randomScore(),
  }), settings);
}

export function rarityClassName(rarity: RarityBand): string {
  return `rarity-pill ${rarityPresentation[rarity].className}`;
}

export function textureClassName(texture: NameTexture): string {
  return `texture-${texture}`;
}
