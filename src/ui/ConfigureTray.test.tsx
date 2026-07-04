import { describe, expect, it } from 'vitest';
import { criteriaSummaryItems } from './configureCriteria';
import { fictionCastMode } from './modes';
import { advancedScoreControls, primaryScoreControls } from './presentation';

const settings = fictionCastMode.defaultSettings('british-literary-fantasy');

const existingGenerationControlCopy = [
  'Cast size',
  'Style pack',
  'Name format',
  'Generation seed',
  'Generate',
  'Shuffle feel',
];

describe('Configure criteria surface copy', () => {
  it('keeps existing generation controls represented in Configure copy', () => {
    expect(existingGenerationControlCopy).toContain('Cast size');
    expect(existingGenerationControlCopy).toContain('Style pack');
    expect(existingGenerationControlCopy).toContain('Name format');
    expect(existingGenerationControlCopy).toContain('Generation seed');
    expect(existingGenerationControlCopy).toContain('Generate');
    expect(existingGenerationControlCopy).toContain('Shuffle feel');
  });

  it('summarizes bounded criteria signals from current settings', () => {
    expect(criteriaSummaryItems({
      ...settings,
      novelty: 0.72,
      pronounceability: 0.74,
      orthographicWeirdness: 0.24,
    }, 'British Literary Fantasy')).toEqual([
      'Style source: British Literary Fantasy',
      'Rarity target: rarer',
      'Readability target: easy to read',
      'Spelling target: plain',
    ]);
  });

  it('keeps criteria labels bounded to current controls', () => {
    expect(primaryScoreControls.map((control) => control.label)).toEqual([
      'Rarity target',
      'Readability target',
    ]);
    expect(advancedScoreControls.map((control) => control.label)).toContain('Spelling criterion');
  });

  it('does not introduce mode, prompt, or LLM copy in criteria control labels', () => {
    const criteriaSurfaceCopy = [
      ...primaryScoreControls.flatMap((control) => [control.label, control.help]),
      ...advancedScoreControls.flatMap((control) => [control.label, control.help]),
      ...criteriaSummaryItems(settings, 'British Literary Fantasy'),
    ].join(' ');

    expect(criteriaSurfaceCopy).not.toMatch(/prompt/i);
    expect(criteriaSurfaceCopy).not.toMatch(/LLM/i);
    expect(criteriaSurfaceCopy).not.toContain('What are you naming?');
  });
});
