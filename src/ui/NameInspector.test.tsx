import { describe, expect, it } from 'vitest';
import { renderAuditionCue } from '../engine/audition';
import type { FictionCastGeneratedName } from '../fictionCast/types';
import { fixtureName, nameInspectorSettings, renderInspector } from './nameInspectorTestSupport';

describe('NameInspector integration', () => {
  it('keeps the composed Cast identity dominant with a whole-identity sound guide', () => {
    const generatedSettings = { ...nameInspectorSettings, nameFormat: 'given-family' as const, seed: 'name-inspector-composed-display' };
    const name = fixtureName(generatedSettings);
    const html = renderInspector(name, false, generatedSettings);
    const primaryGuide = renderAuditionCue(name.primaryName.sound.sequence).displayText ?? name.primaryName.sound.transcription;

    expect(name.displayName).not.toBe(name.primaryName.name);
    expect(name.identityAudition.displayText).not.toBe(primaryGuide);
    expect(html).toContain('data-inspector-presentation="pronunciation-guide"');
    expect(html).toContain('inspector-primary-compact');
    expect(html).toContain('inspector-pronunciation-line');
    expect(html).toContain(name.displayName);
    expect(html).toContain(`aria-label="Sound guide for ${name.displayName}"`);
    expect(html).not.toContain(`aria-label="Pronunciation guide for ${name.displayName}"`);
    expect(html).toContain(`aria-label="Play approximate browser voice for ${name.displayName}"`);
    expect(html).toContain(`<p class="inspector-sound-description">${name.identityAudition.displayText}</p>`);
    expect(html).not.toContain(`<p class="inspector-sound-description">${primaryGuide}</p>`);
    expect(html).toContain('Browser playback is an approximate voice draft, not canonical pronunciation.');
    expect(html).not.toContain('<h3>Generated component sound</h3>');
  });

  it('removes engine variants from the ordinary Fiction Cast surface without changing the model', () => {
    const name = fixtureName();
    const variantValue = `${name.primaryName.name}-variant-fixture`;
    const withVariant: FictionCastGeneratedName = {
      ...name,
      primaryName: {
        ...name.primaryName,
        variants: [{
          value: variantValue,
          kind: 'generated',
          relationship: 'creative_respelling',
          confidence: 'low',
          source: {
            id: 'variant-fixture-source',
            kind: 'algorithm',
            label: 'Variant fixture',
            detail: 'Test-only variant source.',
          },
          generated: true,
          ruleId: 'variant-fixture-rule',
        }],
      },
    };

    expect(withVariant.primaryName.variants).toHaveLength(1);
    const html = renderInspector(withVariant);
    expect(html).not.toContain('Variants</h3>');
    expect(html).not.toContain(variantValue);
  });

  it('keeps alternative same-sound spellings visible without treating them as variants', () => {
    const name = fixtureName();
    const selected = name.primaryName.spelling;
    const alternative = {
      ...selected,
      text: `${selected.text}e`,
      rank: selected.rank + 1,
      score: selected.score - 0.01,
    };
    const withAlternative: FictionCastGeneratedName = {
      ...name,
      primaryName: {
        ...name.primaryName,
        spellingCandidates: [selected, alternative],
      },
    };

    const html = renderInspector(withAlternative);
    expect(html).toContain('Alternative spellings');
    expect(html).toContain(alternative.text);
    expect(html).not.toContain('Variants</h3>');
  });
});
