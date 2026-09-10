import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { createDefaultRegistry } from '../engine/registry';
import { generateEnsemble } from '../fictionCast/ensemble';
import type { FictionCastSettings } from '../fictionCast/types';
import { NameInspector } from './NameInspector';

const settings: FictionCastSettings = {
  castSize: 1,
  semanticBaseline: {
    familiarity: 'balanced',
    readability: 'clear',
    compactness: 'balanced',
    spellingDistinctiveness: 'conventional',
  },
  stylePackId: 'british-literary-fantasy',
  seed: 'additional-personal-inspector',
  nameFormat: 'given-additional-family',
  castVariation: 'balanced',
};

describe('NameInspector additional-personal identities', () => {
  it('promotes all three independently generated components', () => {
    const name = generateEnsemble(settings, createDefaultRegistry()).names[0];
    expect(name).toBeDefined();
    if (!name) throw new Error('Expected additional-personal identity.');

    const generatedComponents = name.identity.components.filter((component) => component.kind === 'generated');
    expect(generatedComponents).toHaveLength(3);

    const html = renderToString(
      <NameInspector
        name={name}
        baseline={settings.semanticBaseline}
        castVariation="balanced"
        stylePackLabel="British literary fantasy"
        isLocked={false}
        onRerollName={() => undefined}
        onToggleLockedName={() => undefined}
      />,
    );

    for (const component of generatedComponents) {
      expect(html).toContain(`<strong>${component.value}</strong>`);
    }
    const additional = generatedComponents.find((component) => component.role === 'additional-personal');
    expect(additional).toBeDefined();
    expect(html).toContain(`aria-label="Inspect additional personal component ${additional?.value}"`);
    expect(html).toContain('Given + additional name + family');
  });
});
