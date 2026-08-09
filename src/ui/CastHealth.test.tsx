import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { generateEnsemble } from '../engine/ensemble';
import { createDefaultRegistry } from '../engine/registry';
import type { GenerationSettings } from '../engine/types';
import { CastHealthPanel } from './CastHealth';

const settings: GenerationSettings = {
  castSize: 3,
  novelty: 0.5,
  pronounceability: 0.7,
  memorability: 0.6,
  culturalAnchoring: 0.65,
  orthographicWeirdness: 0.25,
  stylePackId: 'british-literary-fantasy',
  seed: 'cast-review-test',
  nameFormat: 'given-only',
};

describe('CastHealthPanel', () => {
  it('collapses diagnostics into Cast review and omits healthy prose checks', () => {
    const generated = generateEnsemble(settings, createDefaultRegistry());
    const ensemble = {
      ...generated,
      diagnostics: {
        ...generated.diagnostics,
        repeatedEndings: 1,
        repeatedCadences: 0,
        readabilityIssues: 0,
        readabilityWarnings: 0,
        readabilitySummary: 'No read notes.',
      },
    };

    const html = renderToStaticMarkup(
      <CastHealthPanel ensemble={ensemble} lockedNameIds={new Set()} onSelectName={() => {}} />,
    );

    expect(html).toContain('<details class="cast-review"');
    expect(html).toContain('Cast review');
    expect(html).toContain('Repeated endings');
    expect(html).not.toContain('Distinct endings');
    expect(html).not.toContain('No locks yet');
    expect(html).not.toContain('Read notes clear');
  });
});
