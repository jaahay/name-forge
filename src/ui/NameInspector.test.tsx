import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { generateEnsemble } from '../fictionCast/ensemble';
import type { FictionCastGeneratedName, FictionCastSettings } from '../fictionCast/types';
import { toNameArtifact } from '../engine/nameArtifact';
import { createDefaultRegistry } from '../engine/registry';
import { browserVoiceDraftSegments, browserVoiceDraftText, NameArtifactInspector } from './NameArtifactInspector';
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
  it('keeps the composed Cast identity dominant with a compact pronunciation-adjacent primary row', () => {
    const name = fixtureName({ nameFormat: 'given-family', seed: 'name-inspector-composed-display' });
    const html = renderInspector(name);

    expect(name.displayName).not.toBe(name.primaryName.name);
    expect(html).toContain('data-inspector-presentation="pronunciation-guide"');
    expect(html).toContain('inspector-primary-compact');
    expect(html).toContain('inspector-pronunciation-line');
    expect(html).toContain(name.displayName);
    expect(html).toContain(`aria-label="Pronunciation guide for ${name.displayName}"`);
    expect(html).toContain(`aria-label="Play pronunciation guide for ${name.displayName}"`);
    expect(html).not.toContain('>Sound</h3>');
    expect(html).not.toContain('>Generated spelling</h3>');
    expect(html).not.toContain('>Spelling</h3>');
    expect(html).not.toContain('>Name</h3>');
    expect(html).toContain(name.primaryName.sound.transcription);
  });

  it('promotes Cast context and keeps one calm Breakdown disclosure for secondary evidence', () => {
    const name = fixtureName({ rolePreset: 'classic-ensemble', roleInfluence: 'light' });
    const html = renderInspector(name);
    const detailsIndex = html.indexOf('<details');
    const contextIndex = html.indexOf('Cast context');

    expect(contextIndex).toBeGreaterThan(-1);
    expect(detailsIndex).toBeGreaterThan(contextIndex);
    expect(html).toContain('inspector-cast-context-facts');
    expect(html).toContain('<dt>Role</dt>');
    expect(html).toContain('<dt>Format</dt>');
    expect(html).toContain('<dt>Rarity</dt>');
    expect(html).toContain('<dt>Influence</dt>');
    expect(html).toContain('Breakdown');
    expect(html).not.toContain('More details');
    expect(html).toContain('Generation');
    expect(html).toContain('Composition');
    expect(html).toContain('Component sound drafts');
    expect(html).toContain('Score detail');
    expect((html.match(/<summary/g) ?? [])).toHaveLength(1);
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

  it('keeps composed component provenance and audition controls in Breakdown', () => {
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

  it('keeps primitive readability notes inside Breakdown', () => {
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
    expect(notedHtml).toContain('Breakdown');
    expect(notedHtml).toContain('inspector-read-details');
    expect(notedHtml).toContain('Read notes</h3>');
    expect(notedHtml).toContain('Long read');
    expect(notedHtml).toContain('This generated name may take a second pass.');
  });

  it('uses icon-only whole-name actions with accessible names and tooltip titles', () => {
    const name = fixtureName();
    const html = renderInspector(name);

    expect(html).toContain('selected-name-actions');
    expect(html).toContain('selected-name-utilities');
    expect(html).toContain('inspector-icon-action');
    expect(html).toContain(`aria-label="Play pronunciation guide for ${name.displayName}"`);
    expect(html).toContain(`aria-label="Copy name ${name.displayName}"`);
    expect(html).toContain('title="Copy name"');
    expect(html).toContain(`aria-label="Copy details ${name.displayName}"`);
    expect(html).toContain('title="Copy details"');
    expect(html).toContain(`aria-label="Reroll ${name.displayName}"`);
    expect(html).toContain('title="Reroll name"');
    expect(html).toContain(`aria-label="Lock ${name.displayName}"`);
    expect(html).toContain('title="Lock name"');
    expect(html).toContain('aria-pressed="false"');
    expect(html).not.toContain('>Play name</button>');
    expect(html).not.toContain('>Reroll</button>');
    expect(html).not.toContain('>Lock</button>');
    expect(html).not.toContain('>Copy name</button>');
    expect(html).not.toContain('>Copy details</button>');
  });

  it('keeps shared voice helpers primitive while Fiction Cast owns the whole-identity speech text', () => {
    const composed = fixtureName({ nameFormat: 'epithet-place', seed: 'name-inspector-voice-phrase' });
    const primitiveArtifact = toNameArtifact(composed.primaryName);

    expect(browserVoiceDraftText(primitiveArtifact, 'fallback')).toBe('fallback');
    expect(browserVoiceDraftSegments(primitiveArtifact, 'fallback')).toEqual(['fallback']);
    expect(composed.identityAudition.speechText.length).toBeGreaterThan(0);
    expect(composed.identityAudition.identityText).toBe(composed.displayName);
  });

  it('keeps the shared artifact inspector default presentation unchanged for non-Cast callers', () => {
    const artifact = toNameArtifact(fixtureName().primaryName);
    const html = renderToString(<NameArtifactInspector artifact={artifact} />);

    expect(html).toContain('data-inspector-presentation="default"');
    expect(html).toContain('>Sound</h3>');
    expect(html).toContain('>Spelling</h3>');
    expect(html).toContain('Play name');
    expect(html).not.toContain('inspector-primary-compact');
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
    expect(html).toContain('title="Unlock name"');
    expect(html).toContain('aria-pressed="true"');
  });
});
