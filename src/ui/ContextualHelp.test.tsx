import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ContextualHelp } from './ContextualHelp';

describe('ContextualHelp', () => {
  it('uses a native accessible disclosure without hover-only semantics or a second icon circle', () => {
    const html = renderToStaticMarkup(
      <ContextualHelp id="example-help" label="Example setting">
        <p>Short explanatory copy.</p>
      </ContextualHelp>,
    );

    expect(html).toContain('<details class="contextual-help">');
    expect(html).toContain('aria-label="About Example setting"');
    expect(html).toContain('aria-controls="example-help-content"');
    expect(html).toContain('id="example-help-content"');
    expect(html).toContain('role="note"');
    expect(html).toContain('class="contextual-help-glyph" aria-hidden="true">i</span>');
    expect(html).toContain('Short explanatory copy.');
    expect(html).not.toContain('title=');
    expect(html).not.toContain('<button');
  });
});
