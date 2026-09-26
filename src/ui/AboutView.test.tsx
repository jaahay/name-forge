import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { AboutView } from './AboutView';

describe('AboutView', () => {
  it('describes the current multi-mode product and trust boundary', () => {
    const html = renderToString(<AboutView authorSiteUrl="https://jameshay.org/" />);

    expect(html).toContain('multi-mode random-name workbench');
    expect(html).toContain('Fiction Cast');
    expect(html).toContain('Game NPC');
    expect(html).toContain('deterministic randomness');
    expect(html).toContain('Generated evidence, not human claims');
    expect(html).toContain('Name Forge is about naming');
    expect(html).toContain('James Hay');
    expect(html).toContain('https://jameshay.org/');

  });
});
