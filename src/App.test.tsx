import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import App from './App';

describe('App', () => {
  it('renders the generation shell with the core controls and output regions', () => {
    const html = renderToString(<App />);

    expect(html).toContain('Name Forge');
    expect(html).toContain('Cast size');
    expect(html).toContain('Style preset');
    expect(html).toContain('Generate cast');
    expect(html).toContain('Ensemble balance');
    expect(html).toContain('name-forge-001');
  });
});
