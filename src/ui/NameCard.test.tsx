import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { generateEnsemble } from '../engine/ensemble';
import { createDefaultRegistry } from '../engine/registry';
import type { GeneratedName, GenerationSettings } from '../engine/types';
import { rarityPresentation } from './presentation';
import { NameCard } from './NameCard';

const settings: GenerationSettings = {
  castSize: 2,
  novelty: 0.5,
  pronounceability: 0.7,
  memorability: 0.6,
  culturalAnchoring: 0.65,
  orthographicWeirdness: 0.25,
  stylePackId: 'british-literary-fantasy',
  seed: 'name-card-test-seed',
  nameFormat: 'mixed',
  rolePreset: 'classic-ensemble',
  roleInfluence: 'light',
};

function fixtureName(): GeneratedName {
  const ensemble = generateEnsemble(settings, createDefaultRegistry());
  const [name] = ensemble.names;

  if (!name) throw new Error('Expected fixture ensemble to generate at least one name.');

  return name;
}

function readStatusFor(name: GeneratedName): string {
  const noteCount = name.readabilityDiagnostics.length;
  if (noteCount === 0) return 'Clean read';
  return `${noteCount} read note${noteCount === 1 ? '' : 's'}`;
}

function renderCard(name: GeneratedName, isSelected: boolean): string {
  return renderToString(
    <NameCard
      name={name}
      isSelected={isSelected}
      isLocked={false}
      onSelect={() => undefined}
      onToggleLocked={() => undefined}
    />,
  );
}

describe('NameCard', () => {
  it('keeps collapsed cards to display-name text while retaining styling metadata as attributes', () => {
    const name = fixtureName();
    const html = renderCard(name, false);
    const rarity = rarityPresentation[name.silhouette.rarityBand];

    expect(html).toContain(name.name);
    expect(html).toContain('data-expanded="false"');
    expect(html).toContain(`data-rarity="${name.silhouette.rarityBand}"`);
    expect(html).toContain(`data-role="${name.role?.role ?? 'none'}"`);
    expect(html).not.toContain(rarity.label);
    expect(html).not.toContain(`${name.silhouette.syllableCount} syllables`);
    expect(html).not.toContain('Sound sketch');
    expect(html).not.toContain(name.sound.transcription);
    expect(html).not.toContain(readStatusFor(name));
    expect(html).not.toContain('name-card-expanded');
  });

  it('uses the selected card as the lightweight expanded surface with a sound hint and future playback affordance', () => {
    const name = fixtureName();
    const html = renderCard(name, true);

    expect(html).toContain(name.name);
    expect(html).toContain('data-expanded="true"');
    expect(html).toContain('name-card-expanded');
    expect(html).toContain('Sound sketch');
    expect(html).toContain(name.sound.transcription);
    expect(html).toContain(readStatusFor(name));
    expect(html).toContain('Sound playback planned');
    expect(html).not.toContain(`Play sound sketch for ${name.name} (coming soon)`);
    expect(html).not.toContain(`${name.silhouette.syllableCount} syllables`);
  });
});
