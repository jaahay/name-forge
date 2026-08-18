import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { generateEnsemble } from '../fictionCast/ensemble';
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
  it('renders the composed Cast display above primary singular name evidence', () => {
    const name = fixtureName({ nameFormat: 'given-family', seed: 'name-inspector-composed-display' });
    const html = renderInspector(name);

    expect(name.displayName).not.toBe(name.primaryName.name);
    expect(html).toContain('inspector-primary');
    expect(html).toContain('Sound');
    expect(html).toContain('Generated spelling');
    expect(html).toContain(name.displayName);
    expect(html).toContain(name.primaryName.spelling.text);
    expect(html).toContain(name.primaryName.sound.transcription);
    expect(html).not.toContain('modeled parts</span>');
  });

  it('uses one disclosure for all secondary inspector information', () => {
    const html = renderInspector(fixtureName());

    expect(html).toContain('More details');
    expect(html).toContain('Cast context');
    expect(html).toContain('Composition');
    expect(html).toContain('Component sound drafts');
    expect(html).toContain('Score detail');
    expect((html.match(/<summary/g) ?? [])).toHaveLength(1);

    for (const oldDisclosure of ['<summary>Readability</summary>', '<summary>Other variants</summary>', '<summary>Cast context</summary>', '<summary>Generated shape</summary>', '<summary>Score detail</summary>', '<summary>Name parts</summary>', '<summary>Role cue</summary>']) {
      expect(html).not.toContain(oldDisclosure);
    }
  });

  it('keeps composed component provenance and audition controls in the Cast-owned detail surface', () => {
    const name = fixtureName({ nameFormat: 'epithet-place', seed: 'name-inspector-composed-provenance' });
    const soundParts = name.identityAudition.parts.filter((part) => part.kind === 'sound');
    const html = renderInspector(name);

    expect(name.identity.format.kind).toBe('epithet-place');
    expect(name.identity.parts.length).toBeGreaterThan(1);
    expect(soundParts).toHaveLength(2);
    expect(html).toContain('Composition');
    expect(html).toContain('Component sound drafts');
    expect(html).toContain('inspector-sound-components');
    expect((html.match(/inspector-component-play/g) ?? [])).toHaveLength(soundParts.length);
    for (const part of name.identity.parts) {
      expect(html).toContain(part.value);
      expect(html).toContain(part.role);
    }
    for (const part of soundParts) {
      if (part.kind !== 'sound') continue;
      expect(html).toContain(part.displayText);
      expect(html).toContain(`Browser voice draft unavailable for ${part.value}`);
    }
    expect(html).toContain(name.primaryName.sound.transcription);
  });

  it('keeps primitive readability notes inside More details', () => {
    const cleanName = {
      ...fixtureName(),
      primaryName: { ...fixtureName().primaryName, readabilityDiagnostics: [] },
    };
    const notedName = {
      ...cleanName,
      primaryName: {
        ...cleanName.primaryName,
        readabilityDiagnostics: [{
          id: 'test-read-note',
          scope: 'name' as const,
          severity: 'notice' as const,
          label: 'Long read',
          detail: 'This generated name may take a second pass.',
        }],
      },
    };

    expect(renderInspector(cleanName)).not.toContain('Read notes</h3>');
    const notedHtml = renderInspector(notedName);
    expect(notedHtml).toContain('inspector-read-details');
    expect(notedHtml).toContain('Read notes</h3>');
    expect(notedHtml).toContain('Long read');
    expect(notedHtml).toContain('This generated name may take a second pass.');
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

  it('keeps shared voice helpers primitive while Fiction Cast owns the whole-identity speech text', () => {
    const composed = fixtureName({ nameFormat: 'epithet-place', seed: 'name-inspector-voice-phrase' });
    const primitiveArtifact = toNameArtifact(composed.primaryName);

    expect(browserVoiceDraftText(primitiveArtifact, 'fallback')).toBe('fallback');
    expect(browserVoiceDraftSegments(primitiveArtifact, 'fallback')).toEqual(['fallback']);
    expect(composed.identityAudition.speechText.length).toBeGreaterThan(0);
    expect(composed.identityAudition.identityText).toBe(composed.displayName);
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
