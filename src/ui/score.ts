import { withFictionCastSemanticControl, type FictionCastSemanticControlValue } from '../fictionCast/semanticIntent';
import type { FictionCastSettings } from '../fictionCast/types';
import { scoreControls, type ControlKey, type ScoreControlDefinition } from './presentation';

export function formatScore(value: number): string {
  return Math.round(value * 100).toString();
}

export function randomScoreChoice<K extends ControlKey>(control: ScoreControlDefinition<K>): FictionCastSemanticControlValue<K> {
  const index = Math.min(control.choices.length - 1, Math.floor(Math.random() * control.choices.length));
  return control.choices[index]?.value ?? control.choices[0].value;
}

export function randomizeScoreSettings<T extends FictionCastSettings>(settings: T): T {
  return scoreControls.reduce<T>(
    (nextSettings, control) => withFictionCastSemanticControl(nextSettings, control.key, randomScoreChoice(control)),
    settings,
  );
}
