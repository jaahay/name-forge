import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { generateEnsemble } from '../engine/ensemble';
import type { NameArtifact } from '../engine/nameArtifact';
import { createDefaultRegistry } from '../engine/registry';
import type { GeneratedName, GenerationSettings } from '../engine/types';
import { browserVoiceDraftText } from './NameArtifactInspector';
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
      onRerollName={() => undefined}
      onToggleLockedName={() => undefined}
    />,
  );
}

describe('NameInspector', () => {
  it('keeps the primary sound and spelling surfaces concise', () => {
    const name = withSpellingCandidateCount(fixtureName(), 4);
    const html = renderInspector(name);

    expect(html).toContain('Sound sketch');
    expect(html).toContain('Selected spelling');
    expect(html).toContain('Other spellings (3)');
    expect(html).toContain('SameSound2');
    expect(html).toContain('SameSound4');

    for (const removed of ['Pronunciation guide', 'Playback', 'Technical sound structure', 'Preference rank', 'Supported spellings', 'Next option', 'Spelling display cap', 'preference rank 2']) {
      expect(html).not.toContain(removed);
    }
  });

  it('renders secondary inspector information as closed disclosures', () => {
    const html = renderInspector(fixtureName());

    for (const summary of ['Readability', 'Cast context', 'Generated shape', 'Score detail', 'Name parts']) {
      expect(html).toContain(`<summary>${summary}</summary>`);
    }
    expect(html).not.toContain('<details open');
  });

  it('renders selected-name actions in Inspect', () => {
    const name = fixtureName();
    const html = renderInspector(name);

    expect(html).toContain('selected-name-actions');
    expect(html).toContain(`${name.name} selected-name actions`);
    expect(html).toContain(`aria-label="Copy name ${name.name}"`);
    expect(html).toContain(`aria-label="Copy details ${name.name}"`);
    expect(html).toContain('selected-name-reroll-action');
    expect(html).toContain(`aria-label="Reroll ${name.name}"`);
    expect(html).toContain('Reroll this name');
    expect(html).toContain(`aria-label="Lock ${name.name}"`);
    expect(html).toContain('aria-pressed="false"');
    expect(html).toContain(`aria-label="Browser voice draft unavailable for ${name.name}"`);
    expect(html).toContain('Play voice draft');
  });

  it('uses the full displayed identity for identity voice drafts', () => {
    const artifact = {
      id: 'identity-voice-test',
      displayText: 'Archivist Na of Westmere',
      identity: {},
    } as unknown as NameArtifact;

    expect(browserVoiceDraftText(artifact, 'na')).toBe('Archivist Na of Westmere');
    expect(browserVoiceDraftText({ id: 'simple', displayText: 'Na' }, 'nah')).toBe('nah');
  });

  it('reflects the locked state and disables selected-name reroll', () => {
    const name = fixtureName();
    const html = renderInspector(name, true);

    expect(html).toContain('selected-name-reroll-action');
    expect(html).toContain(`aria-label="Reroll ${name.name}"`);
    expect(html).toContain('disabled=""');
    expect(html).toContain('title="Unlock this name to reroll it."');
    expect(html).toContain('selected-name-lock-action');
    expect(html).toContain(`aria-label="Unlock ${name.name}"`);
    expect(html).toContain('aria-pressed="true"');
  });
});
