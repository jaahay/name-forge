import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { generateEnsemble } from '../fictionCast/ensemble';
import { toFictionCastNameArtifact } from '../fictionCast/nameArtifact';
import type { FictionCastGeneratedName, FictionCastSettings } from '../fictionCast/types';
import { toNameArtifact } from '../engine/nameArtifact';
import { createDefaultRegistry } from '../engine/registry';
import { browserVoiceDraftSegments, browserVoiceDraftText } from './NameArtifactInspector';
import { NameInspector } from './NameInspector';

const settings: FictionCastSettings = {
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

function fixtureName(overrides: Partial<FictionCastSettings> = {}): FictionCastGeneratedName {
  const ensemble = generateEnsemble({ ...settings, ...overrides }, createDefaultRegistry());
  const [name] = ensemble.names;

  expect(name).toBeDefined();
  if (!name) throw new Error('Expected fixture ensemble to generate a name.');

  return name;
}

function renderInspector(name: FictionCastGeneratedName, isLocked = false): string {
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
  it('keeps the primary inspector focused on the composed display and component-owned sound', () => {
    const name = fixtureName();
    const html = renderInspector(name);

    expect(html).toContain('inspector-primary');
    expect(html).toContain('Sound');
    expect(html).toContain('Display');
    expect(html).toContain('composed identity');
    expect(html).toContain(name.displayName);
    expect(html).toContain('modeled parts');
    expect(html).toContain(name.primaryName.sound.transcription.replace(/^\//, '').replace(/\/$/, ''));
    expect(html).not.toContain('Alternates');

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

  it('shows only modeled generated sound parts with an audition action for each component', () => {
    const name = fixtureName({ nameFormat: 'epithet-place', seed: 'name-inspector-composed-sound' });
    const soundParts = name.identityAudition.parts.filter((part) => part.kind === 'sound');
    const html = renderInspector(name);

    expect(name.identity.format.kind).toBe('epithet-place');
    expect(soundParts).toHaveLength(2);
    expect(html).toContain('modeled parts');
    expect(html).toContain('inspector-sound-components');
    expect(html).not.toContain(name.identityAudition.displayText);
    expect((html.match(/inspector-component-play/g) ?? [])).toHaveLength(soundParts.length);

    for (const part of soundParts) {
      if (part.kind !== 'sound') continue;
      expect(html).toContain(part.value);
      expect(html).toContain(part.displayText);
      expect(html).toContain(`Browser voice draft unavailable for ${part.value}`);
    }
  });

  it('keeps readability notes inside More details', () => {
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

    expect(renderInspector(cleanName)).not.toContain('Read notes</h3>');
    const notedHtml = renderInspector(notedName);
    expect(notedHtml).not.toContain('class="inspector-read-note"');
    expect(notedHtml).toContain('inspector-read-details');
    expect(notedHtml).toContain('Read notes</h3>');
    expect(notedHtml).toContain('Long read');
    expect(notedHtml).toContain('This display name may take a second pass.');
  });

  it('renders selected-name actions with copy utilities visually separated', () => {
    const name = fixtureName();
    const html = renderInspector(name);

    expect(html).toContain('selected-name-actions');
    expect(html).toContain('selected-name-utilities');
    expect(html).toContain(`aria-label="Copy name ${name.displayName}"`);
    expect(html).toContain(`aria-label="Copy details ${name.displayName}"`);
    expect(html).toContain('selected-name-reroll-action');
    expect(html).toContain(`aria-label="Reroll ${name.displayName}"`);
    expect(html).toContain('>Reroll</button>');
    expect(html).toContain(`aria-label="Lock ${name.displayName}"`);
    expect(html).toContain('aria-pressed="false"');
    expect(html).toContain(`aria-label="Browser voice draft unavailable for ${name.displayName}"`);
    expect(html).toContain('Play name');
  });

  it('uses semantic phrase chunks for paced full-identity voice drafts', () => {
    const composed = fixtureName({ nameFormat: 'epithet-place', seed: 'name-inspector-voice-phrase' });
    const artifact = toFictionCastNameArtifact(composed);
    const soundParts = artifact.identityAudition?.parts.filter((part) => part.kind === 'sound') ?? [];
    const segments = browserVoiceDraftSegments(artifact, 'fallback');

    expect(artifact.identityAudition).toBeDefined();
    expect(browserVoiceDraftText(artifact, 'fallback')).toBe(artifact.identityAudition?.speechText);
    expect(soundParts).toHaveLength(2);
    expect(segments).toHaveLength(3);
    expect(segments[0]).toBe(soundParts[0]?.speechText);
    expect(segments[1]).toContain('of');
    expect(segments[2]).toBe(soundParts[1]?.speechText);

    const primitiveArtifact = toNameArtifact(composed.primaryName);
    expect(browserVoiceDraftSegments(primitiveArtifact, 'nah')).toEqual(['nah']);
  });

  it('reflects the locked state and disables selected-name reroll', () => {
    const name = fixtureName();
    const html = renderInspector(name, true);

    expect(html).toContain('selected-name-reroll-action');
    expect(html).toContain(`aria-label="Reroll ${name.displayName}"`);
    expect(html).toContain('disabled=""');
    expect(html).toContain('title="Unlock this name to reroll it."');
    expect(html).toContain('selected-name-lock-action');
    expect(html).toContain(`aria-label="Unlock ${name.displayName}"`);
    expect(html).toContain('aria-pressed="true"');
  });
});
