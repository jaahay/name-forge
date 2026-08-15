import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { generateEnsemble } from '../fictionCast/ensemble';
import type { FictionCastSettings } from '../fictionCast/types';
import { createDefaultRegistry } from '../engine/registry';
import { CastHealthPanel } from './CastHealth';
import { NameInspector } from './NameInspector';
import { NameSelectionSurface } from './NameSelectionSurface';
import { SoundRelationshipsPanel } from './SoundRelationshipsPanel';
import { resolveNameSelection, selectedNameIdFromView } from './workbenchSelection';

const settings: FictionCastSettings = {
  castSize: 2,
  novelty: 0.5,
  pronounceability: 0.7,
  memorability: 0.6,
  culturalAnchoring: 0.65,
  orthographicWeirdness: 0.25,
  stylePackId: 'british-literary-fantasy',
  seed: 'relationship-navigation-integration',
  nameFormat: 'mixed',
  rolePreset: 'classic-ensemble',
  roleInfluence: 'light',
};

type SoundRelationshipsElement = ReactElement<Parameters<typeof SoundRelationshipsPanel>[0]>;
type SelectButtonElement = ReactElement<{
  children?: ReactNode;
  onClick?: () => void;
  'aria-label'?: string;
}>;

function findSoundRelationshipsPanel(node: ReactNode): SoundRelationshipsElement | undefined {
  let found: SoundRelationshipsElement | undefined;

  Children.forEach(node, (child) => {
    if (found || !isValidElement(child)) return;
    if (child.type === SoundRelationshipsPanel) {
      found = child as SoundRelationshipsElement;
      return;
    }
    found = findSoundRelationshipsPanel((child.props as { children?: ReactNode }).children);
  });

  return found;
}

function collectSelectButtons(node: ReactNode, buttons: SelectButtonElement[] = []): SelectButtonElement[] {
  Children.forEach(node, (child) => {
    if (!isValidElement(child)) return;
    const element = child as SelectButtonElement;
    if (element.type === 'button') buttons.push(element);
    collectSelectButtons(element.props.children, buttons);
  });
  return buttons;
}

describe('sound relationship navigation integration', () => {
  it('routes a primary-sound relationship member through shared selection into the composed-name inspector', () => {
    const generated = generateEnsemble(settings, createDefaultRegistry());
    const left = generated.names[0];
    const right = generated.names[1];

    if (!left || !right) throw new Error('Expected two generated names with modeled sound.');

    const rightWithMatchingPrimarySound = {
      ...right,
      primaryName: {
        ...right.primaryName,
        sound: left.primaryName.sound,
      },
    };
    const ensemble = {
      ...generated,
      names: [left, rightWithMatchingPrimarySound],
    };
    const lockedNameIds = new Set<string>();
    let selectedId = '';
    const castHealth = CastHealthPanel({
      ensemble,
      lockedNameIds,
      onSelectName: (id) => {
        selectedId = id;
      },
    });
    const relationshipPanel = findSoundRelationshipsPanel(castHealth);

    expect(relationshipPanel).toBeDefined();
    if (!relationshipPanel) throw new Error('Expected Cast Health to render sound relationships.');

    const relationshipTree = SoundRelationshipsPanel(relationshipPanel.props);
    const buttons = collectSelectButtons(relationshipTree);
    const targetButton = buttons.find((button) => button.props['aria-label'] === `Select ${right.primaryName.name} from sound relationships`);

    expect(targetButton).toBeDefined();
    targetButton?.props.onClick?.();
    expect(selectedId).toBe(right.id);

    const selection = resolveNameSelection({ kind: 'name', nameId: selectedId }, ensemble, lockedNameIds);
    const selectedNameId = selectedNameIdFromView(selection);
    const selectedName = ensemble.names.find((name) => name.id === selectedNameId);

    expect(selectedName?.id).toBe(right.id);
    if (!selectedName) throw new Error('Expected relationship navigation to resolve an active-roster name.');

    const html = renderToStaticMarkup(
      <NameSelectionSurface
        ensemble={ensemble}
        lockedNameIds={lockedNameIds}
        selection={selection}
        selectedNameId={selectedNameId}
        hasPreviousName={true}
        hasNextName={false}
        onSelectName={() => {}}
        onSelectAllNames={() => {}}
        onSelectPreviousName={() => {}}
        onSelectNextName={() => {}}
        onToggleLockedName={() => {}}
      >
        <NameInspector
          name={selectedName}
          isLocked={false}
          onRerollName={() => {}}
          onToggleLockedName={() => {}}
        />
      </NameSelectionSurface>,
    );

    expect(html).toContain(`artifact-heading-${right.id}`);
    expect(html).toContain(`${right.displayName} selected-name actions`);
    expect(html).toContain(`aria-label="Reroll ${right.displayName}"`);
    expect(html).toContain('>Reroll</button>');
  });
});
