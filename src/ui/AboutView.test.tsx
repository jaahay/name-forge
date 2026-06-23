import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { AboutView } from './AboutView';

describe('AboutView', () => {
  it('explains every generator dial and the diagnostic score purpose in plain language', () => {
    const html = renderToString(<AboutView authorSiteUrl="https://jameshay.org/" />);

    expect(html).toContain('What the dials mean');
    expect(html).toContain('Cast size');
    expect(html).toContain('Style preset');
    expect(html).toContain('Seed');
    expect(html).toContain('Cast role mix');
    expect(html).toContain('Rarity distribution');
    expect(html).toContain('Card detail');
    expect(html).toContain('Rarity');
    expect(html).toContain('Readability');
    expect(html).toContain('Compactness');
    expect(html).toContain('Style closeness');
    expect(html).toContain('Spelling style');
    expect(html).not.toContain('Novelty');
    expect(html).not.toContain('Pronounceability');
    expect(html).not.toContain('Memorability');
    expect(html).not.toContain('Cultural anchoring');
    expect(html).not.toContain('Orthographic weirdness');
    expect(html).not.toContain('Naming brief');
    expect(html).not.toContain('Brief influence');
    expect(html).toContain('What the diagnostic scores are for');
    expect(html).toContain('not grades');
    expect(html).toContain('focuses on concrete traits instead of a headline score');
  });
});
