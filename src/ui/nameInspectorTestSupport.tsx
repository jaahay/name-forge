import { renderToString } from 'react-dom/server';
import { createDefaultRegistry } from '../engine/registry';
import { generateEnsemble } from '../fictionCast/ensemble';
import type { FictionCastGeneratedName, FictionCastSettings } from '../fictionCast/types';
import { NameInspector } from './NameInspector';

export const nameInspectorSettings: FictionCastSettings = {
  castSize: 1,
  semanticBaseline: {
    familiarity: 'balanced',
    readability: 'clear',
    compactness: 'compact',
    spellingDistinctiveness: 'conventional',
  },
  stylePackId: 'british-literary-fantasy',
  seed: 'name-inspector-spelling-candidate-test',
  nameFormat: 'given-only',
};

export function fixtureName(overrides: Partial<FictionCastSettings> = {}): FictionCastGeneratedName {
  const ensemble = generateEnsemble({ ...nameInspectorSettings, ...overrides }, createDefaultRegistry());
  const [name] = ensemble.names;
  if (!name) throw new Error('Expected fixture ensemble to generate a name.');
  return name;
}

export function renderInspector(
  name: FictionCastGeneratedName,
  isLocked = false,
  inspectorSettings: FictionCastSettings = nameInspectorSettings,
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

export function normalizeRenderedHtml(html: string): string {
  return html.replace(/<!-- -->/g, '');
}
