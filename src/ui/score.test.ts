import { describe, expect, it } from 'vitest';
import { fictionCastMode } from './modes';
import { closestScoreChoice, scoreControls } from './presentation';
import { randomizeScoreSettings } from './score';

describe('semantic Fiction Cast criteria', () => {
  it('defines three stable choices for each scalar criterion', () => {
    expect(scoreControls.map((control) => control.label)).toEqual([
      'Familiar',
      'Readable',
      'Compact',
      'Style',
      'Spelling',
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

    for (const control of scoreControls) {
      const currentValue = Number(defaults[control.key]);
      expect(closestScoreChoice(control, currentValue).value).toBe(currentValue);
    }
  });

  it('maps legacy intermediate values deterministically to the nearest choice', () => {
    const familiarControl = scoreControls.find((control) => control.key === 'novelty');
    expect(familiarControl).toBeDefined();
    expect(closestScoreChoice(familiarControl!, 0.4).label).toBe('Balanced');
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
