import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { AboutView } from './AboutView';

describe('AboutView', () => {
  it('describes the current multi-mode product without turning About into control help', () => {
    const html = renderToString(<AboutView authorSiteUrl="https://jameshay.org/" />);

    expect(html).toContain('multi-mode random-name workbench');
    expect(html).toContain('Fiction Cast');
    expect(html).toContain('Game NPC');
    expect(html).toContain('deterministic randomness');
    expect(html).toContain('Generated evidence, not human claims');
    expect(html).toContain('Name Forge is about naming');
    expect(html).toContain('James Hay');
    expect(html).toContain('https://jameshay.org/');

    expect(html).not.toContain('What the dials mean');
    expect(html).not.toContain('Style preset');
    expect(html).not.toContain('Cast size');
    expect(html).not.toContain('What the diagnostic scores are for');
    expect(html).not.toContain('collapsed cards stay name-only');
  });
});
