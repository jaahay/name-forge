import { describe, expect, it } from 'vitest';
import { fictionCastBaselineGenerationSettings, fictionCastSemanticBaselineFromSettings, withFictionCastSemanticControl } from '../fictionCast/semanticIntent';
import { fictionCastMode } from './modes';
import { scoreControls } from './presentation';
import { randomizeScoreSettings } from './score';

describe('semantic Fiction Cast criteria', () => {
  it('defines three clear stable choices for each scalar criterion', () => {
    expect(scoreControls.map((control) => ({
      label: control.label,
      choices: control.choices.map((choice) => choice.label),
    }))).toEqual([
      { label: 'Familiar', choices: ['Unusual', 'Balanced', 'Familiar'] },
      { label: 'Readable', choices: ['Tricky', 'Balanced', 'Clear'] },
      { label: 'Compact', choices: ['Extended', 'Balanced', 'Compact'] },
      { label: 'Style', choices: ['Loose', 'Balanced', 'Faithful'] },
      { label: 'Spelling', choices: ['Conventional', 'Balanced', 'Distinctive'] },
    ]);

    for (const control of scoreControls) {
      expect(control.choices).toHaveLength(3);
      expect(new Set(control.choices.map((choice) => choice.value)).size).toBe(3);
    }
  });

  it('keeps Familiar as product intent while preserving the current inverse novelty mapping', () => {
    const defaults = fictionCastMode.defaultSettings('test-style');
    const unusual = withFictionCastSemanticControl(defaults, 'familiarity', 'unusual');
    const familiar = withFictionCastSemanticControl(defaults, 'familiarity', 'familiar');

    expect(unusual.semanticBaseline.familiarity).toBe('unusual');
    expect(familiar.semanticBaseline.familiarity).toBe('familiar');
    expect(fictionCastBaselineGenerationSettings(familiar).novelty).toBeLessThan(fictionCastBaselineGenerationSettings(unusual).novelty);
  });

  it('uses exact semantic values for every current default', () => {
    const defaults = fictionCastMode.defaultSettings('test-style');
    const baseline = fictionCastSemanticBaselineFromSettings(defaults);

    for (const control of scoreControls) {
      const supportedValues = control.choices.map((choice) => choice.value);
      expect(supportedValues).toContain(baseline[control.key]);
    }
  });

  it('keeps the cast-level shuffle on supported semantic values', () => {
    const defaults = fictionCastMode.defaultSettings('test-style');
    const randomized = randomizeScoreSettings(defaults);
    const baseline = fictionCastSemanticBaselineFromSettings(randomized);

    for (const control of scoreControls) {
      const supportedValues = control.choices.map((choice) => choice.value);
      expect(supportedValues).toContain(baseline[control.key]);
    }
  });
});
