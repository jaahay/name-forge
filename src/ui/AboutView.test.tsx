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
    expect(html).toContain('Novelty');
    expect(html).toContain('Pronounceability');
    expect(html).toContain('Memorability');
    expect(html).toContain('Cultural anchoring');
    expect(html).toContain('Orthographic weirdness');
    expect(html).toContain('What the diagnostic scores are for');
    expect(html).toContain('not grades');
    expect(html).toContain('focuses on concrete traits instead of a headline score');
  });
});
