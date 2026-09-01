import type { FictionCastSettings } from '../fictionCast/types';
import { withFictionCastSemanticControl } from '../fictionCast/semanticIntent';
import { scoreControls, type ScoreControlDefinition } from './presentation';

export function formatScore(value: number): string {
  return Math.round(value * 100).toString();
}

export function randomScoreChoice(control: ScoreControlDefinition): number {
  const index = Math.min(control.choices.length - 1, Math.floor(Math.random() * control.choices.length));
  return control.choices[index]?.value ?? control.choices[0].value;
}

export function randomizeScoreSettings<T extends FictionCastSettings>(settings: T): T {
  return scoreControls.reduce<T>(
    (nextSettings, control) => withFictionCastSemanticControl(nextSettings, control.key, randomScoreChoice(control)),
    settings,
  );
}
