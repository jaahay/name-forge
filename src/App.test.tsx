import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import App from './App';

describe('App', () => {
  it('renders the fiction cast mode shell with grouped controls, compact result browsing, selected details, export controls, and project chrome', () => {
    const html = renderToString(<App />);

    const expectedCopy = [
      'Name Forge',
      'Generator',
      'Changelog',
      'About',
      'Mode',
      'What are you naming?',
      'Fiction cast',
      'Build a coherent-but-distinct ensemble of fictional character names.',
      'Basics',
      'Fiction',
      'Rarity',
      'Cast size',
      'Decrease cast size',
      'Increase cast size',
      'Style preset',
      'Name format',
      'Mixed cast formats',
      'Initials + family',
      'Title + name',
      'Epithet/place-style',
      'Cast role mix',
      'Role influence',
      'Off',
      'Light',
      'Strong',
      'Roles label cast slots only; generation and scoring stay role-neutral.',
      'Role influence is opt-in.',
      'sound patterns',
      'Choose a role mix to reveal optional slot-by-slot overrides.',
      'Novelty value',
      'Randomize Novelty',
      'Randomize sliders',
      'Randomize seed',
      'Generate cast',
      'Ensemble balance',
      'Density',
      'Compact',
      'Comfortable',
      'Generated from',
      'View details',
      'Selected',
      'Selected name',
      'Details',
      'Texture',
      'Fit',
      'Export cast',
      'JSON',
      'Markdown',
      'Copy JSON',
      'Copy Markdown',
      'Show Markdown preview',
    ];
    const collapsedControlSectionSummaries = [
      'Mode',
      'Basics',
      'Fiction',
      'Rarity &amp; scoring',
    ];

    expect(html).toMatch(/Name Forge \/ .*Fiction cast.* mode/);

    for (const expected of expectedCopy) {
      expect(html).toContain(expected);
    }

    for (const summary of collapsedControlSectionSummaries) {
      expect(html).toMatch(new RegExp(`<details class="control-section"><summary>${summary}</summary>`));
    }

    expect(html).toContain('class="results-layout density-compact"');
    expect(html).toContain('aria-label="Generated names"');
    expect(html).toContain('class="name-detail-panel panel');
    expect(html).toContain('aria-label="Generation actions"');
    expect(html).toContain('aria-label="Result layout controls"');
    expect(html).not.toContain('<details class="control-section" open');
  });
});
