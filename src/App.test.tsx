import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import App from './App';

describe('App', () => {
  it('renders the fiction cast workbench with compact header, roster, selected-name inspector, export controls, and project chrome', () => {
    const html = renderToString(<App />);

    const expectedCopy = [
      'Name Forge',
      'Product',
      'NPC',
      'Pen name',
      'Cast',
      'Changelog',
      'About',
      'Cast setup',
      'Story roles',
      'Name feel',
      'Run options',
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
      'Shuffle Novelty',
      'Generation seed',
      'Reroll names',
      'Shuffle feel',
      'Generate',
      'Roster',
      'Generated names',
      'Pick a tile to inspect fit, construction, and role signals.',
      'Generated from',
      'Inspect',
      'In inspector',
      'Selection',
      'Profile',
      'Texture',
      'Fit scores',
      'Construction',
      'Export cast',
      'JSON',
      'Markdown',
      'Copy JSON',
      'Copy Markdown',
      'Show Markdown preview',
    ];
    const collapsedControlSectionSummaries = [
      'Cast setup',
      'Story roles',
      'Name feel',
      'Run options',
    ];

    expect(html).toMatch(/Name Forge \/ .*Fiction cast.* mode/);

    for (const expected of expectedCopy) {
      expect(html).toContain(expected);
    }

    for (const summary of collapsedControlSectionSummaries) {
      expect(html).toMatch(new RegExp(`<details class="control-section"><summary>${summary}</summary>`));
    }

    expect(html).toContain('class="hero panel app-header"');
    expect(html).toContain('class="workspace workbench"');
    expect(html).toContain('class="roster-panel panel"');
    expect(html).toContain('aria-label="Naming modes"');
    expect(html).toContain('class="mode-tab active"');
    expect(html).toContain('class="name-grid"');
    expect(html).toContain('class="selected-name-panel panel"');
    expect(html).toContain('class="selected-name-chips"');
    expect(html).toContain('class="inspector-summary"');
    expect(html).toContain('class="name-detail-grid"');
    expect(html).toContain('class="generation-context export-summary"');
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('aria-label="Generation actions"');
    expect(html).not.toContain('class="output-toolbar panel"');
    expect(html).not.toContain('class="name-grid has-selection"');
    expect(html).not.toContain('class="name-inline-detail"');
    expect(html).not.toContain('aria-expanded="true"');
    expect(html).not.toContain('Names that are random, usable, and cast-aware.');
    expect(html).not.toContain('Randomize sliders');
    expect(html).not.toContain('Randomize seed');
    expect(html).not.toContain('Randomize Novelty');
    expect(html).not.toContain('<summary>Basics</summary>');
    expect(html).not.toContain('<summary>Fiction</summary>');
    expect(html).not.toContain('<summary>Name tuning</summary>');
    expect(html).not.toContain('<summary>Mode</summary>');
    expect(html).not.toContain('Density');
    expect(html).not.toContain('Comfortable');
    expect(html).not.toContain('<details class="control-section" open');
  });
});
