import { describe, expect, it } from 'vitest';
import { fictionCastMode } from './modes';
import { closestScoreChoice, scoreControls } from './presentation';
import { normalizeScoreSettings, randomizeScoreSettings } from './score';

describe('semantic Fiction Cast criteria', () => {
  it('defines three clear stable choices for each scalar criterion', () => {
    expect(scoreControls.map((control) => ({
      label: control.label,
      choices: control.choices.map((choice) => choice.label),
    }))).toEqual([
      { label: 'Familiar', choices: ['Unusual', 'Balanced', 'Familiar'] },
      { label: 'Readable', choices: ['Tricky', 'Balanced', 'Clear'] },
      { label: 'Compact', choices: ['Elaborate', 'Balanced', 'Compact'] },
      { label: 'Style', choices: ['Loose', 'Balanced', 'Faithful'] },
      { label: 'Spelling', choices: ['Conventional', 'Balanced', 'Distinctive'] },
    ]);

    for (const control of scoreControls) {
      expect(control.choices).toHaveLength(3);
      expect(new Set(control.choices.map((choice) => choice.value)).size).toBe(3);
    }
  });

  it('inverts Familiar relative to the underlying novelty value', () => {
    const control = scoreControls.find((candidate) => candidate.key === 'novelty');
    expect(control).toBeDefined();

    const unusual = control?.choices.find((choice) => choice.label === 'Unusual');
    const familiar = control?.choices.find((choice) => choice.label === 'Familiar');

    expect(unusual).toBeDefined();
    expect(familiar).toBeDefined();
    expect(familiar!.value).toBeLessThan(unusual!.value);
  });

  it('preserves every current default as an exact semantic target', () => {
    const defaults = fictionCastMode.defaultSettings('test-style');

    expect(normalizeScoreSettings(defaults)).toEqual(defaults);
    for (const control of scoreControls) {
      const currentValue = Number(defaults[control.key]);
      expect(closestScoreChoice(control, currentValue).value).toBe(currentValue);
    }
  });

  it('normalizes legacy intermediate values to the exact nearest semantic targets', () => {
    const defaults = fictionCastMode.defaultSettings('test-style');
    const normalized = normalizeScoreSettings({
      ...defaults,
      seed: 'legacy-seed',
      novelty: 0.4,
      pronounceability: 0.6,
      memorability: 0.58,
      culturalAnchoring: 0.74,
      orthographicWeirdness: 0.4,
    });

    expect(normalized.novelty).toBe(0.48);
    expect(normalized.pronounceability).toBe(0.55);
    expect(normalized.memorability).toBe(0.65);
    expect(normalized.culturalAnchoring).toBe(0.82);
    expect(normalized.orthographicWeirdness).toBe(0.5);
    expect(normalized.seed).toBe('legacy-seed');

    for (const control of scoreControls) {
      const supportedValues = control.choices.map((choice) => choice.value);
      expect(supportedValues).toContain(Number(normalized[control.key]));
    }
  });

  it('keeps the cast-level shuffle on supported semantic values', () => {
    const defaults = fictionCastMode.defaultSettings('test-style');
    const randomized = randomizeScoreSettings(defaults);

    for (const control of scoreControls) {
      const supportedValues = control.choices.map((choice) => choice.value);
      expect(supportedValues).toContain(Number(randomized[control.key]));
    }
  });
});
