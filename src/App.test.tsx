import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import App from './App';

describe('App', () => {
  it('renders the current Fiction Cast workbench hierarchy', () => {
    const html = renderToString(<App />);

    for (const expected of [
      'Name Forge',
      'Fiction Cast',
      'Recent names',
      'Generation',
      'Tune',
      'Regenerate',
      'Names',
      'Generated cast',
      'Inspect',
      'Play name',
      'Reroll',
      'Sound',
      'Spelling',
      'More details',
      'Cast context',
      'Score detail',
      'Cast review',
      'Export',
      'role="tablist"',
      'role="tabpanel"',
    ]) {
      expect(html).toContain(expected);
    }
  });
});
