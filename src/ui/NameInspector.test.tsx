import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { generateEnsemble } from '../engine/ensemble';
import { createDefaultRegistry } from '../engine/registry';
import type { GeneratedName, GenerationSettings } from '../engine/types';
import { NameInspector } from './NameInspector';
import { formatScore } from './score';

const settings: GenerationSettings = {
  castSize: 1,
  novelty: 0.5,
  pronounceability: 0.7,
  memorability: 0.6,
  culturalAnchoring: 0.65,
  orthographicWeirdness: 0.25,
  stylePackId: 'british-literary-fantasy',
  seed: 'name-inspector-spelling-candidate-test',
  nameFormat: 'given-only',
};

function fixtureName(): GeneratedName {
  const ensemble = generateEnsemble(settings, createDefaultRegistry());
  const [name] = ensemble.names;

  expect(name).toBeDefined();
  if (!name) throw new Error('Expected fixture ensemble to generate a name.');

  return name;
}

describe('NameInspector', () => {
  it('renders retained ranked spelling candidates as a distinct Inspect section', () => {
    const name = fixtureName();
    const [selectedCandidate] = name.spellingCandidates;

    expect(selectedCandidate).toBeDefined();
    if (!selectedCandidate) throw new Error('Expected retained selected spelling candidate.');

    const html = renderToString(<NameInspector name={name} />);

    expect(html).toContain('Spelling candidates');
    expect(html).toContain(`${name.name} ranked spelling candidates`);
    expect(html).toContain(selectedCandidate.text);
    expect(html).toContain(`selected; rank ${selectedCandidate.rank}; score ${formatScore(selectedCandidate.score)}`);
    expect(html).not.toContain(`${name.name} alternate spellings`);
  });
});
