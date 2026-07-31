import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { NameArtifactSoundRelationship } from '../engine/types';
import { SoundRelationshipsPanel } from './SoundRelationshipsPanel';

function renderRelationships(relationships: readonly NameArtifactSoundRelationship[]): string {
  return renderToStaticMarkup(<SoundRelationshipsPanel relationships={relationships} />);
}

describe('SoundRelationshipsPanel', () => {
  it('does not render an empty diagnostics section', () => {
    expect(renderRelationships([])).toBe('');
  });

  it('groups facts by pair while preserving pair and relationship order', () => {
    const relationships: readonly NameArtifactSoundRelationship[] = [
      {
        kind: 'one-segment-edit',
        artifactIds: ['mar', 'mal'],
        displayTexts: ['Mar', 'Mal'],
        details: {
          leftSegments: ['m', 'a', 'r'],
          rightSegments: ['m', 'a', 'l'],
          edit: {
            kind: 'substitution',
            index: 2,
            leftSegment: 'r',
            rightSegment: 'l',
          },
        },
        evidence: 'DO NOT PARSE THIS TEXT',
      },
      {
        kind: 'shared-onset',
        artifactIds: ['mar', 'mal'],
        displayTexts: ['Mar', 'Mal'],
        details: { segments: ['m'] },
        evidence: 'DO NOT PARSE THIS TEXT',
      },
      {
        kind: 'matching-cadence-pattern',
        artifactIds: ['mar', 'mal'],
        displayTexts: ['Mar', 'Mal'],
        details: {
          cadence: 'balanced',
          stressPattern: ['primary'],
        },
        evidence: 'DO NOT PARSE THIS TEXT',
      },
      {
        kind: 'shared-final-syllable',
        artifactIds: ['kali', 'moli'],
        displayTexts: ['Kali', 'Moli'],
        details: { segments: ['l', 'i'] },
        evidence: 'DO NOT PARSE THIS TEXT',
      },
    ];

    const html = renderRelationships(relationships);
    const marPair = 'Mar <span aria-hidden="true">+</span> Mal';
    const kaliPair = 'Kali <span aria-hidden="true">+</span> Moli';

    expect(html).toContain('<section class="sound-relationships"');
    expect(html).toContain('<h3 id="sound-relationships-heading">Sound relationships</h3>');
    expect(html).toContain('2 pairs');
    expect(html.split(marPair)).toHaveLength(2);
    expect(html.split(kaliPair)).toHaveLength(2);
    expect(html.indexOf(marPair)).toBeLessThan(html.indexOf(kaliPair));

    const editIndex = html.indexOf('One sound differs');
    const openingIndex = html.indexOf('Same opening sound');
    const cadenceIndex = html.indexOf('Same rhythm and stress');
    expect(editIndex).toBeGreaterThan(-1);
    expect(editIndex).toBeLessThan(openingIndex);
    expect(openingIndex).toBeLessThan(cadenceIndex);
  });

  it('uses plain-language labels with typed technical detail', () => {
    const relationships: readonly NameArtifactSoundRelationship[] = [
      {
        kind: 'one-segment-edit',
        artifactIds: ['mar', 'mal'],
        displayTexts: ['Mar', 'Mal'],
        details: {
          leftSegments: ['m', 'a', 'r'],
          rightSegments: ['m', 'a', 'l'],
          edit: {
            kind: 'substitution',
            index: 2,
            leftSegment: 'r',
            rightSegment: 'l',
          },
        },
        evidence: 'DO NOT PARSE THIS TEXT',
      },
      {
        kind: 'shared-onset',
        artifactIds: ['mar', 'mal'],
        displayTexts: ['Mar', 'Mal'],
        details: { segments: ['m'] },
        evidence: 'DO NOT PARSE THIS TEXT',
      },
      {
        kind: 'matching-cadence-pattern',
        artifactIds: ['mar', 'mal'],
        displayTexts: ['Mar', 'Mal'],
        details: {
          cadence: 'balanced',
          stressPattern: ['primary'],
        },
        evidence: 'DO NOT PARSE THIS TEXT',
      },
    ];

    const html = renderRelationships(relationships);

    expect(html).toContain('Modeled sound patterns shared within this cast.');
    expect(html).toContain('One sound differs');
    expect(html).toContain('The names use different modeled sounds at position 3.');
    expect(html).toContain('Mar: r · Mal: l');
    expect(html).toContain('Same opening sound');
    expect(html).toContain('Opening sound: m');
    expect(html).toContain('Same rhythm and stress');
    expect(html).toContain('Cadence: balanced · Stress: primary');
    expect(html).not.toContain('first-syllable onset');
    expect(html).not.toContain('final-syllable coda');
    expect(html).not.toContain('segment sequence');
    expect(html).not.toContain('DO NOT PARSE THIS TEXT');
    expect(html).not.toContain('cast-health-status');
    expect(html).not.toContain('cast-health-item');
  });

  it('renders exact details for every relationship variant', () => {
    const relationships: readonly NameArtifactSoundRelationship[] = [
      {
        kind: 'one-segment-edit',
        artifactIds: ['ma', 'mar'],
        displayTexts: ['Ma', 'Mar'],
        details: {
          leftSegments: ['m', 'a'],
          rightSegments: ['m', 'a', 'r'],
          edit: { kind: 'insertion', index: 2, segment: 'r' },
        },
        evidence: 'unused',
      },
      {
        kind: 'one-segment-edit',
        artifactIds: ['mar', 'ma'],
        displayTexts: ['Mar', 'Ma'],
        details: {
          leftSegments: ['m', 'a', 'r'],
          rightSegments: ['m', 'a'],
          edit: { kind: 'deletion', index: 2, segment: 'r' },
        },
        evidence: 'unused',
      },
      {
        kind: 'identical-sound',
        artifactIds: ['mara', 'marah'],
        displayTexts: ['Mara', 'Marah'],
        details: { segments: ['m', 'a', 'r'] },
        evidence: 'unused',
      },
      {
        kind: 'shared-final-syllable',
        artifactIds: ['kali', 'moli'],
        displayTexts: ['Kali', 'Moli'],
        details: { segments: ['l', 'i'] },
        evidence: 'unused',
      },
      {
        kind: 'shared-coda',
        artifactIds: ['taren', 'molun'],
        displayTexts: ['Taren', 'Molun'],
        details: { segments: ['n'] },
        evidence: 'unused',
      },
    ];

    const html = renderRelationships(relationships);

    expect(html).toContain('Mar has one additional modeled sound at position 3.');
    expect(html).toContain('Added sound: r · m a → m a r');
    expect(html).toContain('Ma has one fewer modeled sound at position 3.');
    expect(html).toContain('Removed sound: r · m a r → m a');
    expect(html).toContain('Same modeled sound');
    expect(html).toContain('Sounds: m a r');
    expect(html).toContain('Same final syllable');
    expect(html).toContain('Final syllable: l i');
    expect(html).toContain('Same ending sound');
    expect(html).toContain('Ending sound: n');
  });
});
