import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { AboutView } from './AboutView';

describe('AboutView', () => {
  it('explains every generator dial and the overall fit score in plain language', () => {
    const html = renderToString(<AboutView authorSiteUrl="https://jameshay.org/" />);

    expect(html).toContain('What the dials mean');
    expect(html).toContain('Cast size');
    expect(html).toContain('Style preset');
    expect(html).toContain('Seed');
    expect(html).toContain('Novelty');
    expect(html).toContain('Pronounceability');
    expect(html).toContain('Memorability');
    expect(html).toContain('Cultural anchoring');
    expect(html).toContain('Orthographic weirdness');
    expect(html).toContain('Why scores often land in the 80s');
    expect(html).toContain('not a school grade');
    expect(html).toContain('strong fit for the current dials');
  });
});
