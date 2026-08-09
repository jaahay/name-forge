import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { generateEnsemble } from '../engine/ensemble';
import { toNameArtifact } from '../engine/nameArtifact';
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

function fixtureName(overrides: Partial<GenerationSettings> = {}): GeneratedName {
  const ensemble = generateEnsemble({ ...settings, ...overrides }, createDefaultRegistry());
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
  it('keeps the primary inspector focused on sound and spelling', () => {
    const name = withSpellingCandidateCount(fixtureName(), 4);
    const html = renderInspector(name);

    expect(html).toContain('inspector-primary');
    expect(html).toContain('Sound');
    expect(html).toContain('Spelling');
    expect(html).toContain('SameSound2');
    expect(html).toContain('SameSound4');
    expect(html).toContain('Alternates');

    for (const removed of ['Other spellings (', 'Pronunciation guide', 'Playback', 'Technical sound structure', 'Preference rank', 'Supported spellings', 'Next option', 'Spelling display cap']) {
      expect(html).not.toContain(removed);
    }
  });

  it('uses one disclosure for all secondary inspector information', () => {
    const html = renderInspector(fixtureName());

    expect(html).toContain('More details');
    expect(html).toContain('Cast context');
    expect(html).toContain('Composition');
    expect(html).toContain('Score detail');
    expect((html.match(/<summary/g) ?? [])).toHaveLength(1);

    for (const oldDisclosure of ['<summary>Readability</summary>', '<summary>Other variants</summary>', '<summary>Cast context</summary>', '<summary>Generated shape</summary>', '<summary>Score detail</summary>', '<summary>Name parts</summary>', '<summary>Role cue</summary>']) {
      expect(html).not.toContain(oldDisclosure);
    }
  });

  it('shows whole-name sound and every modeled generated sound part for composed identities', () => {
    const name = fixtureName({ nameFormat: 'epithet-place', seed: 'name-inspector-composed-sound' });
    const soundParts = name.identityAudition?.parts.filter((part) => part.kind === 'sound') ?? [];
    const html = renderInspector(name);

    expect(name.identity?.format.kind).toBe('epithet-place');
    expect(name.identityAudition).toBeDefined();
    expect(soundParts).toHaveLength(2);
    expect(html).toContain('whole name');
    expect(html).toContain(name.identityAudition?.displayText ?? 'missing audition display');

    for (const part of soundParts) {
      if (part.kind !== 'sound') continue;
      expect(html).toContain(part.value);
      expect(html).toContain(part.transcription);
    }
  });

  it('surfaces readability only when there is an actual note', () => {
    const cleanName = { ...fixtureName(), readabilityDiagnostics: [] };
    const notedName = {
      ...cleanName,
      readabilityDiagnostics: [{
        id: 'test-read-note',
        scope: 'name' as const,
        severity: 'notice' as const,
        label: 'Long read',
        detail: 'This display name may take a second pass.',
      }],
    };

    expect(renderInspector(cleanName)).not.toContain('inspector-read-note');
    const notedHtml = renderInspector(notedName);
    expect(notedHtml).toContain('inspector-read-note');
    expect(notedHtml).toContain('Long read');
    expect(notedHtml).toContain('This display name may take a second pass.');
  });

  it('renders selected-name actions with copy utilities visually separated', () => {
    const name = fixtureName();
    const html = renderInspector(name);

    expect(html).toContain('selected-name-actions');
    expect(html).toContain('selected-name-utilities');
    expect(html).toContain(`aria-label="Copy name ${name.name}"`);
    expect(html).toContain(`aria-label="Copy details ${name.name}"`);
    expect(html).toContain('selected-name-reroll-action');
    expect(html).toContain(`aria-label="Reroll ${name.name}"`);
    expect(html).toContain('>Reroll</button>');
    expect(html).toContain(`aria-label="Lock ${name.name}"`);
    expect(html).toContain('aria-pressed="false"');
    expect(html).toContain(`aria-label="Browser voice draft unavailable for ${name.name}"`);
    expect(html).toContain('Play name');
  });

  it('uses the persisted phrase audition for full identity voice drafts', () => {
    const composed = fixtureName({ nameFormat: 'given-family', seed: 'name-inspector-voice-phrase' });
    const artifact = toNameArtifact(composed);

    expect(artifact.identityAudition).toBeDefined();
    expect(browserVoiceDraftText(artifact, 'fallback')).toBe(artifact.identityAudition?.speechText);
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
