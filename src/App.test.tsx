import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import App from './App';

describe('App', () => {
  it('renders the fiction cast workbench with collapsed Configure and selected-name artifact surfaces', () => {
    const html = renderToString(<App />);

    for (const expected of ['Name Forge', 'Fiction Cast', 'Configure run', 'Tune settings', 'Regenerate', 'Names', 'Name selection', 'Previous', 'Next', 'Inspect', 'Sound', 'Spelling', 'Cast context', 'Usability', 'Cast health', 'Export']) {
      expect(html).toContain(expected);
    }

    for (const collapsed of ['Cast setup', 'Story roles', 'Feel', 'Style pack', 'Cast variety', 'Advanced tuning', 'Generate', 'Shuffle feel']) {
      expect(html).not.toContain(collapsed);
    }

    for (const removed of ['Naming brief', 'Use context', 'Tone words', 'Desired associations', 'Avoid list', 'Hard constraints', 'Anchor examples', 'Brief notes', 'Brief influence', 'Brief cue']) {
      expect(html).not.toContain(removed);
    }
  });
});
