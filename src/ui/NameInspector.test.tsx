import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { generateEnsemble } from '../engine/ensemble';
import { createDefaultRegistry } from '../engine/registry';
import type { GeneratedName, GenerationSettings } from '../engine/types';
import { NameInspector, visibleSpellingCandidateLimit } from './NameInspector';
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

type SpellingCandidate = GeneratedName['spellingCandidates'][number];

function fixtureName(): GeneratedName {
  const ensemble = generateEnsemble(settings, createDefaultRegistry());
  const [name] = ensemble.names;

  expect(name).toBeDefined();
  if (!name) throw new Error('Expected fixture ensemble to generate a name.');

  return name;
}

function firstSpellingCandidate(name: GeneratedName): SpellingCandidate {
  const [candidate] = name.spellingCandidates;

  expect(candidate).toBeDefined();
  if (!candidate) throw new Error('Expected retained selected spelling candidate.');

  return candidate;
}

function withSpellingCandidateCount(name: GeneratedName, candidateCount: number): GeneratedName {
  const baseCandidate = firstSpellingCandidate(name);
  const spellingCandidates = Array.from({ length: candidateCount }, (_, index): SpellingCandidate => ({
    ...baseCandidate,
    id: `spelling-candidate:visible-policy-${index + 1}`,
    text: `VisiblePolicy${index + 1}`,
    rank: index + 1,
    score: Math.max(0, baseCandidate.score - index * 0.01),
  }));
  const [selectedSpelling] = spellingCandidates;

  expect(selectedSpelling).toBeDefined();
  if (!selectedSpelling) throw new Error('Expected visible-policy fixture to include a selected spelling.');

  return { ...name, spelling: selectedSpelling, spellingCandidates };
}

function renderInspector(name: GeneratedName, isLocked = false): string {
  return renderToString(
    <NameInspector
      name={name}
      isLocked={isLocked}
      onToggleLockedName={() => undefined}
    />,
  );
}

describe('NameInspector', () => {
  it('renders retained ranked spelling candidates as a distinct Inspect section', () => {
    const name = fixtureName();
    const selectedCandidate = firstSpellingCandidate(name);

    const html = renderInspector(name);

    expect(html).toContain('Spelling candidates');
    expect(html).toContain(`${name.name} ranked spelling candidates`);
    expect(html).toContain(selectedCandidate.text);
    expect(html).toContain(`selected; rank ${selectedCandidate.rank}; score ${formatScore(selectedCandidate.score)}`);
    expect(html).not.toContain(`${name.name} alternate spellings`);
  });

  it('renders selected-name actions in Inspect', () => {
    const name = fixtureName();
    const html = renderInspector(name);

    expect(html).toContain('selected-name-actions');
    expect(html).toContain(`${name.name} selected-name actions`);
    expect(html).toContain(`aria-label="Copy name ${name.name}"`);
    expect(html).toContain(`aria-label="Lock ${name.name}"`);
    expect(html).toContain('aria-pressed="false"');
  });

  it('reflects the locked state in the Inspect lock action', () => {
    const name = fixtureName();
    const html = renderInspector(name, true);

    expect(html).toContain('selected-name-lock-action');
    expect(html).toContain(`aria-label="Unlock ${name.name}"`);
    expect(html).toContain('aria-pressed="true"');
  });

  it('renders only the visible spelling candidate limit with a deterministic overflow note', () => {
    const candidateCount = visibleSpellingCandidateLimit + 2;
    const name = withSpellingCandidateCount(fixtureName(), candidateCount);
    const lastVisibleCandidate = name.spellingCandidates[visibleSpellingCandidateLimit - 1];
    const firstHiddenCandidate = name.spellingCandidates[visibleSpellingCandidateLimit];

    expect(lastVisibleCandidate).toBeDefined();
    if (!lastVisibleCandidate) throw new Error('Expected a final visible spelling candidate.');
    expect(firstHiddenCandidate).toBeDefined();
    if (!firstHiddenCandidate) throw new Error('Expected a hidden spelling candidate beyond the visible limit.');

    const html = renderInspector(name);

    expect(html).toContain(lastVisibleCandidate.text);
    expect(html).not.toContain(firstHiddenCandidate.text);
    expect(html).toContain(`Showing top ${visibleSpellingCandidateLimit} of ${candidateCount} ranked spelling candidates.`);
  });

  it('omits the spelling candidate limit note when all retained candidates are visible', () => {
    const name = withSpellingCandidateCount(fixtureName(), visibleSpellingCandidateLimit);
    const finalCandidate = name.spellingCandidates[visibleSpellingCandidateLimit - 1];

    expect(finalCandidate).toBeDefined();
    if (!finalCandidate) throw new Error('Expected a final retained spelling candidate.');

    const html = renderInspector(name);

    expect(html).toContain(finalCandidate.text);
    expect(html).not.toContain('Showing top');
  });
});
