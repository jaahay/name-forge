import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import App from './App';

describe('App', () => {
  it('renders the fiction cast mode shell with top-level mode navigation, grouped controls, inline selected details, export controls, and project chrome', () => {
    const html = renderToString(<App />);

    const expectedCopy = [
      'Name Forge',
      'Product',
      'NPC',
      'Pen name',
      'Cast',
      'Changelog',
      'About',
      'Basics',
      'Fiction',
      'Name tuning',
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
      'Rarity distribution',
      'Novelty value',
      'Randomize Novelty',
      'Randomize sliders',
      'Randomize seed',
      'Generate',
      'Generated from',
      'View details',
      'Selected',
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
      'Basics',
      'Fiction',
      'Name tuning',
    ];

    expect(html).toMatch(/Name Forge \/ .*Fiction cast.* mode/);

    for (const expected of expectedCopy) {
      expect(html).toContain(expected);
    }

    for (const summary of collapsedControlSectionSummaries) {
      expect(html).toMatch(new RegExp(`<details class="control-section"><summary>${summary}</summary>`));
    }

    expect(html).toContain('aria-label="Naming modes"');
    expect(html).toContain('class="mode-tab active"');
    expect(html).toContain('class="name-grid has-selection"');
    expect(html).toContain('class="name-inline-detail"');
    expect(html).toContain('class="generation-context export-summary"');
    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain('aria-label="Generation actions"');
    expect(html).not.toContain('class="output-toolbar panel"');
    expect(html).not.toContain('<summary>Mode</summary>');
    expect(html).not.toContain('Density');
    expect(html).not.toContain('Comfortable');
    expect(html).not.toContain('<details class="control-section" open');
  });
});
