import type { GenerationSettings } from '../engine/types';
import { scoreControls } from './presentation';

export function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export function formatScore(value: number): string {
  return Math.round(value * 100).toString();
}

export function scoreFromPercent(value: string): number {
  return clampScore(Number(value) / 100);
}

export function randomScore(): number {
  return Math.round(Math.random() * 100) / 100;
}

export function randomizeScoreSettings<T extends GenerationSettings>(settings: T): T {
  return scoreControls.reduce<T>((nextSettings, control) => ({
    ...nextSettings,
    [control.key]: randomScore(),
  } as T), settings);
}
