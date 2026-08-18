import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { generateEnsemble } from '../fictionCast/ensemble';
import type { FictionCastSettings } from '../fictionCast/types';
import { createDefaultRegistry } from '../engine/registry';
import { NameSelectionSurface, nameRailTargetIndex } from './NameSelectionSurface';

const settings: FictionCastSettings = {
  castSize: 3,
  novelty: 0.5,
  pronounceability: 0.7,
  memorability: 0.6,
  culturalAnchoring: 0.65,
  orthographicWeirdness: 0.25,
  stylePackId: 'british-literary-fantasy',
  seed: 'adaptive-name-rail-test',
  nameFormat: 'mixed',
  rolePreset: 'classic-ensemble',
  roleInfluence: 'light',
};

describe('NameSelectionSurface adaptive rail', () => {
  it('renders one horizontal tab per cast identity with one active workspace', () => {
    const ensemble = generateEnsemble(settings, createDefaultRegistry());
    const selectedName = ensemble.names[1];
    const lockedName = ensemble.names[2];

    if (!selectedName || !lockedName) throw new Error('Expected three generated fixture names.');

    const html = renderToStaticMarkup(
      <NameSelectionSurface
        ensemble={ensemble}
        lockedNameIds={new Set([lockedName.id])}
        selectedNameId={selectedName.id}
        onSelectName={() => {}}
      >
        <div>Active workspace</div>
      </NameSelectionSurface>,
    );

    expect((html.match(/role="tab"/g) ?? [])).toHaveLength(ensemble.names.length);
    expect(html).toContain('role="tablist"');
    expect(html).toContain('aria-orientation="horizontal"');
    for (const name of ensemble.names) {
      expect(html).toContain(`id="name-rail-tab-${name.id}"`);
      expect(html).toContain(`title="${name.displayName}"`);
    }
    expect(html).toContain(`id="name-rail-tab-${selectedName.id}"`);
    expect(html).toContain('aria-selected="true"');
    expect(html).toContain(`aria-label="${lockedName.displayName}, locked"`);
    expect(html).toContain('data-locked="true"');
    expect(html).toContain('role="tabpanel"');
    expect(html).toContain('id="active-name-workspace"');
    expect(html).toContain(`aria-labelledby="name-rail-tab-${selectedName.id}"`);
    expect(html).toContain('Active workspace');
  });

  it('maps Left/Right and Home/End to immediate peer navigation with edge wrapping', () => {
    expect(nameRailTargetIndex('ArrowRight', 0, 3)).toBe(1);
    expect(nameRailTargetIndex('ArrowRight', 2, 3)).toBe(0);
    expect(nameRailTargetIndex('ArrowLeft', 0, 3)).toBe(2);
    expect(nameRailTargetIndex('ArrowLeft', 2, 3)).toBe(1);
    expect(nameRailTargetIndex('Home', 2, 3)).toBe(0);
    expect(nameRailTargetIndex('End', 0, 3)).toBe(2);
    expect(nameRailTargetIndex('Enter', 1, 3)).toBeUndefined();
  });

  it('does not navigate when the current index or cast size is invalid', () => {
    expect(nameRailTargetIndex('ArrowRight', -1, 3)).toBeUndefined();
    expect(nameRailTargetIndex('ArrowLeft', 3, 3)).toBeUndefined();
    expect(nameRailTargetIndex('Home', 0, 0)).toBeUndefined();
  });
});
