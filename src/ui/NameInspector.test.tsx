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
): string {
  return renderToString(
    <NameInspector
      name={name}
      baseline={inspectorSettings.semanticBaseline}
      castVariation={inspectorSettings.castVariation ?? 'balanced'}
      stylePackLabel="British literary fantasy"
      isLocked={isLocked}
      onRerollName={() => undefined}
      onToggleLockedName={() => undefined}
    />,
  );
}

function normalizeRenderedHtml(html: string): string {
  return html.replace(/<!-- -->/g, '');
}

describe('NameInspector', () => {
  it('promotes every genuinely generated component and keeps its detail local to the component controls', () => {
    const generatedSettings = { ...settings, nameFormat: 'given-family' as const, seed: 'name-inspector-generated-components' };
    const name = fixtureName(generatedSettings);
    const familyPart = name.identity.parts.find((part) => part.role === 'family' && part.generation);
    const html = renderInspector(name, false, generatedSettings);
    const titleIndex = html.indexOf(name.displayName);
    const componentsIndex = html.indexOf('inspector-generated-components');
    const localDetailIndex = html.indexOf('inspector-generated-component-detail');
    const pronunciationIndex = html.indexOf('inspector-pronunciation');

    expect(familyPart).toBeDefined();
    expect(titleIndex).toBeGreaterThan(-1);
    expect(componentsIndex).toBeGreaterThan(titleIndex);
    expect(localDetailIndex).toBeGreaterThan(componentsIndex);
    expect(pronunciationIndex).toBeGreaterThan(localDetailIndex);
    expect(html).toContain('Generated components');
    expect(html).toContain(`<strong>${name.primaryName.name}</strong>`);
    expect(html).toContain(`<strong>${familyPart?.sourceName}</strong>`);
    expect(html).toContain(`aria-label="Inspect given component ${name.primaryName.name}"`);
    expect(html).toContain(`aria-label="Inspect family component ${familyPart?.sourceName}"`);
    expect(html).toContain(`aria-controls="generated-component-detail-${name.id}"`);
    expect(html).toContain(`id="generated-component-detail-${name.id}"`);
    expect(html).toContain(name.primaryName.sound.transcription);
    expect(html).not.toContain(`<strong>${name.primaryName.name}</strong><span>Given</span>`);
    expect(html).not.toContain('Modeled sound for this generated component; browser playback is approximate.');
  });

  it('keeps the underlying generated given component visible when initials hide its spelling', () => {
    const generatedSettings = { ...settings, nameFormat: 'initials-family' as const, seed: 'name-inspector-initials-components' };
    const name = fixtureName(generatedSettings);
    const primaryIdentityPart = name.identity.parts.find((part) => part.sourceNameId === name.primaryName.id);
    const html = renderInspector(name, false, generatedSettings);

    expect(primaryIdentityPart).toBeDefined();
    expect(primaryIdentityPart?.value).not.toBe(name.primaryName.name);
    expect(html).toContain(`<strong>${name.primaryName.name}</strong>`);
    expect(html).toContain(`id="generated-component-detail-${name.id}"`);
    expect(html).toContain(name.primaryName.sound.transcription);
  });

  it('keeps the composed Cast identity dominant with a whole-identity sound guide', () => {
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
    expect(html).toContain(`aria-label="Sound guide for ${name.displayName}"`);
    expect(html).not.toContain(`aria-label="Pronunciation guide for ${name.displayName}"`);
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
    expect(html).toContain('inspector-generated-component-detail');
    expect(html).not.toContain('Component sound drafts');
  });

  it('replaces raw score cards and audit terminology with understandable shaping context', () => {
    const generatedSettings: FictionCastSettings = {
      ...settings,
      castSize: 3,
      semanticBaseline: {
        ...settings.semanticBaseline,
        styleAnchoring: 'faithful',
      },
      castVariation: 'wide',
      rolePreset: 'classic-ensemble',
      roleInfluence: 'light',
    };
    const name = fixtureName(generatedSettings);
    const html = normalizeRenderedHtml(renderInspector(name, false, generatedSettings));

    expect(html).toContain('What shaped this name');
    expect(html).toContain('Requested baseline');
    expect(html).toContain('Contextual shaping');
    expect(html).toContain('This keeps your requested baseline separate from generation-time Cast variation and role shaping.');
    expect(html).toContain('<dt>Familiar</dt><dd>Balanced</dd>');
    expect(html).toContain('<dt>Readable</dt><dd>Clear</dd>');
    expect(html).toContain('<dt>Compact</dt><dd>Compact</dd>');
    expect(html).toContain('<dt>Naming style</dt><dd>British literary fantasy</dd>');
    expect(html).toContain('<dt>Spelling</dt><dd>Conventional</dd>');
    expect(html).toContain('<dt>Cast variation</dt><dd>Wide ·');
    expect(html).toContain('<dt>Role shaping</dt>');
    expect(html).not.toContain('Criteria evidence');
    expect(html).not.toContain('Faithful baseline');
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

  it('uses retained generation-time intent evidence instead of re-resolving later settings', () => {
    const generatedSettings: FictionCastSettings = {
      ...settings,
      castSize: 5,
      semanticBaseline: {
        ...settings.semanticBaseline,
        familiarity: 'unusual',
      },
      castVariation: 'wide',
      seed: 'name-inspector-retained-intent',
    };
    const name = fixtureName(generatedSettings);
    const conflictingInspectorSettings: FictionCastSettings = {
      ...generatedSettings,
      semanticBaseline: {
        ...generatedSettings.semanticBaseline,
        familiarity: 'familiar',
      },
      castVariation: 'tight',
    };
    const html = normalizeRenderedHtml(renderInspector(name, false, conflictingInspectorSettings));

    expect(name.resolvedIntentEvidence).toBeDefined();
    expect(name.resolvedIntentEvidence?.baseline.familiarity).toBe('unusual');
    expect(name.resolvedIntentEvidence?.castVariation).toBe('wide');
    expect(html).toContain('<dt>Familiar</dt><dd>Unusual</dd>');
    expect(html).toContain('<dt>Cast variation</dt><dd>Wide ·');
    expect(html).not.toContain('<dt>Familiar</dt><dd>Familiar</dd>');
    expect(html).not.toContain('<dt>Cast variation</dt><dd>Tight ·');
  });

  it('keeps older remembered snapshots honest when per-slot intent evidence is unavailable', () => {
    const generatedSettings: FictionCastSettings = {
      ...settings,
      castVariation: 'wide',
      seed: 'name-inspector-legacy-intent',
    };
    const generated = fixtureName(generatedSettings);
    const { resolvedIntentEvidence: _resolvedIntentEvidence, ...legacySnapshot } = generated;
    const html = normalizeRenderedHtml(renderInspector(legacySnapshot, false, generatedSettings));

    expect(html).toContain('<dt>Cast variation</dt><dd>Wide · Generation-time slot position unavailable for this older snapshot</dd>');
  });

  it('preserves opaque generation mechanics under deeper Technical construction', () => {
    const name = fixtureName();
    const html = renderInspector(name);
    const detailsIndex = html.indexOf('class="inspector-more"');
    const technicalIndex = html.indexOf('class="inspector-technical-construction"');

    expect(detailsIndex).toBeGreaterThan(-1);
    expect(technicalIndex).toBeGreaterThan(detailsIndex);
    expect(html).toContain('Technical construction');
    expect(html).toContain('Generator mechanics for the primary generated component.');
    expect(html).toContain('Primary generation plan');
    expect(html).toContain('<dt>Sound texture</dt>');
    expect(html).toContain('<dt>Stress pattern</dt>');
    expect(html).toContain('<dt>Syllable shape</dt>');
    expect(html).toContain('C = consonant · V = vowel');
    expect(html).toContain(name.primaryName.generationPlan.stressPattern);
    expect(html).toContain(name.primaryName.generationPlan.shape.join(' · '));
  });

  it('moves Cast context below sound and spelling inside one neutral Details disclosure', () => {
    const generatedSettings = { ...settings, rolePreset: 'classic-ensemble' as const, roleInfluence: 'light' as const };
    const name = fixtureName(generatedSettings);
    const html = renderInspector(name, false, generatedSettings);
    const pronunciationIndex = html.indexOf('inspector-pronunciation');
    const detailsIndex = html.indexOf('class="inspector-more"');
    const shapingIndex = html.indexOf('What shaped this name');
    const contextIndex = html.indexOf('Cast context');
    const technicalIndex = html.indexOf('Technical construction');

    expect(pronunciationIndex).toBeGreaterThan(-1);
    expect(detailsIndex).toBeGreaterThan(pronunciationIndex);
    expect(shapingIndex).toBeGreaterThan(detailsIndex);
    expect(contextIndex).toBeGreaterThan(detailsIndex);
    expect(technicalIndex).toBeGreaterThan(detailsIndex);
    expect(html).toContain('inspector-cast-context-facts');
    expect(html).toContain('<dt>Role</dt>');
    expect(html).toContain('<dt>Format</dt>');
    expect(html).toContain('<dt>Rarity</dt>');
    expect(html).not.toContain('<dt>Influence</dt>');
    expect(html).toContain("This records the identity's assigned role, materialized format, and derived rarity.");
    expect(html).toContain('Rarity comes from generation-time novelty intent');
    expect(html).toContain('>Details</span>');
    expect(html).not.toContain('>Breakdown</span>');
    expect(html).not.toContain('Component sound drafts');
    expect(html).not.toContain('Criteria evidence');
    expect(html).not.toContain('inspector-promoted');
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

  it('connects promoted generated components to one adjacent sound-detail region and icon audition', () => {
    const generatedSettings = { ...settings, nameFormat: 'epithet-place' as const, seed: 'name-inspector-composed-provenance' };
    const name = fixtureName(generatedSettings);
    const generatedSoundParts = name.identity.parts.filter((part) => part.generation && (part.role === 'given' || part.role === 'family' || part.role === 'place'));
    const expectedComponentCount = 1 + generatedSoundParts.filter((part) => part.sourceNameId !== name.primaryName.id).length;
    const html = renderInspector(name, false, generatedSettings);

    expect(name.identity.format.kind).toBe('epithet-place');
    expect(html).toContain('Generated components');
    expect(html).toContain('inspector-generated-component-detail');
    expect((html.match(/inspector-generated-component-play/g) ?? [])).toHaveLength(expectedComponentCount);
    expect((html.match(/class="inspector-generated-component-detail"/g) ?? [])).toHaveLength(1);
    expect(html).not.toContain('Component sound drafts');
    expect(html).not.toContain('inspector-sound-components');
    for (const part of name.identity.parts) {
      expect(html).toContain(part.value);
      expect(html).toContain(part.role);
    }
    expect(html).toContain(name.primaryName.sound.transcription);
  });

  it('keeps primitive readability notes inside Details', () => {
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
    expect(notedHtml).toContain('>Details</span>');
    expect(notedHtml).toContain('inspector-read-details');
    expect(notedHtml).toContain('Read notes</h3>');
    expect(notedHtml).toContain('Long read');
    expect(notedHtml).toContain('This generated name may take a second pass.');
  });

  it('uses a single circle treatment for Inspector information controls', () => {
    const html = renderInspector(fixtureName());

    expect(html).toContain('inspector-info-disclosure');
    expect(html).not.toContain('<circle cx="12" cy="12" r="8.5"></circle>');
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