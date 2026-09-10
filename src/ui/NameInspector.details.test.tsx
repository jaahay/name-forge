import { describe, expect, it } from 'vitest';
import type { FictionCastSettings } from '../fictionCast/types';
import {
  fixtureName,
  nameInspectorSettings,
  normalizeRenderedHtml,
  renderInspector,
} from './nameInspectorTestSupport';

describe('NameInspector details', () => {
  it('replaces raw score cards and audit terminology with understandable shaping context', () => {
    const generatedSettings: FictionCastSettings = {
      ...nameInspectorSettings,
      castSize: 3,
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
    expect(html).toContain('<dt>Naming idiom</dt><dd>British literary fantasy</dd>');
    expect(html).not.toContain('<dt>Naming style</dt>');
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
      ...nameInspectorSettings,
      castSize: 5,
      semanticBaseline: {
        ...nameInspectorSettings.semanticBaseline,
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
      ...nameInspectorSettings,
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
    const generatedSettings = { ...nameInspectorSettings, rolePreset: 'classic-ensemble' as const, roleInfluence: 'light' as const };
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
    expect(html).toContain('materialized format, and derived rarity.');
    expect(html).toContain('Rarity comes from generation-time novelty intent');
    expect(html).toContain('>Details</span>');
    expect(html).not.toContain('>Breakdown</span>');
    expect(html).not.toContain('Component sound drafts');
    expect(html).not.toContain('Criteria evidence');
    expect(html).not.toContain('inspector-promoted');
    expect((html.match(/class="inspector-more"/g) ?? [])).toHaveLength(1);
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
});
