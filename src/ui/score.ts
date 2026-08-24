import type { GenerationSettings } from '../engine/types';
import { closestScoreChoice, scoreControls, type ScoreControlDefinition } from './presentation';

export function formatScore(value: number): string {
  return Math.round(value * 100).toString();
}

export function normalizeScoreSettings<T extends GenerationSettings>(settings: T): T {
  return scoreControls.reduce<T>((nextSettings, control) => ({
    ...nextSettings,
    [control.key]: closestScoreChoice(control, Number(nextSettings[control.key])).value,
  } as T), settings);
}

export function randomScoreChoice(control: ScoreControlDefinition): number {
  const index = Math.min(control.choices.length - 1, Math.floor(Math.random() * control.choices.length));
  return control.choices[index]?.value ?? control.choices[0].value;
}

export function randomizeScoreSettings<T extends GenerationSettings>(settings: T): T {
  return scoreControls.reduce<T>((nextSettings, control) => ({
    ...nextSettings,
    [control.key]: randomScoreChoice(control),
  } as T), settings);
}
