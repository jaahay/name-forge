import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { generateEnsemble } from '../fictionCast/ensemble';
import type { FictionCastGeneratedName, FictionCastSettings } from '../fictionCast/types';
import { renderAuditionCue } from '../engine/audition';
import { toNameArtifact } from '../engine/nameArtifact';
import { createDefaultRegistry } from '../engine/registry';
import { browserVoiceDraftSegments, browserVoiceDraftText, NameArtifactInspector } from './NameArtifactInspector';
import { NameInspector } from './NameInspector';

const settings: FictionCastSettings = {
  castSize: 1,
  semanticBaseline: {
    familiarity: 'balanced',
    readability: 'clear',
    compactness: 'compact',
    styleAnchoring: 'balanced',
    spellingDistinctiveness: 'conventional',
  },
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

function renderInspector(
  name: FictionCastGeneratedName,
  isLocked = false,
  inspectorSettings: FictionCastSettings = settings,
  slotIndex = 0,
): string {
  return renderToString(
    <NameInspector
      name={name}
      settings={inspectorSettings}
      stylePackLabel="British literary fantasy"
      slotIndex={slotIndex}
      isLocked={isLocked}
      onRerollName={() => undefined}
      onToggleLockedName={() => undefined}
    />,
  );
}

describe('NameInspector', () => {
  it('promotes every genuinely generated component directly beneath the composed identity', () => {
    const generatedSettings = { ...settings, nameFormat: 'given-family' as const, seed: 'name-inspector-generated-components' };
    const name = fixtureName(generatedSettings);
    const familyPart = name.identity.parts.find((part) => part.role === 'family' && part.generation);
    const html = renderInspector(name, false, generatedSettings);
    const titleIndex = html.indexOf(name.displayName);
    const componentsIndex = html.indexOf('inspector-generated-components');
    const pronunciationIndex = html.indexOf('inspector-pronunciation');

    expect(familyPart).toBeDefined();
    expect(titleIndex).toBeGreaterThan(-1);
    expect(componentsIndex).toBeGreaterThan(titleIndex);
    expect(pronunciationIndex).toBeGreaterThan(componentsIndex);
    expect(html).toContain('Generated components');
    expect(html).toContain(`<strong>${name.primaryName.name}</strong><span>Given</span>`);
    expect(html).toContain(`<strong>${familyPart?.sourceName}</strong><span>Family</span>`);
    expect(html).toContain(`aria-controls="generated-sound-${name.id}-${name.primaryName.id}"`);
    expect(html).toContain(`aria-label="Play approximate browser voice for ${name.primaryName.name}"`);
  });

  it('keeps the underlying generated given component visible when initials hide its spelling', () => {
    const generatedSettings = { ...settings, nameFormat: 'initials-family' as const, seed: 'name-inspector-initials-components' };
    const name = fixtureName(generatedSettings);
    const primaryIdentityPart = name.identity.parts.find((part) => part.sourceNameId === name.primaryName.id);
    const html = renderInspector(name, false, generatedSettings);

    expect(primaryIdentityPart).toBeDefined();
    expect(primaryIdentityPart?.value).not.toBe(name.primaryName.name);
    expect(html).toContain(`<strong>${name.primaryName.name}</strong><span>Given</span>`);
    expect(html).toContain(`id="generated-sound-${name.id}-${name.primaryName.id}"`);
    expect(html).toContain(name.primaryName.sound.transcription);
  });

  it('keeps the composed Cast identity dominant with a whole-identity pronunciation guide', () => {
    const generatedSettings = { ...settings, nameFormat: 'given-family' as const, seed: 'name-inspector-composed-display' };
    const name = fixtureName(generatedSettings);
    const html = renderInspector(name, false, generatedSettings);
    const primaryGuide = renderAuditionCue(name.primaryName.sound.sequence).displayText ?? name.primaryName.sound.transcription;

    expect(name.displayName).not.toBe(name.primaryName.name);
    expect(name.identityAudition.displayText).not.toBe(primaryGuide);
    expect(html).toContain('data-inspector-presentation="pronunciation-guide"');
    expect(html).toContain('inspector-primary-compact');
    expect(html).toContain('inspector-pronunciation-line');
    expect(html).toContain(name.displayName);
    expect(html).toContain(`aria-label="Pronunciation guide for ${name.displayName}"`);
    expect(html).toContain(`aria-label="Play approximate browser voice for ${name.displayName}"`);
    expect(html).toContain(`<p class="inspector-sound-description">${name.identityAudition.displayText}</p>`);
    expect(html).not.toContain(`<p class="inspector-sound-description">${primaryGuide}</p>`);
    expect(html).toContain('Browser playback is an approximate voice draft, not canonical pronunciation.');
    expect(html).not.toContain('<h3>Generated component sound</h3>');
  });

  it('suppresses primary spelling alternates when initials hide the source name', () => {
    const generatedSettings = { ...settings, nameFormat: 'initials-family' as const, seed: 'name-inspector-initials-guide' };
    const name = fixtureName(generatedSettings);
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
    const html = renderInspector(withAlternative, false, generatedSettings);

    expect(html).not.toContain('Alternative spellings');
    expect(html).not.toContain(alternative.text);
    expect(html).toContain('Component sound drafts');
  });

  it('replaces raw score cards with criteria-relative evidence', () => {
    const generatedSettings: FictionCastSettings = {
      ...settings,
      castSize: 3,
      castVariation: 'wide',
      rolePreset: 'classic-ensemble',
      roleInfluence: 'light',
    };
    const name = fixtureName(generatedSettings);
    const html = renderInspector(name, false, generatedSettings);

    expect(html).toContain('Criteria evidence');
    expect(html).toContain('This compares your selected intent with deterministic generation evidence.');
    expect(html).toContain('<dt>Familiar</dt>');
    expect(html).toContain('<dt>Readable</dt>');
    expect(html).toContain('<dt>Compact</dt>');
    expect(html).toContain('<dt>Style</dt>');
    expect(html).toContain('<dt>Spelling</dt>');
    expect(html).toContain('<dt>Cast variation</dt>');
    expect(html).toContain('<dt>Role shaping</dt>');
    expect(html).not.toContain('Score detail');
    expect(html).not.toContain('<dt>Pronounce</dt>');
    expect(html).not.toContain('<dt>Memorable</dt>');
    expect(html).not.toContain('<dt>Novel</dt>');
    expect(html).not.toContain('<dt>Anchored</dt>');
    expect(html).not.toContain('<dt>Natural</dt>');
    expect(html).not.toContain('<dt>Style fit</dt>');
    expect(html).not.toContain('<dt>Cast fit</dt>');
    expect(html).not.toContain('<dt>Role fit</dt>');
  });

  it('explains the primary generation plan instead of exposing opaque notation alone', () => {
    const name = fixtureName();
    const html = renderInspector(name);

    expect(html).toContain('Primary generation plan');
    expect(html).toContain('About primary generation plan');
    expect(html).toContain('<dt>Sound texture</dt>');
    expect(html).toContain('<dt>Stress pattern</dt>');
    expect(html).toContain('<dt>Syllable shape</dt>');
    expect(html).toContain('C = consonant · V = vowel');
    expect(html).toContain(name.primaryName.generationPlan.stressPattern);
    expect(html).toContain(name.primaryName.generationPlan.shape.join(' · '));
  });

  it('promotes Cast context and keeps one primary Breakdown disclosure for secondary evidence', () => {
    const generatedSettings = { ...settings, rolePreset: 'classic-ensemble' as const, roleInfluence: 'light' as const };
    const name = fixtureName(generatedSettings);
    const html = renderInspector(name, false, generatedSettings);
    const detailsIndex = html.indexOf('class="inspector-more"');
    const contextIndex = html.indexOf('Cast context');

    expect(contextIndex).toBeGreaterThan(-1);
    expect(detailsIndex).toBeGreaterThan(contextIndex);
    expect(html).toContain('inspector-cast-context-facts');
    expect(html).toContain('<dt>Role</dt>');
    expect(html).toContain('<dt>Format</dt>');
    expect(html).toContain('<dt>Rarity</dt>');
    expect(html).toContain('<dt>Influence</dt>');
    expect(html).toContain('Rarity is derived from resolved novelty intent');
    expect(html).toContain('Breakdown');
    expect(html).not.toContain('More details');
    expect(html).toContain('Primary generation plan');
    expect(html).toContain('Composition');
    expect(html).toContain('Component sound drafts');
    expect(html).toContain('Criteria evidence');
    expect((html.match(/class="inspector-more"/g) ?? [])).toHaveLength(1);
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

  it('connects promoted generated components to per-component sound evidence and icon audition', () => {
    const generatedSettings = { ...settings, nameFormat: 'epithet-place' as const, seed: 'name-inspector-composed-provenance' };
    const name = fixtureName(generatedSettings);
    const generatedSoundParts = name.identity.parts.filter((part) => part.generation && (part.role === 'given' || part.role === 'family' || part.role === 'place'));
    const expectedComponentCount = 1 + generatedSoundParts.filter((part) => part.sourceNameId !== name.primaryName.id).length;
    const html = renderInspector(name, false, generatedSettings);

    expect(name.identity.format.kind).toBe('epithet-place');
    expect(html).toContain('Generated components');
    expect(html).toContain('Component sound drafts');
    expect(html).toContain('inspector-sound-components');
    expect((html.match(/inspector-generated-component-play/g) ?? [])).toHaveLength(expectedComponentCount);
    expect((html.match(/class="inspector-component-play"/g) ?? [])).toHaveLength(expectedComponentCount);
    for (const part of name.identity.parts) {
      expect(html).toContain(part.value);
      expect(html).toContain(part.role);
    }
    expect(html).toContain(name.primaryName.sound.transcription);
  });

  it('keeps primitive readability notes inside Breakdown', () => {
    const base = fixtureName();
    const cleanName = {
      ...base,
      primaryName: { ...base.primaryName, readabilityDiagnostics: [] },
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
    expect(html).toContain(`aria-label="Play approximate browser voice for ${name.displayName}"`);
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
