import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import App from './App';

describe('App', () => {
  it('renders the generation shell with the core controls, output regions, and project footer', () => {
    const html = renderToString(<App />);

    expect(html).toContain('Name Forge');
    expect(html).toContain('Cast size');
    expect(html).toContain('Style preset');
    expect(html).toContain('Generate cast');
    expect(html).toContain('Ensemble balance');
    expect(html).toContain('name-forge-001');
    expect(html).toContain('<details');
    expect(html).toContain('texture-');
    expect(html).toContain('Details');
    expect(html).toContain('Overall fit score');
    expect(html).toContain('Style fit');
    expect(html).toContain('Cast fit');
    expect(html).toContain('Source');
    expect(html).toContain('Changelog');
    expect(html).toContain('Errata');
    expect(html).toContain('Name Forge version');
    expect(html).toContain('0.1.0');
  });
});
