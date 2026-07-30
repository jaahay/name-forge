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

  it('renders typed edit, onset, and cadence details without parsing evidence prose', () => {
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

    expect(html).toContain('Sound relationships');
    expect(html).toContain('Exact modeled structure within the active cast roster.');
    expect(html).toContain('Mar and Mal');
    expect(html).toContain('Mar uses r where Mal uses l at position 3.');
    expect(html).toContain('Shared first-syllable onset: m.');
    expect(html).toContain('Matching modeled cadence and stress: balanced; primary.');
    expect(html).not.toContain('DO NOT PARSE THIS TEXT');
  });

  it('renders insertion, deletion, identical sound, final syllable, and coda details', () => {
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

    expect(html).toContain('Mar adds modeled segment r at position 3 relative to Ma.');
    expect(html).toContain('Ma removes modeled segment r at position 3 relative to Mar.');
    expect(html).toContain('Identical modeled segment sequence: m a r.');
    expect(html).toContain('Shared final modeled syllable: l i.');
    expect(html).toContain('Shared final-syllable coda: n.');
  });
});
