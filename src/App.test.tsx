import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import App from './App';

describe('App', () => {
  it('renders the fiction cast workbench without naming brief controls', () => {
    const html = renderToString(<App />);
    for (const expected of ['Name Forge', 'Fiction Cast', 'Cast setup', 'Story roles', 'Feel', 'Style pack', 'Cast variety', 'Rarity', 'Readability', 'Advanced tuning', 'Generate', 'Shuffle feel', 'Cast health', 'Export']) {
      expect(html).toContain(expected);
    }
    for (const removed of ['Naming brief', 'Use context', 'Tone words', 'Desired associations', 'Avoid list', 'Hard constraints', 'Anchor examples', 'Brief notes', 'Brief influence', 'Brief cue']) {
      expect(html).not.toContain(removed);
    }
  });
});
