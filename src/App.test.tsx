import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import App from './App';

describe('App', () => {
  it('renders the fiction cast workbench with a coherent primary inspector', () => {
    const html = renderToString(<App />);

    for (const expected of ['Name Forge', 'Fiction Cast', 'Recent names', 'Configure criteria', 'Criteria summary', 'Tune criteria', 'Regenerate', 'Names', 'Name selection', 'Previous', 'Next', 'Inspect', 'Play name', 'Reroll', 'Sound', 'Spelling', 'More details', 'Cast context', 'Score detail', 'Cast health', 'Export']) {
      expect(html).toContain(expected);
    }

    for (const removed of ['Reroll this name', 'Selected spelling', 'Other spellings (', 'Top same-sound spellings', 'Spelling display cap', 'Pronunciation guide', 'Playback', 'Technical sound structure', 'Supported spellings', 'Generated shape', 'repeated initials']) {
      expect(html).not.toContain(removed);
    }

    for (const collapsed of ['Cast setup', 'Story roles', 'Criteria signals', 'Style pack', 'Cast variety', 'Advanced tuning', 'Shuffle feel']) {
      expect(html).not.toContain(collapsed);
    }

    for (const removed of ['Naming brief', 'Use context', 'Tone words', 'Desired associations', 'Avoid list', 'Hard constraints', 'Anchor examples', 'Brief notes', 'Brief influence', 'Brief cue']) {
      expect(html).not.toContain(removed);
    }
  });
});
