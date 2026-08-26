import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { generateEnsemble } from '../fictionCast/ensemble';
import type { FictionCastSettings } from '../fictionCast/types';
import { createDefaultRegistry } from '../engine/registry';
import { CastNotes } from './CastNotes';

type ButtonElement = ReactElement<{
  children?: ReactNode;
  onClick?: () => void;
  'aria-label'?: string;
}>;

const settings: FictionCastSettings = {
  castSize: 3,
  novelty: 0.5,
  pronounceability: 0.7,
  memorability: 0.6,
  culturalAnchoring: 0.65,
  orthographicWeirdness: 0.25,
  stylePackId: 'british-literary-fantasy',
  seed: 'cast-notes-test',
  nameFormat: 'given-family',
};

function collectButtons(node: ReactNode, buttons: ButtonElement[] = []): ButtonElement[] {
  Children.forEach(node, (child) => {
    if (!isValidElement(child)) return;
    const element = child as ButtonElement;
    if (element.type === 'button') buttons.push(element);
    collectButtons(element.props.children, buttons);
  });
  return buttons;
}

function generatedNames() {
  return generateEnsemble(settings, createDefaultRegistry()).names;
}

describe('CastNotes', () => {
  it('renders only conditional composed-identity collision notes', () => {
    const [first, second, third] = generatedNames();
    if (!first || !second || !third) throw new Error('Expected three generated names.');
    const names = [
      { ...first, displayName: 'Arlen Vale' },
      { ...second, displayName: 'Maren Hale' },
      { ...third, displayName: 'Tess Thorn' },
    ];

    const html = renderToStaticMarkup(<CastNotes names={names} onSelectName={() => {}} />);

    expect(html).toContain('<details class="cast-notes"');
    expect(html).toContain('Cast notes');
    expect(html).toContain('Shared ending “le”');
    expect(html).toContain('Inspect Arlen Vale from cast notes');
    expect(html).toContain('Inspect Maren Hale from cast notes');
    expect(html).not.toContain('Cast review');
    expect(html).not.toContain('Sound relationships');
    expect(html).not.toContain('⚠');
  });

  it('renders nothing when no supported collision exists', () => {
    const [first, second, third] = generatedNames();
    if (!first || !second || !third) throw new Error('Expected three generated names.');
    const names = [
      { ...first, displayName: 'Arlen Vale' },
      { ...second, displayName: 'Mira Thorn' },
      { ...third, displayName: 'Cedric Moss' },
    ];

    expect(CastNotes({ names, onSelectName: () => {} })).toBeNull();
  });

  it('routes an affected composed identity through its Cast id', () => {
    const [first, second, third] = generatedNames();
    if (!first || !second || !third) throw new Error('Expected three generated names.');
    const names = [
      { ...first, displayName: 'Arlen Vale' },
      { ...second, displayName: 'Maren Hale' },
      { ...third, displayName: 'Tess Thorn' },
    ];
    let selectedId = '';
    const tree = CastNotes({ names, onSelectName: (id) => { selectedId = id; } });
    const target = collectButtons(tree).find((button) => button.props['aria-label'] === 'Inspect Maren Hale from cast notes');

    expect(target).toBeDefined();
    target?.props.onClick?.();
    expect(selectedId).toBe(second.id);
  });
});
