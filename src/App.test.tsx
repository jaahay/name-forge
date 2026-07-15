import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import App from './App';

describe('App', () => {
  it('renders the fiction cast workbench with collapsed Configure and shared artifact surfaces', () => {
    const html = renderToString(<App />);

    for (const expected of ['Name Forge', 'Fiction Cast', 'Configure criteria', 'Criteria summary', 'Tune criteria', 'Regenerate', 'Names', 'Name selection', 'Previous', 'Next', 'Inspect', 'Sound', 'Selected spelling', 'All same-sound spellings', 'Readability', 'Cast context', 'Generated shape', 'Cast health', 'Export']) {
      expect(html).toContain(expected);
    }

    for (const collapsed of ['Cast setup', 'Story roles', 'Criteria signals', 'Style pack', 'Cast variety', 'Advanced tuning', 'Shuffle feel']) {
      expect(html).not.toContain(collapsed);
    }

    for (const removed of ['Naming brief', 'Use context', 'Tone words', 'Desired associations', 'Avoid list', 'Hard constraints', 'Anchor examples', 'Brief notes', 'Brief influence', 'Brief cue']) {
      expect(html).not.toContain(removed);
    }
  });
});
