import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { renderAuditionCue } from '../engine/audition';
import { generateEnsemble } from '../engine/ensemble';
import { createDefaultRegistry } from '../engine/registry';
import type { GeneratedName, GenerationSettings } from '../engine/types';
import { NameInspector } from './NameInspector';

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
    id: `spelling-candidate:same-sound-${index + 1}`,
    text: `SameSound${index + 1}`,
    rank: index + 1,
    score: Math.max(0, baseCandidate.score - index * 0.01),
  }));
  const [selectedSpelling] = spellingCandidates;

  expect(selectedSpelling).toBeDefined();
  if (!selectedSpelling) throw new Error('Expected same-sound fixture to include a selected spelling.');

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
  it('renders every retained spelling as an option for the same generated sound', () => {
    const name = withSpellingCandidateCount(fixtureName(), 14);
    const finalCandidate = name.spellingCandidates.at(-1);
    const html = renderInspector(name);

    expect(finalCandidate).toBeDefined();
    if (!finalCandidate) throw new Error('Expected a final same-sound spelling.');

    expect(html).toContain('All same-sound spellings');
    expect(html).toContain(`${name.name} same-sound spellings`);
    expect(html).toContain(finalCandidate.text);
    expect(html).toContain('preference rank 14');
    expect(html).not.toContain('Showing top');
    expect(html).not.toContain('score ');
  });

  it('renders selected-name actions in Inspect', () => {
    const name = fixtureName();
    const html = renderInspector(name);

    expect(html).toContain('selected-name-actions');
    expect(html).toContain(`${name.name} selected-name actions`);
    expect(html).toContain(`aria-label="Copy name ${name.name}"`);
    expect(html).toContain(`aria-label="Copy details ${name.name}"`);
    expect(html).toContain(`aria-label="Lock ${name.name}"`);
    expect(html).toContain('aria-pressed="false"');
  });

  it('aligns selected spelling terminology with export terminology', () => {
    const name = fixtureName();
    const html = renderInspector(name);

    expect(html).toContain('Selected spelling');
    expect(html).toContain('Same-sound options');
  });

  it('renders a sound-derived pronunciation guide and browser voice draft state', () => {
    const name = fixtureName();
    const auditionCue = renderAuditionCue(name.sound.sequence);
    const html = renderInspector(name);

    expect(auditionCue.source).toBe('sound-sequence');
    expect(auditionCue.displayText.length).toBeGreaterThan(0);
    expect(auditionCue.displayText).not.toBe(auditionCue.speechText);
    expect(html).toContain('Pronunciation guide');
    expect(html).toContain(auditionCue.displayText);
    expect(html).toContain('Browser voice unavailable');
    expect(html).toContain('Guide is generated from the sound model. Browser voice is an approximation, not a canonical pronunciation.');
    expect(html).toContain(`aria-label="Browser voice draft unavailable for ${name.name}"`);
    expect(html).toContain('Play voice draft');
  });

  it('reflects the locked state in the Inspect lock action', () => {
    const name = fixtureName();
    const html = renderInspector(name, true);

    expect(html).toContain('selected-name-lock-action');
    expect(html).toContain(`aria-label="Unlock ${name.name}"`);
    expect(html).toContain('aria-pressed="true"');
  });
});
